const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Layout = sequelize.define(
  "Layout",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Canvas resolution
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1920,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1080,
    },
    /**
     * zones structure (JSONB):
     * [
     *   {
     *     id: "zone-uuid",
     *     name: "Zone 1",
     *     x: 0,          // percentage or pixels (your choice)
     *     y: 0,
     *     width: 70,
     *     height: 60,
     *     widgets: [
     *       {
     *         id: "widget-uuid",
     *         type: "video" | "image" | "ticker" | "weather" | "rss" | "clock" | "html",
     *         content: {},      // type-specific data
     *         settings: {}      // volume, loop, duration, etc.
     *       }
     *     ]
     *   }
     * ]
     */
    zones: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // Optional reference to a pre-built template
    templateId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "archived"),
      defaultValue: "draft",
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "layouts",
    timestamps: true,
  },
);

module.exports = Layout;
