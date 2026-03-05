const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "consultation_new",
        "consultation_update",

        "consultation_reply",
        "consultation_reply_sent",
        "consultation_accepted",
        "consultation_rejected",
        "consultation_closed",

        // booking
        "slot_update",
        "appointment_new",
        "appointment_update",

        //fallback
        "system",
      ],
      default: "system",
      index: true,
    },

    title: { type: String, default: "" },
    message: { type: String, default: "" },

    link: { type: String, default: "" },

    meta: { type: Object, default: {} },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/*
Prevent duplicate notifications for the same request
Example:
user + consultation_new + requestId
*/
notificationSchema.index(
  { user: 1, type: 1, "meta.requestId": 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Notification", notificationSchema);