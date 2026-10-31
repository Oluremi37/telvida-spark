import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./DisplayDetail.module.css";

function DisplayDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [display, setDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commandLoading, setCommandLoading] = useState(null);
  const [commandMessage, setCommandMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDisplay = async () => {
      try {
        const response = await api.get(`/displays/${id}`);
        if (!cancelled) {
          setDisplay(response.data.data.display);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load display");
          setLoading(false);
        }
      }
    };

    loadDisplay();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const sendCommand = async (type) => {
    setCommandLoading(type);
    setCommandMessage("");

    try {
      const response = await api.post(`/displays/${id}/commands`, { type });
      setCommandMessage(
        response.data.message || `Command "${type}" sent successfully`,
      );
    } catch (err) {
      setCommandMessage(
        err.response?.data?.message || `Failed to send command "${type}"`,
      );
    } finally {
      setCommandLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading display...</p>
      </Layout>
    );
  }

  if (error || !display) {
    return (
      <Layout>
        <p className={styles.error}>{error || "Display not found"}</p>
        <button onClick={() => navigate("/displays")}>Back to Displays</button>
      </Layout>
    );
  }

  const commands = [
    { type: "reboot", label: "Reboot Device" },
    { type: "restart_player", label: "Restart Player" },
    { type: "screenshot", label: "Take Screenshot" },
    { type: "update_software", label: "Update Software" },
    { type: "remote_config", label: "Push Config" },
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <button
              className={styles.backButton}
              onClick={() => navigate("/displays")}
            >
              ← Back to Displays
            </button>
            <h1>{display.displayName || "Unnamed Display"}</h1>
            <span
              className={`${styles.status} ${
                display.isOnline ? styles.online : styles.offline
              }`}
            >
              {display.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Device Information */}
          <div className={styles.card}>
            <h3>Device Information</h3>
            <div className={styles.infoRow}>
              <span>Status</span>
              <strong>{display.status}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Platform</span>
              <strong>{display.platform || "—"}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>App Version</span>
              <strong>{display.appVersion || "—"}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>OS Version</span>
              <strong>{display.osVersion || "—"}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Location</span>
              <strong>{display.location || "—"}</strong>
            </div>
          </div>

          {/* Connection */}
          <div className={styles.card}>
            <h3>Connection</h3>
            <div className={styles.infoRow}>
              <span>IP Address</span>
              <strong>{display.ipAddress || "—"}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Last Heartbeat</span>
              <strong>
                {display.lastHeartbeatAt
                  ? new Date(display.lastHeartbeatAt).toLocaleString()
                  : "Never"}
              </strong>
            </div>
            <div className={styles.infoRow}>
              <span>Device ID</span>
              <strong>{display.deviceId || "—"}</strong>
            </div>
          </div>

          {/* Hardware */}
          <div className={styles.card}>
            <h3>Hardware</h3>
            <div className={styles.infoRow}>
              <span>Storage Used</span>
              <strong>
                {display.storageUsedMB
                  ? `${display.storageUsedMB} / ${display.storageTotalMB} MB`
                  : "—"}
              </strong>
            </div>
            <div className={styles.infoRow}>
              <span>Temperature</span>
              <strong>
                {display.temperatureC ? `${display.temperatureC}°C` : "—"}
              </strong>
            </div>
            <div className={styles.infoRow}>
              <span>RAM Usage</span>
              <strong>
                {display.ramUsagePercent ? `${display.ramUsagePercent}%` : "—"}
              </strong>
            </div>
            <div className={styles.infoRow}>
              <span>CPU Usage</span>
              <strong>
                {display.cpuUsagePercent ? `${display.cpuUsagePercent}%` : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Remote Commands */}
        <div className={styles.commandsSection}>
          <h2>Remote Commands</h2>
          <p className={styles.commandsSubtitle}>
            Send commands to this display. The device will execute them when it
            is online.
          </p>

          {commandMessage && (
            <p className={styles.commandMessage}>{commandMessage}</p>
          )}

          <div className={styles.commandsGrid}>
            {commands.map((cmd) => (
              <button
                key={cmd.type}
                className={styles.commandButton}
                onClick={() => sendCommand(cmd.type)}
                disabled={commandLoading === cmd.type}
              >
                {commandLoading === cmd.type ? "Sending..." : cmd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DisplayDetail;
