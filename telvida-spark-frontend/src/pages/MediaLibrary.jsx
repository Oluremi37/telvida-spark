import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./MediaLibrary.module.css";

function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailSuccess, setDetailSuccess] = useState("");

  // web content modal state
  const [showWebModal, setShowWebModal] = useState(false);
  const [webName, setWebName] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [webInterval, setWebInterval] = useState(5);
  const [webDescription, setWebDescription] = useState("");
  const [webTags, setWebTags] = useState("");
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState("");
  const [webSuccess, setWebSuccess] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get("/media");
      setMedia(response.data.data.media || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadMedia = async () => {
      try {
        setLoading(true);
        const response = await api.get("/media");

        if (isMounted) {
          setMedia(response.data.data.media || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load media");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!files || files.length === 0) {
      setUploadError("Please select at least one file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // Append all selected files
      files.forEach((file) => {
        formData.append("files", file);
      });

      if (name) formData.append("name", name);
      if (description) formData.append("description", description);
      if (tags) formData.append("tags", tags);

      const response = await api.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadSuccess(
          response.data.message || "Media uploaded successfully!",
        );
        setFiles([]);
        setName("");
        setDescription("");
        setTags("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        await fetchMedia();

        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess("");
        }, 1500);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

 const filteredMedia = media.filter((item) => {
   const matchesFilter = filter === "all" || item.type === filter;
   const matchesSearch =
     !search ||
     item.name?.toLowerCase().includes(search.toLowerCase()) ||
     item.description?.toLowerCase().includes(search.toLowerCase());
   return matchesFilter && matchesSearch;
 });

  const openDetail = (item) => {
    setSelectedMedia(item);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
    setEditTags(Array.isArray(item.tags) ? item.tags.join(", ") : "");
    setDetailError("");
    setDetailSuccess("");
    setShowDetailModal(true);
  };

  const handleUpdateMedia = async (e) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setDetailLoading(true);
    setDetailError("");
    setDetailSuccess("");

    try {
      const response = await api.patch(`/media/${selectedMedia.id}`, {
        name: editName,
        description: editDescription,
        tags: editTags,
      });

      if (response.data.success) {
        setDetailSuccess("Media updated successfully");
        await fetchMedia();
        setTimeout(() => {
          setShowDetailModal(false);
          setDetailSuccess("");
        }, 1200);
      }
    } catch (err) {
      setDetailError(err.response?.data?.message || "Failed to update media");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await api.delete(`/media/${selectedMedia.id}`);

      if (response.data.success) {
        setShowDetailModal(false);
        await fetchMedia();
      }
    } catch (err) {
      setDetailError(err.response?.data?.message || "Failed to delete media");
    } finally {
      setDetailLoading(false);
    }
  };
  
const handleAddWebContent = async (e) => {
  e.preventDefault();
  setWebError("");
  setWebSuccess("");

  if (!webName.trim() || !webUrl.trim()) {
    setWebError("Name and Web URL are required");
    return;
  }

  setWebLoading(true);

  try {
    const response = await api.post("/media/web-content", {
      name: webName,
      webUrl,
      webIntervalMinutes: Number(webInterval) || 5,
      description: webDescription,
      tags: webTags,
    });

    if (response.data.success) {
      setWebSuccess("Web content added successfully!");
      setWebName("");
      setWebUrl("");
      setWebInterval(5);
      setWebDescription("");
      setWebTags("");

      await fetchMedia();

      setTimeout(() => {
        setShowWebModal(false);
        setWebSuccess("");
      }, 1500);
    }
  } catch (err) {
    setWebError(err.response?.data?.message || "Failed to add web content");
  } finally {
    setWebLoading(false);
  }
};

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Media Library</h1>
            <p className={styles.subtitle}>
              Manage your images, videos, documents and web content
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.secondaryButton}
              onClick={() => setShowWebModal(true)}
            >
              + Add Web Content
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Media
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {["all", "image", "video", "audio", "document", "webcontent"].map(
            (type) => (
              <button
                key={type}
                className={`${styles.filterButton} ${
                  filter === type ? styles.activeFilter : ""
                }`}
                onClick={() => setFilter(type)}
              >
                {type === "all"
                  ? "All"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ),
          )}
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search media by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading media...</p>
        ) : filteredMedia.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3>No media found</h3>
            <p>
              {search || filter !== "all"
                ? "Try a different search or filter"
                : "Upload your first media file or add web content to get started"}
            </p>
            {!search && filter === "all" && (
              <div className={styles.emptyActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowWebModal(true)}
                >
                  + Add Web Content
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={() => setShowUploadModal(true)}
                >
                  + Upload Media
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => openDetail(item)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.preview}>
                  {item.type === "image" && item.fileUrl ? (
                    <img src={item.fileUrl} alt={item.name} />
                  ) : (
                    <div className={styles.placeholder}>
                      {item.type.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3>{item.name}</h3>
                    <span className={styles.typeBadge}>{item.type}</span>
                  </div>
                  <p className={styles.meta}>
                    {item.sizeBytes
                      ? `${(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                      : item.webUrl
                        ? "Web content"
                        : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Upload Media</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadError("");
                    setUploadSuccess("");
                    setFiles([]);
                    setName("");
                    setDescription("");
                    setTags("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpload}>
                <p className={styles.modalSubtitle}>
                  You can select multiple files (images, videos, audio or
                  documents)
                </p>

                {uploadError && <p className={styles.error}>{uploadError}</p>}
                {uploadSuccess && (
                  <p className={styles.success}>{uploadSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                    multiple
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Company Logo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (optional, comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. logo, brand, promo"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Media Detail Modal */}
        {/* Detail / Edit Modal */}
        {showDetailModal && selectedMedia && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Media Details</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </button>
              </div>

              {detailError && <p className={styles.error}>{detailError}</p>}
              {detailSuccess && (
                <p className={styles.success}>{detailSuccess}</p>
              )}

              {/* Preview */}
              <div className={styles.detailPreview}>
                {selectedMedia.type === "image" && selectedMedia.fileUrl ? (
                  <img src={selectedMedia.fileUrl} alt={selectedMedia.name} />
                ) : (
                  <div className={styles.placeholder}>
                    {selectedMedia.type.toUpperCase()}
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateMedia}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Type</label>
                  <input type="text" value={selectedMedia.type} disabled />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={handleDeleteMedia}
                    disabled={detailLoading}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={detailLoading}
                  >
                    {detailLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Add Web Content Modal */}
        {/* Add Web Content Modal */}
        {showWebModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Add Web Content</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowWebModal(false);
                    setWebError("");
                    setWebSuccess("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddWebContent}>
                <p className={styles.modalSubtitle}>
                  Add a website URL that will be displayed on your screens
                </p>

                {webError && <p className={styles.error}>{webError}</p>}
                {webSuccess && <p className={styles.success}>{webSuccess}</p>}

                <div className={styles.formGroup}>
                  <label>Content Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Company Homepage"
                    value={webName}
                    onChange={(e) => setWebName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Web URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Refresh Interval (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={webInterval}
                    onChange={(e) => setWebInterval(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={webDescription}
                    onChange={(e) => setWebDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (optional, comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. website, homepage"
                    value={webTags}
                    onChange={(e) => setWebTags(e.target.value)}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowWebModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={webLoading}
                  >
                    {webLoading ? "Saving..." : "Add Web Content"}
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

export default MediaLibrary;
