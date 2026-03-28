const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh); 
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const User = require("../models/User");
        await User.findByIdAndUpdate(decoded.id, {
          refreshTokenHash: "",
          refreshTokenIssuedAt: null,
        });
      } catch {
        // ignore
      }
    }

    // Must use SAME options as when setting the cookie
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/api/auth/refresh",
    });
    return res.json({ message: "Logged out successfully" });
  } catch {
    return res.json({ message: "Logged out" });
  }
});
router.post("/resend-verification", resendVerification);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;