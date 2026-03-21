const Notification = require("../models/Notification");

/**
 * Idempotent notification creator.
 * Dedupes by (user, type, meta.requestId) OR (user, type, meta.appointmentId).
 * Emits socket event ONLY when a new notification is created.
 */
async function notifyUser(req, userId, data) {
  const io = req.app.get("io");

  const payload = {
    user:    userId,
    type:    data.type    || "system",
    title:   data.title   || "",
    message: data.message || "",
    link:    data.link    || "",
    meta:    data.meta    || {},
  };

  const requestId     = payload.meta?.requestId     ? String(payload.meta.requestId)     : null;
  const appointmentId = payload.meta?.appointmentId ? String(payload.meta.appointmentId) : null;

  let createdOrExisting;
  let wasInserted = false;

  if (requestId) {
    // dedupe by requestId
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

  } else if (appointmentId) {
    // dedupe by appointmentId
    const existing = await Notification.findOne({
      user: userId,
      type: payload.type,
      "meta.appointmentId": appointmentId,
    });

    if (existing) {
      createdOrExisting = existing;
    } else {
      createdOrExisting = await Notification.create(payload);
      wasInserted = true;
    }

  } else {
    // no dedup key — always create (system notifications etc.)
    createdOrExisting = await Notification.create(payload);
    wasInserted = true;
  }

  // emit only when newly inserted
  if (io && wasInserted) {
  io.to(`user_${String(userId)}`).emit("notification:new", {
    _id: String(createdOrExisting._id),
    user: String(userId),
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