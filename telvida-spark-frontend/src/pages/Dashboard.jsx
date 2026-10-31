import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Monitor, CheckCircle2, XCircle, Database } from "lucide-react";
import Layout from "../components/Layout";
import { getDashboardStats } from "../api/dashboard";
import styles from "./Dashboard.module.css";

const STATUS_COLORS = {
  online: "#A6006B",
  idle: "#a5b4fc",
  offline: "#fb923c",
};

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const MB = 1024 * 1024;
  const GB = 1024 * MB;
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p>Loading dashboard...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className={styles.error}>{error}</p>
      </Layout>
    );
  }

  const donutData = [
    { name: "Online", value: stats.screenStatus.online, color: STATUS_COLORS.online },
    { name: "Idle", value: stats.screenStatus.idle, color: STATUS_COLORS.idle },
    { name: "Offline", value: stats.screenStatus.offline, color: STATUS_COLORS.offline },
  ];

  const storageChartData = stats.libraryStorageUsage.map((item) => ({
    name: item.label,
    value: item.sizeBytes,
  }));

  return (
    <Layout>
      <h1 className={styles.greeting}>Welcome back!</h1>
      <p className={styles.subtitle}>
        Here's what's happening with your screens today.
      </p>

      <div className={styles.statGrid}>
        <StatCard
          icon={<Monitor size={20} />}
          label="Total Screens"
          value={stats.totalScreens}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Online Screens"
          value={stats.onlineScreens}
        />
        <StatCard
          icon={<XCircle size={20} />}
          label="Offline Screens"
          value={stats.offlineScreens}
        />
        <StatCard
          icon={<Database size={20} />}
          label="Storage space"
          value={formatBytes(stats.storageUsedBytes)}
        />
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
          <h3>Screen status</h3>
          <div className={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {donutData.map((item) => (
                <div key={item.name} className={styles.legendItem}>
                  <span
                    className={styles.dot}
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Library Storage Usage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={storageChartData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={60} />
              <Tooltip formatter={(value) => formatBytes(value)} />
              <Bar dataKey="value" fill="#990099" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className={styles.statCard}>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>
      <div className={styles.statIcon}>{icon}</div>
    </div>
  );
}

export default Dashboard;