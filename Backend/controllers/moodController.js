const MoodEntry = require("../models/MoodEntry");
const User = require("../models/User");

// Helper function to get Nepal date string (YYYY-MM-DD)
const getNepalDateString = () => {
  const now = new Date();
  const nepalOffset = 5.75 * 60 * 60 * 1000; // Nepal is UTC+5:45
  const utcOffset = now.getTimezoneOffset() * 60 * 1000;
  const nepalTime = new Date(now.getTime() + nepalOffset + utcOffset);
  
  const year = nepalTime.getFullYear();
  const month = String(nepalTime.getMonth() + 1).padStart(2, "0");
  const date = String(nepalTime.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${date}`;
};

// POST /api/mood - Save mood entry for the day
exports.saveMoodEntry = async (req, res) => {
  try {
    const { mood, intensity, notes } = req.body;

    if (!mood || !intensity) {
      return res
        .status(400)
        .json({ message: "Mood and intensity are required" });
    }

    if (!["excellent", "good", "neutral", "sad", "stressed"].includes(mood)) {
      return res.status(400).json({ message: "Invalid mood value" });
    }

    if (intensity < 1 || intensity > 10) {
      return res
        .status(400)
        .json({ message: "Intensity must be between 1 and 10" });
    }

    // Get today's date string in Nepal timezone
    const todayDateString = getNepalDateString();

    // Check if entry already exists for today
    const existingEntry = await MoodEntry.findOne({
      user: req.user.id,
      dateString: todayDateString,
    });

    let moodEntry;
    if (existingEntry) {
      // Update existing entry
      moodEntry = await MoodEntry.findByIdAndUpdate(
        existingEntry._id,
        { mood, intensity, notes },
        { new: true }
      );
    } else {
      // Create new entry
      moodEntry = await MoodEntry.create({
        user: req.user.id,
        mood,
        intensity,
        notes,
        dateString: todayDateString,
      });
    }

    res.json({
      message: "Mood entry saved successfully",
      moodEntry,
    });
  } catch (error) {
    console.error("Save mood error:", error);
    res.status(500).json({ message: "Failed to save mood entry" });
  }
};

// GET /api/mood/today - Get today's mood entry
exports.getTodayMood = async (req, res) => {
  try {
    const todayDateString = getNepalDateString();

    const todayMood = await MoodEntry.findOne({
      user: req.user.id,
      dateString: todayDateString,
    });

    res.json(todayMood || null);
  } catch (error) {
    console.error("Get today mood error:", error);
    res.status(500).json({ message: "Failed to fetch today's mood" });
  }
};

// GET /api/mood/history - Get mood history (last 30 days)
exports.getMoodHistory = async (req, res) => {
  try {
    // Calculate 30 days ago in Nepal timezone
    const now = new Date();
    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const utcOffset = now.getTimezoneOffset() * 60 * 1000;
    const nepalTime = new Date(now.getTime() + nepalOffset + utcOffset);
    
    const thirtyDaysAgo = new Date(nepalTime);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Convert to ISO string for date comparison
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split("T")[0];

    const history = await MoodEntry.find({
      user: req.user.id,
      dateString: { $gte: thirtyDaysAgoString },
    })
      .sort({ dateString: -1 })
      .select("mood intensity notes dateString date");

    res.json(history);
  } catch (error) {
    console.error("Get mood history error:", error);
    res.status(500).json({ message: "Failed to fetch mood history" });
  }
};

// GET /api/mood/streak - Get current streak
exports.getStreak = async (req, res) => {
  try {
    let streak = 0;
    let currentDate = new Date();
    
    // Convert to Nepal time for date calculations
    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const utcOffset = currentDate.getTimezoneOffset() * 60 * 1000;
    const nepalTime = new Date(currentDate.getTime() + nepalOffset + utcOffset);
    currentDate = new Date(nepalTime);

    while (true) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const date = String(currentDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${date}`;

      const entry = await MoodEntry.findOne({
        user: req.user.id,
        dateString: dateString,
      });

      if (!entry) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    res.json({ streak });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ message: "Failed to fetch streak" });
  }
};

// GET /api/mood/stats - Get mood statistics
exports.getMoodStats = async (req, res) => {
  try {
    // Calculate 30 days ago in Nepal timezone
    const now = new Date();
    const nepalOffset = 5.75 * 60 * 60 * 1000;
    const utcOffset = now.getTimezoneOffset() * 60 * 1000;
    const nepalTime = new Date(now.getTime() + nepalOffset + utcOffset);
    
    const thirtyDaysAgo = new Date(nepalTime);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Convert to ISO string for date comparison
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split("T")[0];

    const stats = await MoodEntry.aggregate([
      {
        $match: {
          user: require("mongoose").Types.ObjectId(req.user.id),
          dateString: { $gte: thirtyDaysAgoString },
        },
      },
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
          avgIntensity: { $avg: "$intensity" },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Get mood stats error:", error);
    res.status(500).json({ message: "Failed to fetch mood stats" });
  }
};

// GET /api/mood/tracker-stats - Get all tracker stats (streak, total entries, points) in one call
exports.getTrackerStats = async (req, res) => {
  try {
    console.log("🎯 getTrackerStats called for user:", req.user.id);

    // Get all mood entries for this user, sorted by date
    const allEntries = await MoodEntry.find(
      { user: req.user.id },
      { dateString: 1 }
    ).sort({ dateString: -1 });

    console.log("📊 Found entries:", allEntries.length, "Entries:", allEntries.map(e => e.dateString));

    // Calculate total entries
    const totalEntries = allEntries.length;

    // Calculate streak
    let streak = 0;
    if (allEntries.length > 0) {
      // Get today's date using the same method as when entries are created
      const todayDateString = getNepalDateString();
      console.log("📅 Today's date string:", todayDateString);
      
      // Create a set of all entry dates for quick lookup
      const entryDates = new Set(allEntries.map(entry => entry.dateString));
      
      // Start from today and go backwards
      let currentDate = new Date();
      const nepalOffset = 5.75 * 60 * 60 * 1000;
      const utcOffset = currentDate.getTimezoneOffset() * 60 * 1000;
      currentDate = new Date(currentDate.getTime() + nepalOffset + utcOffset);
      
      while (true) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;
        
        console.log("🔍 Checking date:", dateString, "Has entry:", entryDates.has(dateString));
        
        if (entryDates.has(dateString)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate points (streak * 10)
    const points = streak * 10;

    console.log("✅ Returning stats - Streak:", streak, "Entries:", totalEntries, "Points:", points);

    res.json({
      streak,
      totalEntries,
      points,
    });
  } catch (error) {
    console.error("❌ Get tracker stats error:", error);
    res.status(500).json({ message: "Failed to fetch tracker stats" });
  }
};
