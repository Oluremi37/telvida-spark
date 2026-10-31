const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PlaylistItem = sequelize.define(
  "PlaylistItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    playlistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    mediaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true, // null = use media default duration
    },
  },
  {
    tableName: "playlist_items",
    timestamps: true,
  },
);

module.exports = PlaylistItem;
