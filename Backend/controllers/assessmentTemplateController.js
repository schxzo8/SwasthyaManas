const Assessment = require("../models/Assessment");

exports.getAssessmentByName = async (req, res) => {
  try {
    const { name } = req.params; // e.g. "PHQ-9"
    const assessment = await Assessment.findOne({ name });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
