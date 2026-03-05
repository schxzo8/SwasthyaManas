const Notification = require("../models/Notification");

/**
 * Idempotent notification creator.
 * If meta.requestId exists, we dedupe by (user, type, meta.requestId).
 * Emits socket event ONLY when a new notification is created.
 */
async function notifyUser(req, userId, data) {
  const io = req.app.get("io");

  const payload = {
    user: userId,
    type: data.type || "system",
    title: data.title || "",
    message: data.message || "",
    link: data.link || "",
    meta: data.meta || {},
  };

  // ✅ DEDUPE when requestId exists
  const requestId = payload.meta?.requestId ? String(payload.meta.requestId) : null;

  let createdOrExisting;
  let wasInserted = false;

  if (requestId) {
    // Find existing first (fast & clear)
    const existing = await Notification.findOne({
      user: userId,
      type: payload.type,
      "meta.requestId": requestId,
    });

    if (existing) {
      createdOrExisting = existing;
    } else {
      createdOrExisting = await Notification.create(payload);
      wasInserted = true;
    }
  } else {
    // no requestId => normal create
    createdOrExisting = await Notification.create(payload);
    wasInserted = true;
  }

  // ✅ Emit only when newly created (prevents duplicate popups)
  if (io && wasInserted) {
    io.to(`user_${String(userId)}`).emit("notification:new", {
      _id: String(createdOrExisting._id),
      type: createdOrExisting.type,
      title: createdOrExisting.title,
      message: createdOrExisting.message,
      link: createdOrExisting.link,
      meta: createdOrExisting.meta,
      isRead: createdOrExisting.isRead,
      createdAt: createdOrExisting.createdAt,
    });
  }

  return createdOrExisting;
}

module.exports = { notifyUser };