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



// ADMIN – get all content
router.get("/all", protect, authorizeRoles("admin"), async (req, res) => {
  const allContent = await Content.find();
  res.json(allContent);
});

// ADMIN – manage content
router.post("/", protect, authorizeRoles("admin"), createContent);
router.put("/:id", protect, authorizeRoles("admin"), updateContent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteContent);

module.exports = router;
