const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [
    {
      label: String,   // e.g. "Not at all"
      value: Number,   // 0–3
    },
  ],
});

const assessmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["PHQ-9", "GAD-7"],
      required: true,
      unique: true,
    },

    description: String,

    questions: [questionSchema],

    maxScore: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
