const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  saveMoodEntry,
  getTodayMood,
  getMoodHistory,
  getStreak,
  getMoodStats,
  getTrackerStats,
} = require("../controllers/moodController");

const router = express.Router();

// All mood routes require authentication
router.use(protect);

// More specific routes first
router.get("/tracker-stats", getTrackerStats);

// Then general routes
router.post("/", saveMoodEntry);
router.get("/today", getTodayMood);
router.get("/history", getMoodHistory);
router.get("/streak", getStreak);
router.get("/stats", getMoodStats);

module.exports = router;
