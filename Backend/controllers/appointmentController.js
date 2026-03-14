const mongoose = require("mongoose");
const axios = require("axios");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const Appointment = require("../models/Appointment");
const { notifyUser } = require("../utils/notify");

// ── Khalti: initiate payment ──────────────────────────────
// POST /api/appointments/khalti/initiate { slotId }
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const now = new Date();

    // release expired hold first
    await AvailabilitySlot.updateOne(
      { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
      { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
    );

    const slot = await AvailabilitySlot.findOne({
      _id: slotId,
      status: "held",
      heldBy: userId,
      holdExpiresAt: { $gt: now },
    }).populate("expert", "firstName lastName");

    if (!slot) {
      return res.status(409).json({ message: "Hold expired or slot not held by you" });
    }

    // free slots skip payment — go straight to confirm
    if (!slot.fee || slot.fee === 0) {
      return res.json({ free: true, slotId: String(slot._id) });
    }

    const amountPaisa = slot.fee * 100; // Khalti uses paisa

    const payload = {
      return_url: `${process.env.CLIENT_URL}/appointments/payment-verify`,
      website_url: process.env.CLIENT_URL,
      amount: amountPaisa,
      purchase_order_id: `slot_${slotId}_user_${userId}`,
      purchase_order_name: `Appointment with ${slot.expert?.firstName} ${slot.expert?.lastName}`,
      customer_info: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
      },
    };

    const response = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epay/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      free: false,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (err) {
    console.error("KHALTI INITIATE ERROR:", err?.response?.data || err.message);
    return res.status(500).json({ message: "Failed to initiate payment" });
  }
};

// ── Khalti: verify payment + create appointment ───────────
// POST /api/appointments/khalti/verify { pidx, slotId }
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pidx, slotId } = req.body;
    if (!pidx || !slotId) return res.status(400).json({ message: "pidx and slotId required" });

    // verify with Khalti
    const verification = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epay/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, total_amount } = verification.data;

    if (status !== "Completed") {
      return res.status(400).json({ message: `Payment not completed. Status: ${status}` });
    }

    // now create the appointment
    const appointment = await _createAppointment(req, userId, slotId, {
      status: "paid",
      amount: total_amount / 100,
      currency: "NPR",
      khaltiPidx: pidx,
    });

    return res.status(201).json({ message: "Payment verified & booking confirmed", appointment });
  } catch (err) {
    console.error("KHALTI VERIFY ERROR:", err?.response?.data || err.message);
    return res.status(500).json({ message: err.message || "Verification failed" });
  }
};

// ── Confirm booking (free slots) ──────────────────────────
// POST /api/appointments/confirm { slotId, userNotes? }
exports.confirmBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId, userNotes } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const appointment = await _createAppointment(req, userId, slotId, {
      status: "unpaid",
      amount: 0,
      currency: "NPR",
    }, userNotes);

    return res.status(201).json({ message: "Booking confirmed", appointment });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "Server error" });
  }
};

// ── Shared appointment creation logic ─────────────────────
async function _createAppointment(req, userId, slotId, paymentData, userNotes = "") {
  const session = await mongoose.startSession();
  let appointment = null;

  try {
    await session.withTransaction(async () => {
      const now = new Date();

      await AvailabilitySlot.updateOne(
        { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
        { $set: { status: "open", heldBy: null, holdExpiresAt: null } },
        { session }
      );

      const slot = await AvailabilitySlot.findOne({
        _id: slotId,
        status: "held",
        heldBy: userId,
        holdExpiresAt: { $gt: now },
      }).session(session);

      if (!slot) {
        const e = new Error("Hold expired or slot not held by you");
        e.statusCode = 409;
        throw e;
      }

      const created = await Appointment.create(
        [{
          user: userId,
          expert: slot.expert,
          slot: slot._id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          durationMins: slot.durationMins || 50,
          userNotes,
          payment: {
            status: paymentData.status,
            amount: paymentData.amount ?? slot.fee ?? 0,
            currency: paymentData.currency || slot.currency || "NPR",
            provider: paymentData.khaltiPidx ? "khalti" : "",
            reference: paymentData.khaltiPidx || "",
          },
        }],
        { session }
      );

      appointment = created[0];

      await AvailabilitySlot.updateOne(
        { _id: slot._id, status: "held", heldBy: userId },
        {
          $set: { status: "booked", bookedBy: userId, appointment: appointment._id },
          $unset: { heldBy: "", holdExpiresAt: "" },
        },
        { session }
      );
    });

    // notify expert
    await notifyUser(req, appointment.expert, {
      type: "appointment_new",
      title: "New appointment booked",
      message: "A user booked an appointment with you.",
      link: "/appointments",
      meta: { appointmentId: String(appointment._id) },
    });

    // notify user
    await notifyUser(req, userId, {
      type: "appointment_new",
      title: "Booking confirmed",
      message: "Your appointment has been confirmed.",
      link: "/appointments",
      meta: { appointmentId: String(appointment._id) },
    });

    const io = req.app.get("io");
    if (io && appointment) {
      const evt = {
        appointmentId: String(appointment._id),
        slotId: String(appointment.slot),
        userId: String(appointment.user),
        expertId: String(appointment.expert),
        startAt: appointment.startAt,
        endAt: appointment.endAt,
      };
      io.to(`user_${evt.userId}`).emit("appointment:new", evt);
      io.to(`user_${evt.expertId}`).emit("appointment:new", evt);
      io.to(`user_${evt.userId}`).emit("slot:update", { slotId: evt.slotId, status: "booked" });
      io.to(`user_${evt.expertId}`).emit("slot:update", { slotId: evt.slotId, status: "booked" });
    }

    return appointment;
  } finally {
    session.endSession();
  }
}

function buildViewFilter(view, now) {
  if (view === "upcoming") return { endAt: { $gte: now } };
  if (view === "past") return { endAt: { $lt: now } };
  return {};
}

// USER: my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const view = String(req.query.view || "upcoming");
    const now = new Date();
    const sort = view === "upcoming" ? { startAt: 1 } : { startAt: -1 };

    const list = await Appointment.find({ user: userId, ...buildViewFilter(view, now) })
      .populate("expert", "firstName lastName email expertise")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort(sort);

    return res.json({ appointments: list });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT: my appointments
exports.getExpertAppointments = async (req, res) => {
  try {
    const expertId = req.user._id;
    const view = String(req.query.view || "upcoming");
    const now = new Date();
    const sort = view === "upcoming" ? { startAt: 1 } : { startAt: -1 };

    const list = await Appointment.find({ expert: expertId, ...buildViewFilter(view, now) })
      .populate("user", "firstName lastName email")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort(sort);

    return res.json({ appointments: list });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// Mock payment verify (sandbox only)
exports.mockVerifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const appointment = await _createAppointment(req, userId, slotId, {
      status: "paid",
      amount: 0, // will use slot.fee inside _createAppointment
      currency: "NPR",
      khaltiPidx: "mock_" + Date.now(),
    });

    return res.status(201).json({ message: "Mock payment verified", appointment });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "Server error" });
  }
};