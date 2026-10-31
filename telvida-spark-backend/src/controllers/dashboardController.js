const { Op } = require("sequelize");
const { Device, Media, Organization } = require("../models");
const { isDeviceOnline } = require("../utils/deviceStatus");

// PRD Section 2 tiers: Starter 50GB, Professional 500GB, Enterprise 2TB
function getStorageLimitBytes(plan) {
  const GB = 1024 * 1024 * 1024;
  const limits = {
    starter: 50 * GB,
    professional: 500 * GB,
    enterprise: 2000 * GB,
  };
  return limits[plan] || limits.starter;
}

exports.getDashboardStats = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.user.organizationId);

    const devices = await Device.findAll({
      where: { organizationId: req.user.organizationId, status: "authorized" },
      attributes: ["lastHeartbeatAt", "currentContentId"],
    });

    let onlineScreens = 0;
    let idleScreens = 0;
    let offlineScreens = 0;

    devices.forEach((d) => {
      if (!isDeviceOnline(d.lastHeartbeatAt)) {
        offlineScreens++;
      } else if (d.currentContentId) {
        onlineScreens++;
      } else {
        idleScreens++;
      }
    });

    const totalScreens = devices.length;

    // Group uploaded media by file format to power the "Library Storage
    // Usage" bar chart (JPG, PNG, MP4, etc.)
    const mediaItems = await Media.findAll({
      where: {
        organizationId: req.user.organizationId,
        sizeBytes: { [Op.ne]: null },
      },
      attributes: ["format", "sizeBytes"],
    });

    const usageByFormat = {};
    mediaItems.forEach((m) => {
      const key = (m.format || "unknown").toLowerCase();
      usageByFormat[key] = (usageByFormat[key] || 0) + Number(m.sizeBytes || 0);
    });

    const storageLimitBytes = getStorageLimitBytes(organization.plan);
    const storageUsedBytes = Number(organization.storageUsedBytes || 0);
    const freeBytes = Math.max(storageLimitBytes - storageUsedBytes, 0);

    const libraryStorageUsage = [
      { label: "Free", sizeBytes: freeBytes },
      ...Object.entries(usageByFormat).map(([format, sizeBytes]) => ({
        label: format.toUpperCase(),
        sizeBytes,
      })),
    ];

    res.status(200).json({
      success: true,
      data: {
        totalScreens,
        onlineScreens,
        idleScreens,
        offlineScreens,
        storageUsedBytes,
        storageLimitBytes,
        screenStatus: {
          online: onlineScreens,
          idle: idleScreens,
          offline: offlineScreens,
          total: totalScreens,
        },
        libraryStorageUsage,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch dashboard stats",
      error: error.message,
    });
  }
};
