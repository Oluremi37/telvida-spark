const streamifier = require("streamifier");
const { Device, DeviceCommand, Feedback } = require("../models");
const { generatePairingCode } = require("../utils/deviceTokens");
const cloudinary = require("../config/cloudinary");

const PAIRING_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ======================
// REGISTER (device requests a pairing code)
// ======================
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, platform, appVersion, osVersion } = req.body;

    if (!deviceId || !platform) {
      return res.status(400).json({
        success: false,
        message: "deviceId and platform are required",
      });
    }
    if (!["android", "windows"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "platform must be 'android' or 'windows'",
      });
    }

    let device = await Device.findOne({ where: { deviceId } });

    const pairingCode = generatePairingCode();
    const pairingCodeExpiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS);

    if (!device) {
      device = await Device.create({
        deviceId,
        platform,
        appVersion,
        osVersion,
        status: "pending",
        pairingCode,
        pairingCodeExpiresAt,
      });
    } else if (device.status === "authorized") {
      return res.status(409).json({
        success: false,
        message: "This device is already paired",
      });
    } else {
      device.pairingCode = pairingCode;
      device.pairingCodeExpiresAt = pairingCodeExpiresAt;
      device.appVersion = appVersion || device.appVersion;
      device.osVersion = osVersion || device.osVersion;
      await device.save();
    }

    res.status(201).json({
      success: true,
      data: {
        pairingCode,
        expiresInSeconds: PAIRING_CODE_TTL_MS / 1000,
      },
    });
  } catch (error) {
    console.error("Register device error:", error);
    res.status(500).json({
      success: false,
      message: "Could not register device",
      error: error.message,
    });
  }
};

// ======================
// PAIRING STATUS (device polls this while showing the code on screen)
// ======================
exports.pairingStatus = async (req, res) => {
  try {
    const { deviceId, pairingCode } = req.body;

    if (!deviceId || !pairingCode) {
      return res.status(400).json({
        success: false,
        message: "deviceId and pairingCode are required",
      });
    }

    const device = await Device.findOne({ where: { deviceId, pairingCode } });

    if (!device) {
      return res.status(404).json({ success: false, status: "not_found" });
    }

    if (device.status === "authorized") {
      // Deliver the raw token exactly once — on whichever poll first sees
      // "authorized" — then clear both it and the pairing code so neither
      // can be replayed.
      const token = device.pendingDeviceToken;
      if (token) {
        device.pendingDeviceToken = null;
        device.pairingCode = null;
        await device.save();
      }
      return res.status(200).json({
        success: true,
        status: "authorized",
        data: {
          organizationId: device.organizationId,
          ...(token ? { deviceToken: token } : {}),
        },
      });
    }

    if (
      device.pairingCodeExpiresAt &&
      new Date(device.pairingCodeExpiresAt) < new Date()
    ) {
      return res.status(410).json({ success: false, status: "expired" });
    }

    return res.status(200).json({ success: true, status: "pending" });
  } catch (error) {
    console.error("Pairing status error:", error);
    res.status(500).json({
      success: false,
      message: "Could not check pairing status",
      error: error.message,
    });
  }
};

// ======================
// HEARTBEAT (requires device auth)
// ======================
exports.heartbeat = async (req, res) => {
  try {
    const device = req.device;
    const {
      storageUsedMB,
      storageTotalMB,
      temperatureC,
      ramUsagePercent,
      cpuUsagePercent,
      ipAddress,
      osVersion,
      appVersion,
      currentContentId,
    } = req.body;

    await device.update({
      storageUsedMB,
      storageTotalMB,
      temperatureC,
      ramUsagePercent,
      cpuUsagePercent,
      ipAddress,
      osVersion: osVersion || device.osVersion,
      appVersion: appVersion || device.appVersion,
      currentContentId,
      lastHeartbeatAt: new Date(),
    });

    res.status(200).json({ success: true, data: { nextSyncSeconds: 60 } });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).json({
      success: false,
      message: "Could not record heartbeat",
      error: error.message,
    });
  }
};

// ======================
// SYNC (requires device auth)
// NOTE: stubbed until Playlist/Layout/Schedule models exist — the shape
// here is the contract the Android dev can build against now.
// ======================
exports.sync = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      layout: null,
      playlist: { items: [] },
      schedule: null,
      contentRetentionDays: 90,
    },
  });
};

// ======================
// PENDING COMMANDS (requires device auth)
// ======================
exports.pendingCommands = async (req, res) => {
  try {
    const commands = await DeviceCommand.findAll({
      where: { deviceRecordId: req.device.id, status: "pending" },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        commands: commands.map((c) => ({
          id: c.id,
          type: c.type,
          payload: c.payload,
        })),
      },
    });
  } catch (error) {
    console.error("Pending commands error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch pending commands",
      error: error.message,
    });
  }
};

// ======================
// ACK COMMAND (requires device auth)
// ======================
exports.ackCommand = async (req, res) => {
  try {
    const { status, details } = req.body;

    if (!["completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'completed' or 'failed'",
      });
    }

    const command = await DeviceCommand.findOne({
      where: { id: req.params.commandId, deviceRecordId: req.device.id },
    });

    if (!command) {
      return res
        .status(404)
        .json({ success: false, message: "Command not found" });
    }

    command.status = status;
    command.details = details;
    command.acknowledgedAt = new Date();
    await command.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ack command error:", error);
    res.status(500).json({
      success: false,
      message: "Could not acknowledge command",
      error: error.message,
    });
  }
};

// ======================
// UPLOAD SCREENSHOT (requires device auth)
// ======================
exports.uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image was uploaded" });
    }

    const device = req.device;
    const { commandId } = req.body;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `telvida-spark/${device.organizationId}/screenshots`,
          resource_type: "image",
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    device.lastScreenshotUrl = uploadResult.secure_url;
    device.lastScreenshotAt = new Date();
    await device.save();

    if (commandId) {
      const command = await DeviceCommand.findOne({
        where: { id: commandId, deviceRecordId: device.id },
      });
      if (command) {
        command.status = "completed";
        command.acknowledgedAt = new Date();
        await command.save();
      }
    }

    res
      .status(201)
      .json({ success: true, data: { url: uploadResult.secure_url } });
  } catch (error) {
    console.error("Upload screenshot error:", error);
    res.status(500).json({
      success: false,
      message: "Could not upload screenshot",
      error: error.message,
    });
  }
};

// 
// SUBMIT FEEDBACK (requires device auth)
// 
exports.submitFeedback = async (req, res) => {
  try {
    const { type, payload } = req.body;
    const validTypes = [
      "rating",
      "survey",
      "lead",
      "complaint",
      "qr",
      "product_rating",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type must be one of ${validTypes.join(", ")}`,
      });
    }

    const device = req.device;

    if (!device.feedbackEnabled) {
      return res.status(403).json({
        success: false,
        message: "Feedback is not enabled for this display",
      });
    }

    const feedback = await Feedback.create({
      organizationId: device.organizationId,
      deviceRecordId: device.id,
      type,
      payload: payload || {},
    });

    res.status(201).json({ success: true, data: { feedbackId: feedback.id } });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Could not submit feedback",
      error: error.message,
    });
  }
};


