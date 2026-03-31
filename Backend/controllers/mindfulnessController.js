const { getRandomPrompt, getPromptByType } = require("../utils/mindfulnessPrompts");

// GET /api/mindfulness/prompt - Get random mindfulness prompt
exports.getRandomPrompt = async (req, res) => {
  try {
    const prompt = getRandomPrompt();
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch prompt" });
  }
};

// GET /api/mindfulness/prompt/:type - Get prompt by type
exports.getPromptByType = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = [
      "affirmation",
      "breathing",
      "grounding",
      "body-scan",
      "gratitude",
      "mindfulness",
      "movement",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid prompt type",
        validTypes,
      });
    }

    const prompt = getPromptByType(type);
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch prompt" });
  }
};

// POST /api/mindfulness/bell-click - Log bell click for today
exports.logBellClick = async (req, res) => {
  try {
    // Get today's date (Nepal time)
    const today = new Date();
    const nepalOffset = 5.75 * 60; // Nepal is UTC+5:45
    const utcOffset = today.getTimezoneOffset();
    const nepalTime = new Date(today.getTime() + (nepalOffset + utcOffset) * 60000);
    const dateStr = nepalTime.toISOString().split("T")[0];

    // Store in user's mindfulness data (you can extend this with a dedicated model later)
    // For now, we'll just return success
    res.json({
      message: "Mindfulness bell clicked",
      date: dateStr,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to log bell click" });
  }
};
