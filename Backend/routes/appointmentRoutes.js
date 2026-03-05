const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  confirmBooking,
  getMyAppointments,
  getExpertAppointments,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/confirm", protect, authorizeRoles("user"), confirmBooking);

// User
router.get("/my", protect, authorizeRoles("user"), getMyAppointments);

// Expert
router.get("/expert", protect, authorizeRoles("expert"), getExpertAppointments);

module.exports = router;
