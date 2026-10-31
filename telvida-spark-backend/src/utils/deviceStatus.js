const OFFLINE_THRESHOLD_MINUTES =
  Number(process.env.OFFLINE_THRESHOLD_MINUTES) || 5;

function isDeviceOnline(lastHeartbeatAt) {
  if (!lastHeartbeatAt) return false;
  const thresholdMs = OFFLINE_THRESHOLD_MINUTES * 60 * 1000;
  return Date.now() - new Date(lastHeartbeatAt).getTime() <= thresholdMs;
}

function withOnlineStatus(device) {
  const plain = device.toJSON ? device.toJSON() : device;
  // Never expose these to the web portal — deviceTokenHash is a secret,
  // and pendingDeviceToken is meant for the physical device's eyes only,
  // delivered via the pairing-status poll, not the admin API.
  const { deviceTokenHash, pendingDeviceToken, ...safeDevice } = plain;
  return { ...safeDevice, isOnline: isDeviceOnline(plain.lastHeartbeatAt) };
}

module.exports = {
  isDeviceOnline,
  withOnlineStatus,
  OFFLINE_THRESHOLD_MINUTES,
};
