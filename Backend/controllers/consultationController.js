// controllers/consultationController.js
const ConsultationRequest = require("../models/ConsultationRequest");
const User = require("../models/User");
const { notifyUser } = require("../utils/notify");

// USER -> CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { expertId, reason } = req.body;

    if (!expertId || !reason?.trim()) {
      return res.status(400).json({ message: "expertId and reason are required" });
    }

    const expert = await User.findById(expertId).select("_id role");
    if (!expert || expert.role !== "expert") {
      return res.status(404).json({ message: "Expert not found" });
    }

    // Create request
    let request;
    try {
      request = await ConsultationRequest.create({
        user: req.user._id,
        expert: expertId,
        reason: reason.trim(),
      });
    } catch (err) {
      // duplicate pending request
      if (err?.code === 11000) {
        return res.status(409).json({
          message: "You already have a pending request for this expert",
        });
      }
      throw err;
    }

    // Notification to expert (DB + socket: notification:new)
    await notifyUser(req, String(expertId), {
      type: "consultation_new",
      title: "New consultation request",
      message: "You received a new consultation request. Open Inbox to respond.",
      link: "/inbox",
      meta: { requestId: String(request._id) },
    });

    return res.status(201).json({
      message: "Request sent successfully",
      request,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// USER -> MY REQUESTS
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ user: req.user._id })
      .populate("expert", "firstName lastName expertise email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT -> REQUESTS SENT TO ME
exports.getRequestsForExpert = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ expert: req.user._id })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT -> UPDATE STATUS / REPLY
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, expertReply } = req.body;
    const { id } = req.params;

    const request = await ConsultationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (String(request.expert) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!["accepted", "rejected", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    request.status = status;

    // expertReply can be "" or undefined; only set if provided
    if (expertReply !== undefined) {
      request.expertReply = expertReply;
    }

    await request.save();

    // fetch names for dynamic messages
    const expertDoc = await User.findById(request.expert).select("firstName lastName");
    const expertName = expertDoc
      ? `${expertDoc.firstName} ${expertDoc.lastName}`.trim()
      : "Expert";

    const userDoc = await User.findById(request.user).select("firstName lastName email");
    const userName = userDoc
      ? `${userDoc.firstName} ${userDoc.lastName}`.trim()
      : "User";

    const hasReply = typeof expertReply === "string" && expertReply.trim().length > 0;

    // build dynamic notifications (what user asked)
    let userNotif = { type: "", title: "", message: "", link: "/inbox" };
    let expertNotif = { type: "", title: "", message: "", link: "/inbox" };

    if (hasReply) {
      userNotif = {
        type: "consultation_reply",
        title: `You got a New reply from ${expertName}`,
        message: `${expertName} has replied to your consultation request. Open Inbox to view.`,
        link: "/inbox",
      };

      expertNotif = {
        type: "consultation_reply_sent",
        title: `Reply sent to ${userName}`,
        message: `Your reply was sent to ${userName}. Open Inbox to view details.`,
        link: "/inbox",
      };
    } else {
      if (status === "accepted") {
        userNotif = {
          type: "consultation_accepted",
          title: `Consultation accepted by ${expertName}`,
          message: `${expertName} has accepted your consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
        expertNotif = {
          type: "consultation_accepted",
          title: "Consultation accepted",
          message: `You have accepted ${userName}'s consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
      } else if (status === "rejected") {
        userNotif = {
          type: "consultation_rejected",
          title: `Consultation rejected by ${expertName}`,
          message: `${expertName} has rejected your consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
        expertNotif = {
          type: "consultation_rejected",
          title: "Consultation rejected",
          message: `You have rejected ${userName}'s consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
      } else {
        // closed
        userNotif = {
          type: "consultation_closed",
          title: `Consultation closed by ${expertName}`,
          message: `${expertName} has closed your consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
        expertNotif = {
          type: "consultation_closed",
          title: "Consultation closed",
          message: `You have closed ${userName}'s consultation request. Open Inbox to view details.`,
          link: "/inbox",
        };
      }
    }

    // IMPORTANT: actually use the dynamic notifications
    await notifyUser(req, String(request.user), {
      ...userNotif,
      meta: { requestId: String(request._id) },
    });

    await notifyUser(req, String(request.expert), {
      ...expertNotif,
      meta: { requestId: String(request._id) },
    });

    // socket events for inbox realtime updates
    const io = req.app.get("io");
    if (io) {
      const payload = {
        requestId: request._id,
        status: request.status,
        expertReply: request.expertReply || "",
        updatedAt: request.updatedAt,
        event: hasReply ? "reply" : status, // helps frontend show better UI if needed
      };

      io.to(`user_${String(request.user)}`).emit("consultation:update", payload);
      io.to(`user_${String(request.expert)}`).emit("consultation:update", payload);
    }

    return res.json({ message: "Request updated", request });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};