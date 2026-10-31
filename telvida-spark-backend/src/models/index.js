const User = require("./User");
const Organization = require("./Organization");
const Invitation = require("./Invitation");
const Media = require("./Media");
const Device = require("./Device");
const DeviceCommand = require("./DeviceCommand");
const Playlist = require("./Playlist");
const PlaylistItem = require("./PlaylistItem");
const Schedule = require("./Schedule");
const ScheduleDisplay = require("./ScheduleDisplay");
const Layout = require("./Layout");
const Feedback = require("./Feedback");


// ========== User ↔ Organization ==========
Organization.hasMany(User, {
  foreignKey: "organizationId",
  as: "members",
});

User.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

// ========== Invitation ==========
Organization.hasMany(Invitation, {
  foreignKey: "organizationId",
  as: "invitations",
});

Invitation.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Invitation.belongsTo(User, {
  foreignKey: "invitedBy",
  as: "inviter",
});

// ========== Media ==========
Organization.hasMany(Media, {
  foreignKey: "organizationId",
  as: "media",
});

Media.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

User.hasMany(Media, {
  foreignKey: "uploadedBy",
  as: "uploadedMedia",
});

Media.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});

// ========== Device ==========
Organization.hasMany(Device, {
  foreignKey: "organizationId",
  as: "devices",
});

Device.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Device.hasMany(DeviceCommand, {
  foreignKey: "deviceRecordId",
  as: "commands",
});

DeviceCommand.belongsTo(Device, {
  foreignKey: "deviceRecordId",
  as: "device",
});

DeviceCommand.belongsTo(User, {
  foreignKey: "issuedBy",
  as: "issuer",
});

// ========== Playlist ==========
Organization.hasMany(Playlist, {
  foreignKey: "organizationId",
  as: "playlists",
});

Playlist.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Playlist.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

Playlist.hasMany(PlaylistItem, {
  foreignKey: "playlistId",
  as: "items",
  onDelete: "CASCADE",
});

PlaylistItem.belongsTo(Playlist, {
  foreignKey: "playlistId",
  as: "playlist",
});

// PlaylistItem ↔ Media
PlaylistItem.belongsTo(Media, {
  foreignKey: "mediaId",
  as: "media",
});

Media.hasMany(PlaylistItem, {
  foreignKey: "mediaId",
  as: "playlistItems",
});

// ========== Schedule ==========
Organization.hasMany(Schedule, {
  foreignKey: "organizationId",
  as: "schedules",
});

Schedule.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Schedule.belongsTo(Playlist, {
  foreignKey: "playlistId",
  as: "playlist",
});

Schedule.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

Schedule.hasMany(ScheduleDisplay, {
  foreignKey: "scheduleId",
  as: "displays",
  onDelete: "CASCADE",
});

ScheduleDisplay.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  as: "schedule",
});

ScheduleDisplay.belongsTo(Device, {
  foreignKey: "deviceId",
  as: "device",
});

// ========== Layout ==========
Organization.hasMany(Layout, {
  foreignKey: "organizationId",
  as: "layouts",
});

Layout.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Layout.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

// ========== Feedback ==========
Organization.hasMany(Feedback, {
  foreignKey: "organizationId",
  as: "feedback",
});

Feedback.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Device.hasMany(Feedback, {
  foreignKey: "deviceRecordId",
  as: "feedback",
});

Feedback.belongsTo(Device, {
  foreignKey: "deviceRecordId",
  as: "device",
});

module.exports = {
  User,
  Organization,
  Invitation,
  Media,
  Device,
  DeviceCommand,
  Playlist,
  PlaylistItem,
  Schedule,
  ScheduleDisplay,
  Layout,
  Feedback,
};
