import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, Search, Bell } from "lucide-react";
import styles from "./Header.module.css";

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Simple search: go to media library with query
    navigate(`/media?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => navigate("/dashboard")}
          aria-label="Home"
        >
          <Home size={20} />
        </button>
      </div>

      <form className={styles.searchWrapper} onSubmit={handleSearch}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search media, playlists..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.dropdownWrap} ref={notifRef}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowProfile(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <p className={styles.dropdownTitle}>Notifications</p>
              <p className={styles.dropdownEmpty}>No new notifications</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.dropdownWrap} ref={profileRef}>
          <button
            type="button"
            className={styles.avatar}
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotifications(false);
            }}
            aria-label="Profile menu"
          >
            {userName.charAt(0).toUpperCase()}
          </button>

          {showProfile && (
            <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{userName}</p>
              </div>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setShowProfile(false);
                  navigate("/users");
                }}
              >
                Team / Users
              </button>
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
