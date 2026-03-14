// const express = require("express");
// const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
// const {
//   updateProfile,
//   changePassword,
//   deleteAccount,
// } = require("../controllers/authController");

// const router = express.Router();

// // STANDARD USER PROFILE (used by frontend)
// router.get("/me", protect, (req, res) => {
//   res.json(req.user);
// });

// // Optional: verbose profile route
// router.get("/profile", protect, (req, res) => {
//   res.json({
//     message: "Protected profile route",
//     user: req.user,
//   });
// });

// // Admin-only route
// router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
//   res.json({ message: "Welcome Admin" });
// });

// // Settings routes
// router.put("/profile",  protect, updateProfile);
// router.put("/password", protect, changePassword);
// router.delete("/",      protect, deleteAccount);

// module.exports = router;

const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  updateProfile,
  changePassword,
  deleteAccount,
  adminGetUsers,
  adminGetExperts,
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

module.exports = router;