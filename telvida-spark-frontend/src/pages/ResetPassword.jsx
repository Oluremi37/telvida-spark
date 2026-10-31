import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Login.module.css";

function ResetPassword() {
  const { token } = useParams(); // token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
        `http://localhost:5001/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Password reset successfully! You can now log in.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Form on the left */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              Set a strong password to secure access
            </p>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className={styles.footerText} style={{ marginTop: "24px" }}>
              <Link to="/login">← Back to Sign In</Link>
            </p>
          </form>
        </div>

        {/* Purple panel on the right */}
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

export default ResetPassword;
