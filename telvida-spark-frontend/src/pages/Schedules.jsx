import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Schedules.module.css";

function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [type, setType] = useState("always");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [deviceIds, setDeviceIds] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const url = showInactive
        ? "/schedules?includeInactive=true"
        : "/schedules";
      const response = await api.get(url);
      setSchedules(response.data.data?.schedules || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    const loadSchedules = async () => {
      await fetchSchedules();
    };

    loadSchedules();
  }, [fetchSchedules]);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const [playlistsRes, displaysRes] = await Promise.all([
        api.get("/playlists"),
        api.get("/displays"),
      ]);

      const playlistList = Array.isArray(playlistsRes.data.data)
        ? playlistsRes.data.data
        : playlistsRes.data.data?.playlists || [];

      const displayList = Array.isArray(displaysRes.data.data)
        ? displaysRes.data.data
        : displaysRes.data.data?.displays || [];

      setPlaylists(playlistList);
      setDisplays(displayList);
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to load playlists or displays",
      );
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!name.trim() || !playlistId) {
      setCreateError("Name and playlist are required");
      return;
    }

    setCreateLoading(true);

    try {
      const body = {
        name,
        playlistId,
        type,
        deviceIds,
      };

      if (type === "daypart") {
        body.startTime = startTime;
        body.endTime = endTime;
      }

      const response = await api.post("/schedules", body);

      if (response.data.success) {
        setCreateSuccess("Schedule created successfully!");
        setName("");
        setPlaylistId("");
        setType("always");
        setDeviceIds([]);
        await fetchSchedules();
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess("");
        }, 1200);
      }
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create schedule",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleDevice = (id) => {
    setDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Schedules</h1>
            <p className={styles.subtitle}>
              Schedule playlists to play on your displays
            </p>
          </div>
          <button className={styles.primaryButton} onClick={openCreateModal}>
            + Create Schedule
          </button>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No schedules yet</h3>
            <p>Create a schedule to push content to your displays</p>
            <button className={styles.primaryButton} onClick={openCreateModal}>
              + Create Schedule
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={styles.card}
                onClick={() => navigate(`/schedules/${schedule.id}`)}
              >
                <div className={styles.cardHeader}>
                  <h3>{schedule.name}</h3>
                  <span
                    className={`${styles.status} ${
                      schedule.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {schedule.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className={styles.meta}>
                  {schedule.playlist?.name || "No playlist"} •{" "}
                  {schedule.type || "always"}
                  {schedule.startTime
                    ? ` • ${schedule.startTime}–${schedule.endTime || "—"}`
                    : ""}
                </p>
                <p className={styles.displays}>
                  {schedule.displays?.length || 0} display(s)
                </p>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Create Schedule</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSchedule}>
                {createError && <p className={styles.error}>{createError}</p>}
                {createSuccess && (
                  <p className={styles.success}>{createSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Rotation"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Playlist</label>
                  <select
                    value={playlistId}
                    onChange={(e) => setPlaylistId(e.target.value)}
                    required
                  >
                    <option value="">Select playlist</option>
                    {playlists.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="always">Always</option>
                    <option value="daypart">Daypart (time of day)</option>
                  </select>
                </div>

                {type === "daypart" && (
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label>Start time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>End time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Displays</label>
                  <div className={styles.checkboxList}>
                    {displays.length === 0 ? (
                      <p className={styles.hint}>No displays available</p>
                    ) : (
                      displays.map((d) => (
                        <label key={d.id} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={deviceIds.includes(d.id)}
                            onChange={() => toggleDevice(d.id)}
                          />
                          {d.displayName || d.deviceId || "Unnamed"}
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={createLoading}
                  >
                    {createLoading ? "Creating..." : "Create Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Schedules;
