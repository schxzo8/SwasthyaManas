const jwt = require("jsonwebtoken");

function signAccessToken(user) {
    return jwt.sign(
        {id: String(user._id), role: user.role, email: user.email}, 
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
    );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: String(user._id) },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30}d` }
  );
}

module.exports = { signAccessToken, signRefreshToken };