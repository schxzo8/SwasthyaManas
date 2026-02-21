const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  bulkCreateSlots,
  getExpertAvailability,
  getMySlots,
} = require("../controllers/availabilityController");

const router = express.Router();

// Expert creates slots
router.post("/bulk", protect, authorizeRoles("expert"), bulkCreateSlots);

// Expert views own slots
router.get("/my", protect, authorizeRoles("expert"), getMySlots);

// User (or logged-in) views expert availability
router.get("/:expertId", protect, getExpertAvailability);

module.exports = router;
