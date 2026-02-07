const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getExperts } = require("../controllers/expertController");

const router = express.Router();

router.get("/", protect, getExperts);

module.exports = router;
