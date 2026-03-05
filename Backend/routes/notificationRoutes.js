const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  listMyNotifications,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, listMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);

module.exports = router;