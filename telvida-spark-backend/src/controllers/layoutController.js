const { Layout, User } = require("../models");
const { Op } = require("sequelize");

// @desc    Create a new layout
// @route   POST /api/layouts
// @access  Private
exports.createLayout = async (req, res) => {
  try {
    const { name, description, width, height, zones, templateId, status } =
      req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Layout name is required",
      });
    }

    const layout = await Layout.create({
      name,
      description: description || null,
      width: width || 1920,
      height: height || 1080,
      zones: zones || [],
      templateId: templateId || null,
      status: status || "draft",
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Layout created successfully",
      data: layout,
    });
  } catch (error) {
    console.error("Create layout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create layout",
      error: error.message,
    });
  }
};

// @desc    Get all layouts for the organization
// @route   GET /api/layouts
// @access  Private
exports.getLayouts = async (req, res) => {
  try {
    const { status, search, includeArchived } = req.query;

    const where = {
      organizationId: req.user.organizationId,
    };

    // By default, hide archived layouts
    if (includeArchived !== "true") {
      where.status = { [Op.ne]: "archived" };
    }

    // Allow explicit status filter
    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const layouts = await Layout.findAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      attributes: {
        exclude: ["zones"], // lighter list view
      },
    });

    res.status(200).json({
      success: true,
      count: layouts.length,
      data: layouts,
    });
  } catch (error) {
    console.error("Get layouts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch layouts",
      error: error.message,
    });
  }
};

// @desc    Get single layout (with full zones)
// @route   GET /api/layouts/:layoutId
// @access  Private
exports.getLayout = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      where: {
        id: req.params.layoutId,
        organizationId: req.user.organizationId,
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Layout not found",
      });
    }

    res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    console.error("Get layout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch layout",
      error: error.message,
    });
  }
};
// @desc    Update layout (name, description, resolution, zones, status, etc.)
// @route   PUT /api/layouts/:layoutId
// @access  Private
exports.updateLayout = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      where: {
        id: req.params.layoutId,
        organizationId: req.user.organizationId,
      },
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Layout not found",
      });
    }

    const {
      name,
      description,
      width,
      height,
      zones,
      templateId,
      status,
      thumbnailUrl,
    } = req.body;

    // Only update fields that were sent
    if (name !== undefined) layout.name = name;
    if (description !== undefined) layout.description = description;
    if (width !== undefined) layout.width = width;
    if (height !== undefined) layout.height = height;
    if (zones !== undefined) layout.zones = zones;
    if (templateId !== undefined) layout.templateId = templateId;
    if (status !== undefined) layout.status = status;
    if (thumbnailUrl !== undefined) layout.thumbnailUrl = thumbnailUrl;

    await layout.save();

    res.status(200).json({
      success: true,
      message: "Layout updated successfully",
      data: layout,
    });
  } catch (error) {
    console.error("Update layout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update layout",
      error: error.message,
    });
  }
};

// @desc    Delete (or archive) a layout
// @route   DELETE /api/layouts/:layoutId
// @access  Private
exports.deleteLayout = async (req, res) => {
  try {
    const layout = await Layout.findOne({
      where: {
        id: req.params.layoutId,
        organizationId: req.user.organizationId,
      },
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Layout not found",
      });
    }

    // Soft delete by archiving (safer for production)
    // If you prefer hard delete, replace with: await layout.destroy();
    layout.status = "archived";
    await layout.save();

    res.status(200).json({
      success: true,
      message: "Layout archived successfully",
    });
  } catch (error) {
    console.error("Delete layout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete layout",
      error: error.message,
    });
  }
};
