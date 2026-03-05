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

/**
 * Prevent duplicates:
 * only ONE "pending" request per (user, expert)
 */
consultationRequestSchema.index(
  { user: 1, expert: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

module.exports = mongoose.model("ConsultationRequest", consultationRequestSchema);