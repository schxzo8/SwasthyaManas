const crypto = require("crypto");

function generateHmacSha256Hash(data, secret) {
  if (!data || !secret) throw new Error("Both data and secret are required.");
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
}

module.exports = { generateHmacSha256Hash };