const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Media = sequelize.define(
  "Media",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("image", "video", "document", "audio", "webcontent"),
      allowNull: false,
    },

    // File-backed media (image/video/document/audio)
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cloudinaryPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cloudinaryResourceType: {
      type: DataTypes.STRING, // "image" | "video" | "raw" — needed to delete correctly later
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING, // e.g. "jpg", "mp4", "pdf", "html"
      allowNull: true,
    },
    sizeBytes: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Web content (webcontent type only) — matches the Figma "Web Content" modal
    webUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webIntervalMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
    },

    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "media",
    timestamps: true,
  },
);

module.exports = Media;
