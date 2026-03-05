const Notification = require("../models/Notification");

// GET /api/notifications?unreadOnly=1&limit=20
exports.listMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadOnly = String(req.query.unreadOnly || "") === "1";
    const limit = Math.min(Number(req.query.limit || 30), 100);

    const filter = { user: userId };
    if (unreadOnly) filter.isRead = false;

    const list = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({ notifications: list, unreadCount });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const n = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!n) return res.status(404).json({ message: "Notification not found" });

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({ notification: n, unreadCount });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({ ok: true, unreadCount: 0 });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};