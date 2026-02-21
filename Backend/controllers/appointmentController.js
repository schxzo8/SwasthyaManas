const mongoose = require("mongoose");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const Appointment = require("../models/Appointment");

// USER: confirm booking
// POST /api/appointments/confirm { slotId, userNotes? }
exports.confirmBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user._id;
    const { slotId, userNotes } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const now = new Date();
    let appointment = null;

    await session.withTransaction(async () => {
      // release expired hold on this slot
      await AvailabilitySlot.updateOne(
        { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
        { $set: { status: "open", heldBy: null, holdExpiresAt: null } },
        { session }
      );

      // must be held by this user
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

      // create appointment (slot unique prevents double confirm)
      const created = await Appointment.create(
        [
          {
            user: userId,
            expert: slot.expert,
            slot: slot._id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            durationMins: slot.durationMins || 50,
            userNotes: userNotes || "",
            payment: {
              status: "unpaid",
              amount: slot.fee || 0,
              currency: slot.currency || "NPR",
            },
          },
        ],
        { session }
      );

      appointment = created[0];

      // mark slot booked
      await AvailabilitySlot.updateOne(
        { _id: slot._id, status: "held", heldBy: userId },
        {
          $set: {
            status: "booked",
            bookedBy: userId,
            appointment: appointment._id,
          },
          $unset: { heldBy: "", holdExpiresAt: "" },
        },
        { session }
      );
    });

    const io = req.app.get("io");
    if (io && appointment) {
      const payload = {
        appointmentId: String(appointment._id),
        slotId: String(appointment.slot),
        userId: String(appointment.user),
        expertId: String(appointment.expert),
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status,
      };

      io.to(`user_${payload.userId}`).emit("appointment:new", payload);
      io.to(`user_${payload.expertId}`).emit("appointment:new", payload);

      io.to(`user_${payload.userId}`).emit("slot:update", { slotId: payload.slotId, status: "booked" });
      io.to(`user_${payload.expertId}`).emit("slot:update", { slotId: payload.slotId, status: "booked" });
    }

    return res.status(201).json({ message: "Booking confirmed", appointment });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "Server error" });
  } finally {
    session.endSession();
  }
};

// USER: my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = await Appointment.find({ user: userId })
      .populate("expert", "firstName lastName email expertise")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort({ startAt: 1 });

    return res.json({ appointments: list });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT: my appointments
exports.getExpertAppointments = async (req, res) => {
  try {
    const expertId = req.user._id;
    const list = await Appointment.find({ expert: expertId })
      .populate("user", "firstName lastName email")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort({ startAt: 1 });

    return res.json({ appointments: list });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
