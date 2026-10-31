import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./ScheduleDetail.module.css";

function ScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [type, setType] = useState("always");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isActive, setIsActive] = useState(true);

  const [playlists, setPlaylists] = useState([]);
  const [allDisplays, setAllDisplays] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);

  const loadOptions = useCallback(async () => {
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
      setAllDisplays(displayList);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedules/${id}`);
      const data = response.data.data.schedule;
      setSchedule(data);
      setName(data.name || "");
      setPlaylistId(data.playlistId || "");
      setType(data.type || "always");
      setStartTime(
        data.startTime ? String(data.startTime).slice(0, 5) : "09:00",
      );
      setEndTime(data.endTime ? String(data.endTime).slice(0, 5) : "17:00");
      setIsActive(data.isActive !== false);
      setSelectedDeviceIds(
        (data.displays || [])
          .map((d) => d.deviceId || d.device?.id)
          .filter(Boolean),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadData = setTimeout(() => {
      fetchSchedule();
      loadOptions();
    }, 0);

    return () => clearTimeout(loadData);
  }, [fetchSchedule, loadOptions]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const body = {
        name,
        playlistId,
        type,
        isActive,
        deviceIds: selectedDeviceIds,
      };

      if (type === "daypart") {
        body.startTime = startTime;
        body.endTime = endTime;
      }

      const response = await api.put(`/schedules/${id}`, body);

      if (response.data.success) {
        setMessage("Schedule updated successfully");
        await fetchSchedule();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate this schedule?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      navigate("/schedules");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to deactivate");
    }
  };

 const handleReactivate = async () => {
   try {
     await api.patch(`/schedules/${id}/reactivate`);
     setMessage("Schedule reactivated");
     await fetchSchedule();
   } catch (err) {
     setMessage(err.response?.data?.message || "Failed to reactivate");
   }
 };

  const toggleDevice = (deviceId) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((d) => d !== deviceId)
        : [...prev, deviceId],
    );
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading schedule...</p>
      </Layout>
    );
  }

  if (error || !schedule) {
    return (
      <Layout>
        <p className={styles.error}>{error || "Schedule not found"}</p>
        <button onClick={() => navigate("/schedules")}>
          Back to Schedules
        </button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/schedules")}
        >
          ← Back to Schedules
        </button>

        <div className={styles.header}>
          <h1>{schedule.name}</h1>
          <span
            className={`${styles.status} ${
              isActive ? styles.active : styles.inactive
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <h2>Schedule Settings</h2>
          <form onSubmit={handleSave}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="always">Always</option>
                <option value="daypart">Daypart</option>
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
                {allDisplays.length === 0 ? (
                  <p className={styles.hint}>No displays available</p>
                ) : (
                  allDisplays.map((d) => (
                    <label key={d.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.includes(d.id)}
                        onChange={() => toggleDevice(d.id)}
                      />
                      {d.displayName || d.deviceId || "Unnamed"}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className={styles.actions}>
              {isActive ? (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDeactivate}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleReactivate}
                >
                  Reactivate
                </button>
              )}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ScheduleDetail;
