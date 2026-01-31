const express = require("express");
const { getAssessmentByName } = require("../controllers/assessmentTemplateController");

const router = express.Router();

router.get("/:name", getAssessmentByName);

module.exports = router;


router.get("/", async (req, res) => {
  const all = await require("../models/Assessment").find().select("name");
  res.json(all);
});
