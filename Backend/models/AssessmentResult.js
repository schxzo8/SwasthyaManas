const mongoose = require("mongoose");

const assessmentResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assessmentType: {
      type: String,
      enum: ["PHQ-9", "GAD-7"],
      required: true,
    },

    answers: [
      {
        questionIndex: Number,
        value: Number, // 0–3
      },
    ],

    totalScore: Number,

    severity: {
      type: String,
      enum: ["Minimal", "Mild", "Moderate", "Moderately Severe", "Severe"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);
