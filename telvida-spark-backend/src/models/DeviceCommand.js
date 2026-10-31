const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DeviceCommand = sequelize.define(
  "DeviceCommand",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // FK to Device.id (the row's UUID) — NOT the same as Device.deviceId
    // (the player app's self-generated identifier).
    deviceRecordId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "reboot",
        "restart_player",
        "screenshot",
        "update_software",
        "remote_config",
      ),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    issuedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    acknowledgedAt: DataTypes.DATE,
    details: DataTypes.TEXT,
  },
  {
    tableName: "device_commands",
    timestamps: true,
  },
);

module.exports = DeviceCommand;
