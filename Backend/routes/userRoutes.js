const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
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
} = require("../controllers/authController");

const router = express.Router();

// ── User self-service ─────────────────────────────────────
router.get("/me", protect, (req, res) => res.json(req.user));
router.get("/profile", protect, (req, res) => res.json({ user: req.user }));
router.put("/profile",  protect, updateProfile);
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

module.exports = router;