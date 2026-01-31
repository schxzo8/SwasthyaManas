const AssessmentResult = require("../models/AssessmentResult");

const getPHQ9Severity = (score) => {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  if (score <= 19) return "Moderately Severe";
  return "Severe";
};

// SUBMIT ASSESSMENT
exports.submitPHQ9 = async (req, res) => {
  try {
    const { answers } = req.body;

    const totalScore = answers.reduce(
      (sum, a) => sum + a.value,
      0
    );

    const severity = getPHQ9Severity(totalScore);

    const result = await AssessmentResult.create({
      user: req.user._id,
      assessmentType: "PHQ-9",
      answers,
      totalScore,
      severity,
    });

    res.status(201).json({
      message: "Assessment submitted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getGAD7Severity = (score) => {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    return "Severe"; // 15-21
};

// Submit GAD-7 
exports.submitGAD7 = async (req, res) => {
  try {
    const { answers } = req.body;

    const totalScore = answers.reduce((sum, a) => sum + a.value, 0);
    const severity = getGAD7Severity(totalScore);

    const result = await AssessmentResult.create({
      user: req.user._id,
      assessmentType: "GAD-7",
      answers,
      totalScore,
      severity,
    });

    res.status(201).json({
      message: "Assessment submitted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER HISTORY
exports.getMyAssessments = async (req, res) => {
  const results = await AssessmentResult.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(results);
};
