import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Playlists.module.css";

function Playlists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");
    const [isLoop, setIsLoop] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");
  async function fetchPlaylists() {
    try {
      setLoading(true);
      const response = await api.get("/playlists");
      setPlaylists(response.data.data.playlists || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const promise = Promise.resolve().then(fetchPlaylists);

    return () => {
      promise.catch(() => {});
    };
  }, []);
    const handleCreatePlaylist = async (e) => {
      e.preventDefault();
      setCreateError("");
      setCreateSuccess("");

      if (!playlistName.trim()) {
        setCreateError("Playlist name is required");
        return;
      }

      setCreateLoading(true);

      try {
        const response = await api.post("/playlists", {
          name: playlistName,
          description: playlistDescription,
          isLoop,
          isShuffle,
          status: "draft",
        });

        if (response.data.success) {
          setCreateSuccess("Playlist created successfully!");
          setPlaylistName("");
          setPlaylistDescription("");
          setIsLoop(true);
          setIsShuffle(false);

          await fetchPlaylists();

          setTimeout(() => {
            setShowCreateModal(false);
            setCreateSuccess("");
          }, 1200);
        }
      } catch (err) {
        setCreateError(
          err.response?.data?.message || "Failed to create playlist",
        );
      } finally {
        setCreateLoading(false);
      }
    };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Playlists</h1>
            <p className={styles.subtitle}>
              Create and manage content playlists for your displays
            </p>
          </div>
          <button
            className={styles.primaryButton}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Playlist
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading playlists...</p>
        ) : playlists.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No playlists yet</h3>
            <p>Create your first playlist to start organizing content</p>
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateModal(true)}
            >
              + Create Playlist
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={styles.card}
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <div className={styles.cardHeader}>
                  <h3>{playlist.name}</h3>
                  <span
                    className={`${styles.status} ${
                      playlist.status === "active"
                        ? styles.active
                        : styles.draft
                    }`}
                  >
                    {playlist.status}
                  </span>
                </div>
                <p className={styles.description}>
                  {playlist.description || "No description"}
                </p>
                <div className={styles.meta}>
                  <span>
                    {playlist.isLoop ? "Loop" : "No loop"} •{" "}
                    {playlist.isShuffle ? "Shuffle" : "In order"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Create Playlist</h2>
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

              <form onSubmit={handleCreatePlaylist}>
                <p className={styles.modalSubtitle}>
                  Create a new playlist for your displays
                </p>

                {createError && <p className={styles.error}>{createError}</p>}
                {createSuccess && (
                  <p className={styles.success}>{createSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>Playlist Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Promo"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                  />
                </div>

                <div className={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isLoop}
                      onChange={(e) => setIsLoop(e.target.checked)}
                    />
                    Loop playlist
                  </label>
                </div>

                <div className={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isShuffle}
                      onChange={(e) => setIsShuffle(e.target.checked)}
                    />
                    Shuffle items
                  </label>
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
                    {createLoading ? "Creating..." : "Create Playlist"}
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

export default Playlists;
