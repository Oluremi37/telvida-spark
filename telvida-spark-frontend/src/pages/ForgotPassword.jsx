import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
     const response = await fetch(
       `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ email }),
       },
     );

      const data = await response.json();

      if (data.success) {
        setSuccess(
          "A password reset link has been sent to your email address. Please check your inbox.",
        );
        setEmail("");
      } else {
        setError(data.message || "Something went wrong");
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
        {/* Left Form Panel (matches Figma - form on left for Forgot Password) */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Forgot Password?</h1>
            <p className={styles.subtitle}>
              Enter your email address and we'll send a link to reset your
              password
            </p>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <input
              type="email"
              placeholder="Enter email address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className={styles.footerText} style={{ marginTop: "24px" }}>
              <Link to="/login">Go to Sign In</Link>
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

export default ForgotPassword;
