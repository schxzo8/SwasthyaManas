const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh); // should be GET (since you use API.get)
router.post("/logout", logout);
router.post("/resend-verification", resendVerification);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;