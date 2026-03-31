const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const User = require("../models/User");
const {
  updateProfile,
  changePassword,
  deleteAccount,
  adminGetUsers,
  adminGetExperts,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminUpdateExpert,
  adminGetAppointments,
  uploadProfilePicture,
} = require("../controllers/authController");

const router = express.Router();

// ── User self-service ─────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshTokenHash -emailVerificationToken");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
router.get("/profile", protect, (req, res) => res.json({ user: req.user }));
router.put("/profile",  protect, updateProfile);
router.put("/profile-picture", protect, upload.single('file'), uploadProfilePicture);
router.put("/password", protect, changePassword);
router.delete("/",      protect, deleteAccount);

// ── Admin ─────────────────────────────────────────────────
router.get("/admin", protect, authorizeRoles("admin"), (req, res) =>
  res.json({ message: "Welcome Admin" })
);
router.get("/admin/users",            protect, authorizeRoles("admin"), adminGetUsers);
router.get("/admin/experts",          protect, authorizeRoles("admin"), adminGetExperts);
router.put("/admin/users/:id",        protect, authorizeRoles("admin"), adminUpdateUser);
router.delete("/admin/users/:id",     protect, authorizeRoles("admin"), adminDeleteUser);
router.put("/admin/experts/:id",      protect, authorizeRoles("admin"), adminUpdateExpert);
router.delete("/admin/experts/:id",   protect, authorizeRoles("admin"), adminDeleteUser);
router.post("/admin/create", protect, authorizeRoles("admin"), adminCreateUser);
router.get("/admin/appointments", protect, authorizeRoles("admin"), adminGetAppointments);

module.exports = router;