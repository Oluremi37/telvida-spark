import { useState, useEffect } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Feedback.module.css";

const TYPES = [
  "all",
  "rating",
  "survey",
  "lead",
  "complaint",
  "qr",
  "product_rating",
];

function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchSummary = async () => {
    try {
      const response = await api.get("/feedback/summary");
      setSummary(response.data.data?.summary || null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (typeFilter !== "all") params.type = typeFilter;

      const response = await api.get("/feedback", { params });
      setFeedback(response.data.data?.feedback || []);
      setPagination(response.data.data?.pagination || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const response = await api.get("/feedback/summary");
        if (!cancelled) {
          setSummary(response.data.data?.summary || null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFeedback = async () => {
      try {
        const params = { page, limit: 20 };
        if (typeFilter !== "all") params.type = typeFilter;

        const response = await api.get("/feedback", { params });
        if (cancelled) return;

        setFeedback(response.data.data?.feedback || []);
        setPagination(response.data.data?.pagination || null);
        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        setError(err.response?.data?.message || "Failed to load feedback");
        setLoading(false);
      }
    };

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [typeFilter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback entry?")) return;
    try {
      await api.delete(`/feedback/${id}`);
      await fetchFeedback();
      await fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const formatPayload = (item) => {
    if (!item.payload) return "—";
    if (item.type === "rating" && item.payload.stars != null) {
      return `${item.payload.stars} ★`;
    }
    return JSON.stringify(item.payload);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Feedback Interaction</h1>
            <p className={styles.subtitle}>
              View feedback collected from your displays
            </p>
          </div>
        </div>

        {summary && (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Total</p>
              <p className={styles.summaryValue}>{summary.total}</p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Avg Rating</p>
              <p className={styles.summaryValue}>
                {summary.averageRating != null ? summary.averageRating : "—"}
              </p>
            </div>
            {Object.entries(summary.byType || {}).map(([type, count]) => (
              <div key={type} className={styles.summaryCard}>
                <p className={styles.summaryLabel}>{type}</p>
                <p className={styles.summaryValue}>{count}</p>
              </div>
            ))}
          </div>
        )}

        <div className={styles.filters}>
          {TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.filterButton} ${
                typeFilter === t ? styles.activeFilter : ""
              }`}
              onClick={() => {
                setTypeFilter(t);
                setPage(1);
              }}
            >
              {t === "all" ? "All" : t.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p>Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No feedback yet</h3>
            <p>Feedback submitted from displays will appear here</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Display</th>
                    <th>Details</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.typeBadge}>{item.type}</span>
                      </td>
                      <td>{item.device?.displayName || "—"}</td>
                      <td className={styles.payload}>{formatPayload(item)}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Feedback;
