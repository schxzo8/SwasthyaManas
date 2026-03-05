const Notification = require("../models/Notification");

async function notifyUser(req, userId, data) {
  // data: { type, title, message, link, meta }
  const created = await Notification.create({
    user: userId,
    type: data.type || "system",
    title: data.title || "",
    message: data.message || "",
    link: data.link || "",
    meta: data.meta || {},
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`user_${String(userId)}`).emit("notification:new", {
      _id: String(created._id),
      type: created.type,
      title: created.title,
      message: created.message,
      link: created.link,
      meta: created.meta,
      isRead: created.isRead,
      createdAt: created.createdAt,
    });
  }

  return created;
}

module.exports = { notifyUser };