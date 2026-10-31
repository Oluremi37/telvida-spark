import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Layouts.module.css";

function Layouts() {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [layoutDescription, setLayoutDescription] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const parseLayouts = (response) => {
    return Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data?.layouts || response.data.layouts || [];
  };

  const fetchLayouts = useCallback(async () => {
    try {
      const response = await api.get("/layouts");
      setLayouts(parseLayouts(response));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load layouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/layouts")
      .then((response) => {
        if (!cancelled) {
          setLayouts(parseLayouts(response));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load layouts");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateLayout = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!layoutName.trim()) {
      setCreateError("Layout name is required");
      return;
    }

    setCreateLoading(true);

    try {
      const response = await api.post("/layouts", {
        name: layoutName,
        description: layoutDescription,
        width: Number(width) || 1920,
        height: Number(height) || 1080,
        status: "draft",
      });

      if (response.data.success) {
        setCreateSuccess("Layout created successfully!");
        setLayoutName("");
        setLayoutDescription("");
        setWidth(1920);
        setHeight(1080);

        await fetchLayouts();

        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess("");
        }, 1200);
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create layout");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Layout Designer</h1>
            <p className={styles.subtitle}>
              Design screen layouts with zones for your content
            </p>
          </div>
          <button
            className={styles.primaryButton}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Layout
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading layouts...</p>
        ) : layouts.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No layouts yet</h3>
            <p>
              Create your first layout to design how content appears on screens
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateModal(true)}
            >
              + Create Layout
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className={styles.card}
                onClick={() => navigate(`/layouts/${layout.id}`)}
              >
                <div className={styles.cardHeader}>
                  <h3>{layout.name}</h3>
                  <span
                    className={`${styles.status} ${
                      status === "active"
                        ? styles.statusActive
                        : styles.statusDraft
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className={styles.meta}>
                  {layout.width} × {layout.height}
                  {layout.description ? ` • ${layout.description}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Create Layout</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                    setCreateSuccess("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateLayout}>
                <p className={styles.modalSubtitle}>
                  Create a new screen layout
                </p>

                {createError && <p className={styles.error}>{createError}</p>}
                {createSuccess && (
                  <p className={styles.success}>{createSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>Layout Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Lobby Layout"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={layoutDescription}
                    onChange={(e) => setLayoutDescription(e.target.value)}
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
                    {createLoading ? "Creating..." : "Create Layout"}
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

export default Layouts;
