const User = require("../models/User");

// GET ALL EXPERTS (for users)
exports.getExperts = async (req, res) => {
  try {
    const experts = await User.find({ role: "expert" }).select("firstName lastName email expertise");
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
