import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./PlaylistDetail.module.css";

function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Edit fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoop, setIsLoop] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [status, setStatus] = useState("draft");

  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/playlists/${id}`);
      const data = response.data.data.playlist;
      setPlaylist(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setIsLoop(data.isLoop ?? true);
      setIsShuffle(data.isShuffle ?? false);
      setStatus(data.status || "draft");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlaylist();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchPlaylist]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await api.put(`/playlists/${id}`, {
        name,
        description,
        isLoop,
        isShuffle,
        status,
      });

      if (response.data.success) {
        setMessage("Playlist updated successfully");
        await fetchPlaylist();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      await api.delete(`/playlists/${id}`);
      navigate("/playlists");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete playlist");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading playlist...</p>
      </Layout>
    );
  }

  if (error || !playlist) {
    return (
      <Layout>
        <p className={styles.error}>{error || "Playlist not found"}</p>
        <button onClick={() => navigate("/playlists")}>
          Back to Playlists
        </button>
      </Layout>
    );
  }

  const openAddMediaModal = async () => {
    setAddError("");
    setSelectedMediaIds([]);
    setShowAddMediaModal(true);

    try {
      const response = await api.get("/media");
      setAvailableMedia(response.data.data.media || []);
    } catch {
      setAddError("Failed to load media library");
    }
  };

  const toggleMediaSelection = (mediaId) => {
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId],
    );
  };

  const handleAddMedia = async () => {
    if (selectedMediaIds.length === 0) {
      setAddError("Please select at least one media item");
      return;
    }

    setAddLoading(true);
    setAddError("");

    try {
      const currentOrder = playlist.items?.length || 0;

      const items = selectedMediaIds.map((mediaId, index) => ({
        mediaId,
        duration: 30,
        order: currentOrder + index + 1,
      }));

      const response = await api.post(`/playlists/${id}/items`, { items });

      if (response.data.success) {
        setShowAddMediaModal(false);
        await fetchPlaylist();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add media");
    } finally {
      setAddLoading(false);
    }
  };

    const handleRemoveItem = async (itemId) => {
      if (!window.confirm("Remove this item from the playlist?")) return;

      try {
        await api.delete(`/playlists/${id}/items/${itemId}`);
        await fetchPlaylist();
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to remove item");
      }
    };

const handleReorder = async (itemId, direction) => {
  if (!playlist.items || playlist.items.length < 2) return;

  const sorted = [...playlist.items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((item) => item.id === itemId);

  if (index === -1) return;
  if (direction === "up" && index === 0) return;
  if (direction === "down" && index === sorted.length - 1) return;

  const newIndex = direction === "up" ? index - 1 : index + 1;

  // Swap
  const temp = sorted[index];
  sorted[index] = sorted[newIndex];
  sorted[newIndex] = temp;

  const items = sorted.map((item) => ({ id: item.id }));

  try {
    await api.put(`/playlists/${id}/items/reorder`, { items });
    await fetchPlaylist();
  } catch (err) {
    setMessage(err.response?.data?.message || "Failed to reorder items");
  }
    };
    

  return (
    <Layout>
      <div className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/playlists")}
        >
          ← Back to Playlists
        </button>

        <div className={styles.header}>
          <h1>{playlist.name}</h1>
          <span
            className={`${styles.status} ${
              playlist.status === "active" ? styles.active : styles.draft
            }`}
          >
            {playlist.status}
          </span>
        </div>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.grid}>
          {/* Settings Card */}
          <div className={styles.card}>
            <h2>Playlist Settings</h2>
            <form onSubmit={handleUpdate}>
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

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                >
                  Delete
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

          {/* Items Card */}
          <div className={styles.card}>
            <div className={styles.itemsHeader}>
              <h2>Playlist Items</h2>
              <button
                className={styles.secondaryButton}
                onClick={openAddMediaModal}
              >
                + Add Media
              </button>
            </div>

            {playlist.items && playlist.items.length > 0 ? (
              <div className={styles.itemsList}>
                {playlist.items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <strong>{item.media?.name || "Unknown media"}</strong>
                        <span>
                          {item.media?.type} • {item.duration || 30}s
                        </span>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleReorder(item.id, "up")}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleReorder(item.id, "down")}
                        >
                          ↓
                        </button>
                        <span className={styles.order}>#{item.order}</span>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className={styles.emptyItems}>
                No media items yet. Click “+ Add Media” to add content.
              </p>
            )}
          </div>
        </div>
        {showAddMediaModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Add Media to Playlist</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowAddMediaModal(false)}
                >
                  ×
                </button>
              </div>

              {addError && <p className={styles.error}>{addError}</p>}

              <div className={styles.mediaSelectList}>
                {availableMedia.length === 0 ? (
                  <p>No media found in your library.</p>
                ) : (
                  availableMedia.map((media) => (
                    <label key={media.id} className={styles.mediaSelectItem}>
                      <input
                        type="checkbox"
                        checked={selectedMediaIds.includes(media.id)}
                        onChange={() => toggleMediaSelection(media.id)}
                      />
                      <div>
                        <strong>{media.name}</strong>
                        <span>{media.type}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowAddMediaModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleAddMedia}
                  disabled={addLoading}
                >
                  {addLoading
                    ? "Adding..."
                    : `Add Selected (${selectedMediaIds.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PlaylistDetail;
