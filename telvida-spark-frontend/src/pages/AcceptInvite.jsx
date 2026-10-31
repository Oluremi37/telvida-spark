import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Login.module.css";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Fetch invitation details when page loads
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/onboarding/invite/${token}`,
        );
        const data = await response.json();

        if (data.success) {
          setInviteInfo(data.data);
        } else {
          setError(data.message || "Invalid or expired invitation");
        }
      } catch {
        setError("Failed to load invitation details");
      } finally {
        setFetching(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5001/api/onboarding/accept-invite/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            password,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Invitation accepted successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to accept invitation");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.formPanel}>
            <p>Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Left Form */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Accept Invitation</h1>

            {inviteInfo && (
              <p className={styles.subtitle}>
                You have been invited to join{" "}
                <strong>{inviteInfo.organizationName}</strong> as a{" "}
                <strong>{inviteInfo.role.replace("_", " ")}</strong>
              </p>
            )}

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            {inviteInfo && (
              <input
                type="email"
                className={styles.input}
                value={inviteInfo.email}
                disabled
                style={{ backgroundColor: "#f9fafb", color: "#6b7280" }}
              />
            )}

            <input
              type="text"
              placeholder="Full Name"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !inviteInfo}
            >
              {loading ? "Accepting..." : "Accept Invitation"}
            </button>

            <p className={styles.footerText} style={{ marginTop: "24px" }}>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>

        {/* Right Purple Panel */}
        <div className={styles.brandPanel}>
          <div className={styles.sparkIcon}>
            <svg
              viewBox="0 0 680 896"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M130 448C276.253 448 340 386.47 340 238C340 386.47 403.303 448 550 448C403.303 448 340 511.303 340 658C340 511.303 276.253 448 130 448Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcceptInvite;
