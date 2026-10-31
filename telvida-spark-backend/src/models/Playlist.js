const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Playlist = sequelize.define(
  "Playlist",
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
    isLoop: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isShuffle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "archived"),
      defaultValue: "draft",
    },
  },
  {
    tableName: "playlists",
    timestamps: true,
  },
);

module.exports = Playlist;
