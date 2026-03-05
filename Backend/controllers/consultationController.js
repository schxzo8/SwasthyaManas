const ConsultationRequest = require("../models/ConsultationRequest");
const User = require("../models/User");
const { notify } = require("../routes/appointmentRoutes");
const { notifyUser } = require("../utils/notify");

// USER -> CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { expertId, reason } = req.body;

    if (!expertId || !reason) {
      return res.status(400).json({ message: "expertId and reason are required" });
    }

    const expert = await User.findById(expertId);
    if (!expert || expert.role !== "expert") {
      return res.status(404).json({ message: "Expert not found" });
    }

    // Prevent duplicates pending with same expert (optional but helpful)
    const existing = await ConsultationRequest.findOne({
      user: req.user._id,
      expert: expertId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending request for this expert" });
    }

    const request = await ConsultationRequest.create({
      user: req.user._id,
      expert: expertId,
      reason,
    });

    // notify user
    await notifyUser(req, String(expertId), {
      type: "consultation_new",
      title: "New consultation request",
      message: "You received a new consultation request. Open Inbox to respond.",
      link: "/inbox",
      meta: { requestId: String(request._id) },
    });

    res.status(201).json({ message: "Request sent successfully", request });
    const io = req.app.get("io");
    const room = `user_${String(expertId)}`;
    console.log("📤 emitting consultation:new to", room, "size:", io.sockets.adapter.rooms.get(room)?.size || 0);
    if (io) {
      io.to(`user_${String(expertId)}`).emit("consultation:new", {
        requestId: request._id,
        userId: String(req.user._id),
        reason,
        createdAt: request.createdAt,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// USER -> MY REQUESTS
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ user: req.user._id })
      .populate("expert", "firstName lastName expertise email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// EXPERT -> REQUESTS SENT TO ME
exports.getRequestsForExpert = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ expert: req.user._id })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// EXPERT -> UPDATE STATUS (accept/reject/close)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, expertReply } = req.body;
    const { id } = req.params;

    const request = await ConsultationRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only assigned expert can update
    if (String(request.expert) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!["accepted", "rejected", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    request.status = status;

    // allow empty string too, but only if field is present in body
    if (expertReply !== undefined) {
      request.expertReply = expertReply;
    }

    await request.save();

    // notify user about status change
    await notifyUser(req, String(request.user), {
      type: "consultation_update",
      title: "Consultation updated",
      message: `Your consultation request has been ${status}.`,
      link: "/inbox",
      meta: { requestId: String(request._id) },
    });

    await notifyUser(req, String(request.expert), {
      type: "consultation_update",
      title: "Consultation updated",
      message: `You have ${status} a consultation request.`,
      link: "/inbox",
      meta: { requestId: String(request._id) },
    });

    const io = req.app.get("io");
    if (io) {
      const payload = {
        requestId: request._id,
        status: request.status,
        expertReply: request.expertReply || "",
        updatedAt: request.updatedAt,
      };

      // notify user
      io.to(`user_${String(request.user)}`).emit("consultation:update", payload);

      // notify expert
      io.to(`user_${String(request.expert)}`).emit("consultation:update", payload);
    }


    return res.json({ message: "Request updated", request });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

