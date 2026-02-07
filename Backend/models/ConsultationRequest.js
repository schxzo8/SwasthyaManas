const mongoose = require("mongoose");

const consultationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    reason: { type: String, required: true, trim: true, maxlength: 1000 },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "closed"],
      default: "pending",
    },

    expertReply: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsultationRequest", consultationRequestSchema);
