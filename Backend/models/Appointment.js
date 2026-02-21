// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    slot: { type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot", required: true, unique: true },

    // store in UTC
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },

    durationMins: { type: Number, default: 50 },
    
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },

    // payment placeholder for later
    payment: {
      provider: { type: String, default: "" },
      status: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "NPR" },
      reference: { type: String, default: "" },
    },

    userNotes: { type: String, default: "" },
    expertNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
