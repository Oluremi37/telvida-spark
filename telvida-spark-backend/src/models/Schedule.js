const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Schedule = sequelize.define(
  "Schedule",
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
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    playlistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Schedule type
    type: {
      type: DataTypes.ENUM(
        "always",
        "daypart",
        "weekly",
        "daterange",
        "campaign",
      ),
      defaultValue: "always",
    },
    // Priority (higher number = higher priority)
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // For daypart / weekly / daterange
    startTime: {
      type: DataTypes.TIME, // e.g. "08:00:00"
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    // For weekly
    daysOfWeek: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // 0=Sunday, 1=Monday...6=Saturday
      allowNull: true,
    },
    // For daterange / campaign
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "schedules",
    timestamps: true,
  },
);

module.exports = Schedule;
