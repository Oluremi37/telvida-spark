const streamifier = require("streamifier");
const { Op } = require("sequelize");

const { Media, Organization } = require("../models");
const cloudinary = require("../config/cloudinary");
const {
  resolveMediaType,
  getLimitsForPlan,
  formatBytes,
} = require("../utils/mediaLimits");

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map((t) => String(t).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      return parsed.map((t) => String(t).trim()).filter(Boolean);
  } catch (e) {
    // not JSON — fall through to comma-split
  }
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function streamUpload(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ======================
// UPLOAD MEDIA (file)
// ======================
exports.uploadMedia = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    const organization = await Organization.findByPk(req.user.organizationId);
    const limits = getLimitsForPlan(organization.plan);
    const { name, description } = req.body;
    const tags = parseTags(req.body.tags);

    const uploadedMedia = [];

    for (const file of files) {
      const resolved = resolveMediaType(file.mimetype);
      if (!resolved) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type: ${file.mimetype}`,
        });
      }

      const maxBytes = limits[resolved.type];
      if (file.size > maxBytes) {
        return res.status(400).json({
          success: false,
          message: `File "${file.originalname}" exceeds the ${formatBytes(maxBytes)} limit for ${resolved.type} files on the ${organization.plan} plan`,
        });
      }

      const uploadResult = await streamUpload(file.buffer, {
        folder: `telvida-spark/${organization.id}/${resolved.type}`,
        resource_type: resolved.resourceType,
      });

      const media = await Media.create({
        organizationId: organization.id,
        uploadedBy: req.user.id,
        name: name || file.originalname,
        type: resolved.type,
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        cloudinaryResourceType: resolved.resourceType,
        format: uploadResult.format || file.originalname.split(".").pop(),
        sizeBytes: file.size,
        durationSeconds: uploadResult.duration
          ? Math.round(uploadResult.duration)
          : null,
        tags,
        description: description || null,
      });

      organization.storageUsedBytes =
        Number(organization.storageUsedBytes) + file.size;

      uploadedMedia.push(media);
    }

    await organization.save();

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} media file(s) uploaded successfully`,
      data: { media: uploadedMedia },
    });
  } catch (error) {
    console.error("Upload media error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong uploading your media",
      error: error.message,
    });
  }
};

// ======================
// ADD WEB CONTENT
// ======================
exports.addWebContent = async (req, res) => {
  try {
    const { name, webUrl, webIntervalMinutes, description } = req.body;
    const tags = parseTags(req.body.tags);

    if (!name || !webUrl) {
      return res.status(400).json({
        success: false,
        message: "Content Name and Web URL are required",
      });
    }

    const media = await Media.create({
      organizationId: req.user.organizationId,
      uploadedBy: req.user.id,
      name,
      type: "webcontent",
      webUrl,
      webIntervalMinutes: webIntervalMinutes || 5,
      tags,
      description: description || null,
    });

    res.status(201).json({
      success: true,
      message: "Web content has been saved successfully",
      data: { media },
    });
  } catch (error) {
    console.error("Add web content error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong saving your web content",
      error: error.message,
    });
  }
};

// ======================
// LIST MEDIA
// ======================
exports.listMedia = async (req, res) => {
  try {
    const { type, tag, search, page = 1, limit = 10 } = req.query;

    const where = { organizationId: req.user.organizationId };

    if (type && type !== "all") {
      where.type = type;
    }
    if (tag) {
      where.tags = { [Op.contains]: [tag] };
    }
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Media.findAndCountAll({
      where,
      include: [{ association: "uploader", attributes: ["id", "fullName"] }],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        media: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("List media error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong fetching media",
      error: error.message,
    });
  }
};

// ======================
// GET MEDIA BY ID
// ======================
exports.getMediaById = async (req, res) => {
  try {
    const media = await Media.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: [{ association: "uploader", attributes: ["id", "fullName"] }],
    });

    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    res.status(200).json({ success: true, data: { media } });
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong fetching this media item",
      error: error.message,
    });
  }
};

// ======================
// UPDATE MEDIA (metadata only — not the file itself)
// ======================
exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    const { name, description, webIntervalMinutes } = req.body;

    if (name !== undefined) media.name = name;
    if (description !== undefined) media.description = description;
    if (webIntervalMinutes !== undefined && media.type === "webcontent") {
      media.webIntervalMinutes = webIntervalMinutes;
    }
    if (req.body.tags !== undefined) {
      media.tags = parseTags(req.body.tags);
    }

    await media.save();

    res.status(200).json({
      success: true,
      message: "Media updated successfully",
      data: { media },
    });
  } catch (error) {
    console.error("Update media error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong updating this media item",
      error: error.message,
    });
  }
};

// ======================
// DELETE MEDIA
// ======================
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    if (media.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
        resource_type: media.cloudinaryResourceType || "image",
      });

      const organization = await Organization.findByPk(req.user.organizationId);
      organization.storageUsedBytes = Math.max(
        0,
        Number(organization.storageUsedBytes) - Number(media.sizeBytes || 0),
      );
      await organization.save();
    }

    await media.destroy();

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong deleting this media item",
      error: error.message,
    });
  }
};
