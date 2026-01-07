const express = require("express");
const {
  createContent,
  getAllContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// PUBLIC – users can read content
router.get("/", getAllContent);

// ADMIN – manage content
router.post("/", protect, authorizeRoles("admin"), createContent);
router.put("/:id", protect, authorizeRoles("admin"), updateContent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteContent);

module.exports = router;
