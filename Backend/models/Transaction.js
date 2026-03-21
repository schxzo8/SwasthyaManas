const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    customerDetails: {
      name:  { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    product_name: { type: String, required: true },
    product_id:   { type: String, required: true },
    amount:       { type: Number, required: true, min: 0 },
    payment_gateway: {
      type: String,
      required: true,
      enum: ["esewa", "khalti"],
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    // link back to appointment
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    slotId:        { type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);