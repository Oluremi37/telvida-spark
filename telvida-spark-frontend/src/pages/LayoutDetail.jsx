import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./LayoutDetail.module.css";

function LayoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [status, setStatus] = useState("draft");
    const [zones, setZones] = useState([]);
    
    const [draggingZoneId, setDraggingZoneId] = useState(null);
    const [resizingZoneId, setResizingZoneId] = useState(null);
    const [dragStart, setDragStart] = useState({
      x: 0,
      y: 0,
      zoneX: 0,
      zoneY: 0,
    });
    const [resizeStart, setResizeStart] = useState({
      x: 0,
      y: 0,
      zoneW: 0,
      zoneH: 0,
    });

  const fetchLayout = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/layouts/${id}`);
      const data = response.data.data;
      setLayout(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setWidth(data.width || 1920);
      setHeight(data.height || 1080);
      setStatus(data.status || "draft");
      setZones(Array.isArray(data.zones) ? data.zones : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layout");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Defer the state updates performed by fetchLayout until after the effect.
    Promise.resolve().then(fetchLayout);
  }, [fetchLayout]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await api.put(`/layouts/${id}`, {
        name,
        description,
        width: Number(width),
        height: Number(height),
        status,
        zones,
      });

      if (response.data.success) {
        setMessage("Layout saved successfully");
        await fetchLayout();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Archive this layout?")) return;

    try {
      await api.delete(`/layouts/${id}`);
      navigate("/layouts");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to archive layout");
    }
  };

  const addZone = () => {
    const newZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      x: 0,
      y: 0,
      width: 400,
      height: 300,
    };
    setZones([...zones, newZone]);
  };

  const updateZone = (zoneId, field, value) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, [field]: value } : z)),
    );
  };

  const removeZone = (zoneId) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading layout...</p>
      </Layout>
    );
  }

  if (error || !layout) {
    return (
      <Layout>
        <p className={styles.error}>{error || "Layout not found"}</p>
        <button onClick={() => navigate("/layouts")}>Back to Layouts</button>
      </Layout>
    );
    }
    
    const handleZoneMouseDown = (e, zone) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingZoneId(zone.id);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        zoneX: zone.x,
        zoneY: zone.y,
      });
    };

    const handleResizeMouseDown = (e, zone) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingZoneId(zone.id);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        zoneW: zone.width,
        zoneH: zone.height,
      });
    };

    const handleMouseMove = (e) => {
      if (!layout) return;

      const canvas = document.getElementById("layout-canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

     if (draggingZoneId) {
       const dx = (e.clientX - dragStart.x) * scaleX;
       const dy = (e.clientY - dragStart.y) * scaleY;

       setZones((prev) =>
         prev.map((z) =>
           z.id === draggingZoneId
             ? {
                 ...z,
                 x: Math.round(
                   Math.max(0, Math.min(width - z.width, dragStart.zoneX + dx)),
                 ),
                 y: Math.round(
                   Math.max(
                     0,
                     Math.min(height - z.height, dragStart.zoneY + dy),
                   ),
                 ),
               }
             : z,
         ),
       );
     }
     if (resizingZoneId) {
       const dw = (e.clientX - resizeStart.x) * scaleX;
       const dh = (e.clientY - resizeStart.y) * scaleY;

       setZones((prev) =>
         prev.map((z) =>
           z.id === resizingZoneId
             ? {
                 ...z,
                 width: Math.round(
                   Math.max(50, Math.min(width - z.x, resizeStart.zoneW + dw)),
                 ),
                 height: Math.round(
                   Math.max(50, Math.min(height - z.y, resizeStart.zoneH + dh)),
                 ),
               }
             : z,
         ),
       );
     }
    };

    const handleMouseUp = () => {
      setDraggingZoneId(null);
      setResizingZoneId(null);
    };

  return (
    <Layout>
      <div className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/layouts")}
        >
          ← Back to Layouts
        </button>

        <div className={styles.header}>
          <h1>{layout.name}</h1>
          <span
            className={`${styles.status} ${
              status === "active" ? styles.statusActive : styles.statusDraft
            }`}
          >
            {status}
          </span>
        </div>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.grid}>
          {/* Settings */}
          <div className={styles.card}>
            <h2>Layout Settings</h2>
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
                <label>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                >
                  Archive
                </button>
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

          {/* Zones */}
          <div className={styles.card}>
            <div className={styles.zonesHeader}>
              <h2>Zones</h2>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={addZone}
              >
                + Add Zone
              </button>
            </div>

            {zones.length === 0 ? (
              <p className={styles.empty}>
                No zones yet. Click “+ Add Zone”, then drag and resize on the
                preview.
              </p>
            ) : (
              <div className={styles.zonesList}>
                {zones.map((zone) => (
                  <div key={zone.id} className={styles.zoneItem}>
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) =>
                        updateZone(zone.id, "name", e.target.value)
                      }
                      className={styles.zoneName}
                    />
                    <div className={styles.zoneFields}>
                      <label>
                        X
                        <input
                          type="number"
                          value={zone.x}
                          onChange={(e) =>
                            updateZone(zone.id, "x", Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        Y
                        <input
                          type="number"
                          value={zone.y}
                          onChange={(e) =>
                            updateZone(zone.id, "y", Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        W
                        <input
                          type="number"
                          value={zone.width}
                          onChange={(e) =>
                            updateZone(zone.id, "width", Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        H
                        <input
                          type="number"
                          value={zone.height}
                          onChange={(e) =>
                            updateZone(
                              zone.id,
                              "height",
                              Number(e.target.value),
                            )
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeZone(zone.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simple canvas preview */}
        <div
          id="layout-canvas"
          className={styles.canvas}
          style={{ aspectRatio: `${width} / ${height}` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={styles.zoneBox}
              style={{
                left: `${(zone.x / width) * 100}%`,
                top: `${(zone.y / height) * 100}%`,
                width: `${(zone.width / width) * 100}%`,
                height: `${(zone.height / height) * 100}%`,
              }}
              onMouseDown={(e) => handleZoneMouseDown(e, zone)}
            >
              <span>{zone.name}</span>
              <div
                className={styles.resizeHandle}
                onMouseDown={(e) => handleResizeMouseDown(e, zone)}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default LayoutDetail;
