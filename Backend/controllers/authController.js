const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");

// Cookie options for refresh token
function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // true only on HTTPS
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh", // cookie only sent to refresh endpoint (safer)
    maxAge:
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) *
      24 *
      60 *
      60 *
      1000,
  };
}

// =======================
// REGISTER
// =======================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const lower = email.toLowerCase();
    const existingUser = await User.findOne({ email: lower });

    // If already verified, block
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // If not verified, allow re-register by deleting old entry
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      firstName,
      lastName,
      email: lower,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
      // Make sure your User schema has these if you want lockout:
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: lower,
      subject: "Verify your SwasthyaManas account",
      html: `
        <h2>Welcome to SwasthyaManas</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// VERIFY EMAIL
// =======================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Verification link is invalid or expired" });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ message: "Verification link has expired" });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// RESEND VERIFICATION
// =======================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const lower = email.toLowerCase();
    const user = await User.findOne({ email: lower });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your SwasthyaManas account",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });

    return res.json({ message: "Verification email resent" });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// LOGIN (Access + Refresh Cookie + Lockout + Verified)
// =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const lower = email.toLowerCase();
    const user = await User.findOne({ email: lower });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Block unverified users except admin
    if (!user.isVerified && user.role !== "admin") {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    // Lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try again later.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset lock counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    // Create tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store hash of refresh token (rotation ready)
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenIssuedAt = new Date();
    await user.save();

    // Set refresh cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        expertise: user.expertise || "",
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// REFRESH (rotate refresh + new access)
// =======================
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: "Refresh not valid" });
    }

    const ok = await bcrypt.compare(token, user.refreshTokenHash);
    if (!ok) return res.status(401).json({ message: "Refresh not valid" });

    // Rotate
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokenIssuedAt = new Date();
    await user.save();

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

    return res.json({
      token: newAccessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        expertise: user.expertise || "",
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Refresh expired/invalid" });
  }
};

// =======================
// LOGOUT (clear cookie + wipe refresh hash)
// =======================
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, {
          refreshTokenHash: "",
          refreshTokenIssuedAt: null,
        });
      } catch {
        // ignore
      }
    }

    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    return res.json({ message: "Logged out" });
  } catch {
    return res.json({ message: "Logged out" });
  }
};