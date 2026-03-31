const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getRandomPrompt,
  getPromptByType,
  logBellClick,
} = require("../controllers/mindfulnessController");

const router = express.Router();

// Public routes
router.get("/prompt", getRandomPrompt);
router.get("/prompt/:type", getPromptByType);

// Protected routes
router.post("/bell-click", protect, logBellClick);

module.exports = router;
