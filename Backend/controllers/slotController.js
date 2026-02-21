const mongoose = require("mongoose");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const { nepalDayToUtcRange } = require("../utils/timeNepal");
const Appointment = require("../models/Appointment");

const TZ = "Asia/Kathmandu";

// Nepal dayKey: "YYYY-MM-DD" -> UTC range [startOfDayInNepal, endOfDayInNepal)
function nepalDayKeyToUtcRange(dayKey) {
  // Example: dayKey = "2026-02-18"
  // We want:
  // Nepal 00:00 -> UTC previous day 18:15
  // Nepal 24:00 -> UTC same day 18:15
  // Nepal is UTC+05:45
  const [y, m, d] = dayKey.split("-").map(Number);
  if (!y || !m || !d) return null;

  // Nepal midnight in UTC = Date.UTC(y,m-1,d,0,0,0) - 5:45
  const offsetMs = (5 * 60 + 45) * 60 * 1000;

  const startUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMs);
  const endUtc = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0) - offsetMs);

  return { startUtc, endUtc };
}

// ✅ expert: list my slots (all)
exports.listMySlots = async (req, res) => {
  try {
    const expertId = req.user._id;
    const slots = await AvailabilitySlot.find({ expert: expertId }).sort({ startAt: 1 });
    return res.json({ slots });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ user: list an expert's OPEN slots + MY HELD (unexpired)
exports.listExpertSlots = async (req, res) => {
  try {
    const { expertId } = req.params;
    const now = new Date();
    const userId = req.user?._id;

    // 1) auto-release expired holds
    await AvailabilitySlot.updateMany(
      { status: "held", holdExpiresAt: { $lte: now } },
      { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
    );

    // 2) buffer
    const bufferMins = Number(process.env.SLOT_LIST_BUFFER_MINUTES || 5);
    const afterTime = new Date(now.getTime() - bufferMins * 60 * 1000);

    // 3) optional date filter
    const dayKey = String(req.query.date || "").trim();
    let dateRange = null;

    if (dayKey) {
      dateRange = nepalDayKeyToUtcRange(dayKey);
      if (!dateRange) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
    }

    // build time filter
    const timeFilter = dateRange
      ? { $gte: dateRange.startUtc, $lt: dateRange.endUtc }
      : { $gt: afterTime };

    const slots = await AvailabilitySlot.find({
      expert: expertId,
      startAt: timeFilter,
      $or: [
        { status: "open" },
        { status: "held", heldBy: userId, holdExpiresAt: { $gt: now } }, // ✅ keep MY held visible
      ],
    }).sort({ startAt: 1 });

    return res.json({ slots });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ expert: create slots
exports.createSlots = async (req, res) => {
  try {
    const expertId = req.user._id;
    const { slots } = req.body; // [{ startAt, endAt, fee, currency, notes }]

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "slots array required" });
    }

    const docs = slots.map((s) => ({
      expert: expertId,
      startAt: new Date(s.startAt),
      endAt: new Date(s.endAt),
      fee: s.fee ?? 0,
      currency: s.currency ?? "NPR",
      notes: s.notes ?? "",
      durationMins: 50,
      status: "open",
    }));

    const created = await AvailabilitySlot.insertMany(docs, { ordered: false }).catch((err) => {
      // allow duplicate key errors
      if (err?.writeErrors) return err.insertedDocs || [];
      throw err;
    });

    return res.status(201).json({ message: "Slots created", slots: created });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ user: hold an OPEN slot atomically
exports.holdSlot = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.params;

    const now = new Date();
    const holdMins = Number(process.env.SLOT_HOLD_MINUTES || 5);
    const holdExpiresAt = new Date(now.getTime() + holdMins * 60 * 1000);

    // auto-release this slot if expired (optional but good)
    await AvailabilitySlot.updateOne(
      { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
      { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
    );

    const slot = await AvailabilitySlot.findOneAndUpdate(
      {
        _id: slotId,
        status: "open",
        startAt: { $gt: now },
      },
      {
        $set: { status: "held", heldBy: userId, holdExpiresAt },
      },
      { new: true }
    );

    if (!slot) return res.status(409).json({ message: "Slot not available" });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${String(slot.expert)}`).emit("slot:update", {
        slotId: String(slot._id),
        status: "held",
        heldBy: String(userId),
        holdExpiresAt: slot.holdExpiresAt,
      });
      io.to(`user_${String(userId)}`).emit("slot:update", {
        slotId: String(slot._id),
        status: "held",
        heldBy: String(userId),
        holdExpiresAt: slot.holdExpiresAt,
      });
    }

    return res.json({ message: "Slot held", slot });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// === Transcation Model FOR LATER!!! ===
// exports.confirmSlot = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const userId = req.user._id;
//     const { slotId } = req.params;
//     const now = new Date();

//     let appointment = null;

//     await session.withTransaction(async () => {
//       const slot = await AvailabilitySlot.findOne({
//         _id: slotId,
//         status: "held",
//         heldBy: userId,
//         holdExpiresAt: { $gt: now },
//       }).session(session);

//       if (!slot) {
//         const e = new Error("Hold expired or slot not held by you");
//         e.statusCode = 409;
//         throw e;
//       }

//       const created = await Appointment.create(
//         [
//           {
//             user: userId,
//             expert: slot.expert,
//             slot: slot._id,
//             startAt: slot.startAt,
//             endAt: slot.endAt,
//             durationMins: slot.durationMins || 50,
//             payment: {
//               status: "unpaid",
//               amount: slot.fee || 0,
//               currency: slot.currency || "NPR",
//             },
//           },
//         ],
//         { session }
//       );

//       appointment = created[0];

//       await AvailabilitySlot.updateOne(
//         { _id: slot._id },
//         {
//           $set: {
//             status: "booked",
//             bookedBy: userId,
//             appointment: appointment._id,
//           },
//           $unset: { heldBy: "", holdExpiresAt: "" },
//         },
//         { session }
//       );
//     });

//     // socket notify
//     const io = req.app.get("io");
//     if (io && appointment) {
//       io.to(`user_${String(appointment.expert)}`).emit("appointment:new", { appointmentId: String(appointment._id) });
//       io.to(`user_${String(appointment.user)}`).emit("appointment:new", { appointmentId: String(appointment._id) });

//       io.to(`user_${String(appointment.expert)}`).emit("slot:update", { slotId: String(slotId), status: "booked" });
//       io.to(`user_${String(appointment.user)}`).emit("slot:update", { slotId: String(slotId), status: "booked" });
//     }

//     return res.status(201).json({ message: "Booking confirmed", appointment });
//   } catch (err) {
//     return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
//   } finally {
//     session.endSession();
//   }
// };

// DEMO
exports.confirmSlot = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.params;
    const now = new Date();

    const slot = await AvailabilitySlot.findOne({
      _id: slotId,
      status: "held",
      heldBy: userId,
      holdExpiresAt: { $gt: now },
    });

    if (!slot) {
      return res.status(409).json({ message: "Hold expired or slot not held by you" });
    }

    const appointment = await Appointment.create({
      user: userId,
      expert: slot.expert,
      slot: slot._id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMins: slot.durationMins || 50,
      payment: {
        status: "unpaid",
        amount: slot.fee || 0,
        currency: slot.currency || "NPR",
      },
    });

    await AvailabilitySlot.updateOne(
      { _id: slot._id },
      {
        $set: {
          status: "booked",
          bookedBy: userId,
          appointment: appointment._id,
        },
        $unset: { heldBy: "", holdExpiresAt: "" },
      }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${String(slot.expert)}`).emit("appointment:new", {
        appointmentId: String(appointment._id),
      });

      io.to(`user_${String(userId)}`).emit("appointment:new", {
        appointmentId: String(appointment._id),
      });

      io.to(`user_${String(slot.expert)}`).emit("slot:update", {
        slotId: String(slot._id),
        status: "booked",
      });

      io.to(`user_${String(userId)}`).emit("slot:update", {
        slotId: String(slot._id),
        status: "booked",
      });
    }

    return res.status(201).json({
      message: "Booking confirmed",
      appointment,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};