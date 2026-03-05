const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "consultation_new",
        "consultation_update",
        "slot_update",
        "appointment_new",
        "appointment_update",
        "system",
      ],
      default: "system",
      index: true,
    },

    title: { type: String, default: "" },
    message: { type: String, default: "" },

    // optional deep-link inside app
    link: { type: String, default: "" }, // e.g. "/inbox" or "/appointments"

    // optional metadata for UI
    meta: { type: Object, default: {} },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);