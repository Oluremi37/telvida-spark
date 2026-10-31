const { Device, DeviceCommand } = require("../models");
const { generateDeviceToken, hashToken } = require("../utils/deviceTokens");
const { withOnlineStatus } = require("../utils/deviceStatus");

// ======================
// AUTHORIZE DEVICE (admin enters the pairing code shown on the screen)
// ======================
exports.authorizeDevice = async (req, res) => {
  try {
    const { pairingCode, displayName, location, latitude, longitude } =
      req.body;

    if (!pairingCode || !displayName) {
      return res.status(400).json({
        success: false,
        message: "pairingCode and displayName are required",
      });
    }

    const device = await Device.findOne({
      where: { pairingCode, status: "pending" },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Invalid or already-used pairing code",
      });
    }

    if (
      device.pairingCodeExpiresAt &&
      new Date(device.pairingCodeExpiresAt) < new Date()
    ) {
      return res.status(410).json({
        success: false,
        message: "Pairing code has expired. Restart pairing on the device.",
      });
    }

    const rawToken = generateDeviceToken();

    device.organizationId = req.user.organizationId;
    device.deviceTokenHash = hashToken(rawToken);
    device.pendingDeviceToken = rawToken;
    device.status = "authorized";
    device.displayName = displayName;
    device.location = location;
    device.latitude = latitude;
    device.longitude = longitude;
    // pairingCode is intentionally kept — the device still needs it to
    // locate its record on its next pairing-status poll and collect its
    // token. It's cleared there once that handoff completes.
    device.pairingCodeExpiresAt = null;

    await device.save();

    res.status(201).json({
      success: true,
      message: "Display authorized successfully",
      data: { display: withOnlineStatus(device) },
    });
  } catch (error) {
    console.error("Authorize device error:", error);
    res.status(500).json({
      success: false,
      message: "Could not authorize device",
      error: error.message,
    });
  }
};

// ======================
// LIST DISPLAYS
// ======================
exports.listDisplays = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { groupId, status } = req.query;
    const where = {
      organizationId: req.user.organizationId,
      status: { [Op.ne]: "revoked" },
    };

    if (groupId) where.groupId = groupId;
    if (status === "authorized" || status === "pending") where.status = status;

    const devices = await Device.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { displays: devices.map(withOnlineStatus) },
    });
  } catch (error) {
    console.error("List displays error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch displays",
      error: error.message,
    });
  }
};

// ======================
// GET DISPLAY BY ID
// ======================
exports.getDisplay = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Display not found" });
    }

    res
      .status(200)
      .json({ success: true, data: { display: withOnlineStatus(device) } });
  } catch (error) {
    console.error("Get display error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch display",
      error: error.message,
    });
  }
};

// ======================
// UPDATE DISPLAY
// ======================
exports.updateDisplay = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Display not found" });
    }

    const allowedFields = [
      "displayName",
      "location",
      "latitude",
      "longitude",
      "groupId",
      "resolution",
      "feedbackEnabled",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) device[field] = req.body[field];
    }
    await device.save();

    res.status(200).json({
      success: true,
      message: "Display updated successfully",
      data: { display: withOnlineStatus(device) },
    });
  } catch (error) {
    console.error("Update display error:", error);
    res.status(500).json({
      success: false,
      message: "Could not update display",
      error: error.message,
    });
  }
};

// ======================
// QUEUE REMOTE COMMAND
// ======================
exports.queueCommand = async (req, res) => {
  try {
    const { type, payload } = req.body;
    const validTypes = [
      "reboot",
      "restart_player",
      "screenshot",
      "update_software",
      "remote_config",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type must be one of ${validTypes.join(", ")}`,
      });
    }

    const device = await Device.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Display not found" });
    }

    const command = await DeviceCommand.create({
      deviceRecordId: device.id,
      type,
      payload: payload || {},
      issuedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: { command } });
  } catch (error) {
    console.error("Queue command error:", error);
    res.status(500).json({
      success: false,
      message: "Could not queue command",
      error: error.message,
    });
  }
};

// ======================
// REMOVE DISPLAY (revokes device token — device must re-pair from scratch)
// ======================
exports.removeDisplay = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Display not found" });
    }

    device.status = "revoked";
    device.deviceTokenHash = null;
    await device.save();

    res
      .status(200)
      .json({ success: true, message: "Display removed successfully" });
  } catch (error) {
    console.error("Remove display error:", error);
    res.status(500).json({
      success: false,
      message: "Could not remove display",
      error: error.message,
    });
  }
};
