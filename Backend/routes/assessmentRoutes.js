const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  submitPHQ9,
  getMyAssessments,
  submitGAD7,
} = require("../controllers/assessmentController");


const router = express.Router();

router.post("/phq9", protect, submitPHQ9);
router.post("/gad7", protect, submitGAD7);
router.get("/my", protect, getMyAssessments);

module.exports = router;
