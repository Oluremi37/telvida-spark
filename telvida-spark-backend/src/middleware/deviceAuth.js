const { Device } = require("../models");
const { hashToken } = require("../utils/deviceTokens");

/**
 * Requires a valid device token (issued after pairing).
 * Header format: "Authorization: Device <token>"
 * Attaches req.device.
 */
exports.requireDeviceAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Device ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Device authentication required",
      });
    }

    const tokenHash = hashToken(token);
    const device = await Device.findOne({
      where: { deviceTokenHash: tokenHash, status: "authorized" },
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked device token",
      });
    }

    req.device = device;
    next();
  } catch (error) {
    console.error("Device auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid device token",
    });
  }
};
