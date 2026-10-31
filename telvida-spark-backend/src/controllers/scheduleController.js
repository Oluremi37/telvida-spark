const {
  Schedule,
  ScheduleDisplay,
  Playlist,
  Device,
  User,
} = require("../models");

// ======================
// CREATE SCHEDULE
// ======================
exports.createSchedule = async (req, res) => {
  try {
    const {
      name,
      playlistId,
      type,
      priority,
      startTime,
      endTime,
      daysOfWeek,
      startDate,
      endDate,
      deviceIds, // array of device IDs
    } = req.body;

    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    if (!name || !playlistId) {
      return res.status(400).json({
        success: false,
        message: "Name and playlistId are required",
      });
    }

    // Verify playlist belongs to organization
    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      name,
      playlistId,
      type: type || "always",
      priority: priority || 1,
      startTime,
      endTime,
      daysOfWeek,
      startDate,
      endDate,
      organizationId,
      createdBy: userId,
    });

    // Assign to devices if provided
    if (deviceIds && Array.isArray(deviceIds) && deviceIds.length > 0) {
      for (const deviceId of deviceIds) {
        // Verify device belongs to organization
        const device = await Device.findOne({
          where: { id: deviceId, organizationId },
        });

        if (device) {
          await ScheduleDisplay.create({
            scheduleId: schedule.id,
            deviceId,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: { schedule },
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// GET ALL SCHEDULES
// ======================
exports.getSchedules = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const includeInactive = req.query.includeInactive === "true";

    const whereClause = {
      organizationId,
    };

    // By default only show active schedules
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: [
        {
          model: Playlist,
          as: "playlist",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: ScheduleDisplay,
          as: "displays",
          include: [
            {
              model: Device,
              as: "device",
              attributes: ["id", "displayName", "status"],
            },
          ],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: { schedules },
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// GET SINGLE SCHEDULE (with playlist + displays)
// ======================
exports.getSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const organizationId = req.user.organizationId;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
      include: [
        {
          model: Playlist,
          as: "playlist",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: ScheduleDisplay,
          as: "displays",
          include: [
            {
              model: Device,
              as: "device",
              attributes: ["id", "displayName", "status"],
            },
          ],
        },
      ],
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { schedule },
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// UPDATE SCHEDULE
// ======================
exports.updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const organizationId = req.user.organizationId;
    const {
      name,
      playlistId,
      type,
      priority,
      startTime,
      endTime,
      daysOfWeek,
      startDate,
      endDate,
      isActive,
      deviceIds, // if provided, replaces the current display assignments
    } = req.body;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // If a new playlistId is provided, verify it belongs to the organization
    if (playlistId !== undefined) {
      const playlist = await Playlist.findOne({
        where: { id: playlistId, organizationId },
      });
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
    }

    if (name !== undefined) schedule.name = name;
    if (playlistId !== undefined) schedule.playlistId = playlistId;
    if (type !== undefined) schedule.type = type;
    if (priority !== undefined) schedule.priority = priority;
    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (daysOfWeek !== undefined) schedule.daysOfWeek = daysOfWeek;
    if (startDate !== undefined) schedule.startDate = startDate;
    if (endDate !== undefined) schedule.endDate = endDate;
    if (isActive !== undefined) schedule.isActive = isActive;

    await schedule.save();

    // Replace device assignments if a new deviceIds array was sent
    if (deviceIds !== undefined && Array.isArray(deviceIds)) {
      await ScheduleDisplay.destroy({ where: { scheduleId: schedule.id } });

      for (const deviceId of deviceIds) {
        const device = await Device.findOne({
          where: { id: deviceId, organizationId },
        });
        if (device) {
          await ScheduleDisplay.create({
            scheduleId: schedule.id,
            deviceId,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: { schedule },
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// DELETE SCHEDULE
// ======================
exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const organizationId = req.user.organizationId;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Deactivate rather than hard-delete, consistent with how Layout
    // archives instead of removing — safer for anything that might
    // reference this schedule's history later (e.g. reports).
    schedule.isActive = false;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Schedule deactivated successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// REACTIVATE SCHEDULE
// ======================
exports.reactivateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const organizationId = req.user.organizationId;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    schedule.isActive = true;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Schedule reactivated successfully",
      data: { schedule },
    });
  } catch (error) {
    console.error("Reactivate schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// ADD DISPLAY TO SCHEDULE
// ======================
exports.addDisplayToSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { deviceId } = req.body;
    const organizationId = req.user.organizationId;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const device = await Device.findOne({
      where: { id: deviceId, organizationId },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Check if already assigned
    const existing = await ScheduleDisplay.findOne({
      where: { scheduleId, deviceId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Device is already assigned to this schedule",
      });
    }

    const assignment = await ScheduleDisplay.create({
      scheduleId,
      deviceId,
    });

    res.status(201).json({
      success: true,
      message: "Display added to schedule successfully",
      data: { assignment },
    });
  } catch (error) {
    console.error("Add display error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// REMOVE DISPLAY FROM SCHEDULE
// ======================
exports.removeDisplayFromSchedule = async (req, res) => {
  try {
    const { scheduleId, deviceId } = req.params;
    const organizationId = req.user.organizationId;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const assignment = await ScheduleDisplay.findOne({
      where: { scheduleId, deviceId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Device is not assigned to this schedule",
      });
    }

    await assignment.destroy();

    res.status(200).json({
      success: true,
      message: "Display removed from schedule successfully",
    });
  } catch (error) {
    console.error("Remove display error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = exports;
