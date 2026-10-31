const crypto = require("crypto");

function generatePairingCode() {
  // 6-digit numeric code shown on the physical display during pairing.
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateDeviceToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { generatePairingCode, generateDeviceToken, hashToken };
