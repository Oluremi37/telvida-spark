import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Cast,
  Image,
  ListMusic,
  PenTool,
  Clock,
  Star,
  Users,
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/displays", label: "Displays", icon: Cast },
  { to: "/media", label: "Media Library", icon: Image },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/layouts", label: "Layout Designer", icon: PenTool },
  { to: "/schedules", label: "Scheduled", icon: Clock },
  { to: "/feedback", label: "Feedback Interaction", icon: Star },
  { to: "/users", label: "Users", icon: Users },
];

function Sidebar({ isOpen = true, onClose }) {
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        isOpen ? styles.sidebarOpen : styles.sidebarClosed
      }`}
    >
      <div className={styles.logo}>
        <span className={styles.logoIcon}>✦</span>
        <span className={styles.logoText}>TELVIDA SPARK</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className={styles.logoutButton} onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
