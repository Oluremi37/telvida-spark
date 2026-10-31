const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const { requireDeviceAuth } = require("../middleware/deviceAuth");
const upload = require("../middleware/upload");

router.post("/register", deviceController.registerDevice);
router.post("/pairing-status", deviceController.pairingStatus);

router.post("/heartbeat", requireDeviceAuth, deviceController.heartbeat);
router.get("/sync", requireDeviceAuth, deviceController.sync);
router.get(
  "/commands/pending",
  requireDeviceAuth,
  deviceController.pendingCommands,
);
router.post(
  "/commands/:commandId/ack",
  requireDeviceAuth,
  deviceController.ackCommand,
);
router.post(
  "/screenshot",
  requireDeviceAuth,
  upload.single("image"),
  deviceController.uploadScreenshot,
);
router.post("/feedback", requireDeviceAuth, deviceController.submitFeedback);

module.exports = router;
