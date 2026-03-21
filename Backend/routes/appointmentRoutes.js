const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  confirmBooking,
  getMyAppointments,
  getExpertAppointments,
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  mockVerifyPayment,
  paymentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

// Khalti
router.post("/khalti/initiate", protect, authorizeRoles("user"), initiateKhaltiPayment);
router.post("/khalti/verify",   protect, authorizeRoles("user"), verifyKhaltiPayment);

// Free slot confirm
router.post("/confirm", protect, authorizeRoles("user"), confirmBooking);

// Fetch
router.get("/my",     protect, authorizeRoles("user"),   getMyAppointments);
router.get("/expert", protect, authorizeRoles("expert"), getExpertAppointments);

router.post("/esewa/initiate",  protect, authorizeRoles("user"), initiateEsewaPayment);
router.post("/payment-status",  protect, authorizeRoles("user"), paymentStatus);


module.exports = router;