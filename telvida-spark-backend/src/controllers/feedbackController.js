const { Op } = require("sequelize");
const { Feedback, Device } = require("../models");

// ======================
// LIST FEEDBACK
// ======================
exports.listFeedback = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { type, deviceId, page = 1, limit = 20 } = req.query;

    const where = { organizationId };
    if (type) where.type = type;
    if (deviceId) where.deviceRecordId = deviceId;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Feedback.findAndCountAll({
      where,
      include: [
        {
          model: Device,
          as: "device",
          attributes: ["id", "displayName", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        feedback: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("List feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch feedback",
      error: error.message,
    });
  }
};

// ======================
// FEEDBACK SUMMARY (counts by type — powers Reports/Dashboard-style widgets)
// ======================
exports.getFeedbackSummary = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const allFeedback = await Feedback.findAll({
      where: { organizationId },
      attributes: ["type", "payload"],
    });

    const summary = {
      total: allFeedback.length,
      byType: {},
      averageRating: null,
    };

    let ratingSum = 0;
    let ratingCount = 0;

    allFeedback.forEach((f) => {
      summary.byType[f.type] = (summary.byType[f.type] || 0) + 1;

      if (f.type === "rating" && typeof f.payload?.stars === "number") {
        ratingSum += f.payload.stars;
        ratingCount++;
      }
    });

    if (ratingCount > 0) {
      summary.averageRating = Number((ratingSum / ratingCount).toFixed(2));
    }

    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    console.error("Feedback summary error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch feedback summary",
      error: error.message,
    });
  }
};

// ======================
// DELETE FEEDBACK (e.g. spam/test submissions)
// ======================
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    await feedback.destroy();

    res
      .status(200)
      .json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Could not delete feedback",
      error: error.message,
    });
  }
};

module.exports = exports;
