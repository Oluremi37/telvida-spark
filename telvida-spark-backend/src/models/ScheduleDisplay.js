const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ScheduleDisplay = sequelize.define(
  "ScheduleDisplay",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "schedule_displays",
    timestamps: true,
  },
);

module.exports = ScheduleDisplay;
