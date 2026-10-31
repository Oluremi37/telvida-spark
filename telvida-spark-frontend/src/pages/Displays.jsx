import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Displays.module.css";

function Displays() {
  const navigate = useNavigate();
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const fetchDisplays = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/displays");
      setDisplays(response.data.data.displays || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load displays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchDisplays, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchDisplays]);

  const handlePairDisplay = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");
    setModalLoading(true);

    try {
      const response = await api.post("/displays/authorize", {
        pairingCode,
        displayName,
        location,
      });

      if (response.data.success) {
        setModalSuccess("Display paired successfully!");
        setPairingCode("");
        setDisplayName("");
        setLocation("");

        // Refresh the list
        await fetchDisplays();

        // Close modal after short delay
        setTimeout(() => {
          setShowModal(false);
          setModalSuccess("");
        }, 1500);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to pair display");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Displays</h1>
            <p className={styles.subtitle}>Manage and monitor your screens</p>
          </div>
          <button
            className={styles.primaryButton}
            onClick={() => setShowModal(true)}
          >
            + Pair New Display
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading displays...</p>
        ) : displays.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No displays yet</h3>
            <p>Pair your first screen to get started</p>
            <button
              className={styles.primaryButton}
              onClick={() => setShowModal(true)}
            >
              + Pair New Display
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {displays.map((display) => (
              <div key={display.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{display.displayName || "Unnamed Display"}</h3>
                  <span
                    className={`${styles.status} ${
                      display.isOnline ? styles.online : styles.offline
                    }`}
                  >
                    {display.isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <p>
                    <strong>Location:</strong> {display.location || "—"}
                  </p>
                  <p>
                    <strong>Platform:</strong> {display.platform || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong> {display.status}
                  </p>
                  <p>
                    <strong>Last seen:</strong>{" "}
                    {display.lastHeartbeatAt
                      ? new Date(display.lastHeartbeatAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => navigate(`/displays/${display.id}`)}
                  >
                    View
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => navigate(`/displays/${display.id}`)}
                  >
                    Commands
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pair Display Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Pair New Display</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowModal(false);
                    setModalError("");
                    setModalSuccess("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePairDisplay}>
                <p className={styles.modalSubtitle}>
                  Enter the pairing code shown on your device screen.
                </p>

                {modalError && <p className={styles.error}>{modalError}</p>}
                {modalSuccess && (
                  <p className={styles.success}>{modalSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>Pairing Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 482916"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lobby Screen"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Location (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, NG"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={modalLoading}
                  >
                    {modalLoading ? "Pairing..." : "Pair Display"}
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

export default Displays;
