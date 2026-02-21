// models/AvailabilitySlot.js
const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema(
  {
    expert: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Store time in UTC to avoid timezone chaos.
    // You can convert in UI to user's timezone.
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },

    durationMins: { type: Number, default: 50}, // fixed for now

    // slot state machine
    status: {
      type: String,
      enum: ["open", "held", "booked", "cancelled"],
      default: "open",
      index: true,
    },

    // if held
    heldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    holdExpiresAt: { type: Date, default: null },

    // if booked
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },

    // optional metadata
    notes: { type: String, default: "" },
    fee: { type: Number, default: 0 }, // keep for later payment
    currency: { type: String, default: "NPR" },
  },
  { timestamps: true }
);

// Prevent duplicates for same expert + exact start time
availabilitySlotSchema.index({ expert: 1, startAt: 1 }, { unique: true });

module.exports = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
