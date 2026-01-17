const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// STANDARD USER PROFILE (used by frontend)
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// Optional: verbose profile route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

// Admin-only route
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
