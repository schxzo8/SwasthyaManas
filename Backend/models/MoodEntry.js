const mongoose = require("mongoose");

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

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["excellent", "good", "neutral", "sad", "stressed"],
      required: true,
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    dateString: {
      type: String,
      default: getNepalDateString,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for unique entry per user per day
moodEntrySchema.index({ user: 1, dateString: 1 }, { unique: false });
moodEntrySchema.index({ user: 1, date: -1 });
moodEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("MoodEntry", moodEntrySchema);
