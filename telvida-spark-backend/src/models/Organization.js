const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Organization = sequelize.define(
  "Organization",
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
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usage: {
      type: DataTypes.ARRAY(DataTypes.STRING), // multiple options
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Added to support Media upload size limits (PRD Section 2 tiers) and
    // the Dashboard's storage stats. Every org defaults to Starter since
    // billing/plan-selection is deferred for now.
    plan: {
      type: DataTypes.ENUM("starter", "professional", "enterprise"),
      defaultValue: "starter",
    },
    storageUsedBytes: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "organizations",
    timestamps: true,
  },
);

module.exports = Organization;
