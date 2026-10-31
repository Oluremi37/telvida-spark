import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "../api/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, accessToken } = await login(email, password);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", user.fullName);

      if (user.organizationId) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const { user, accessToken } = await googleLogin(
        credentialResponse.credential,
      );

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", user.fullName);

      if (user.organizationId) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google Sign-In failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Left Purple Panel */}
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

        {/* Right Form Panel */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Welcome back</h1>

            {error && <p className={styles.error}>{error}</p>}

            <input
              type="email"
              placeholder="Enter email address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password
            </Link>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.googleButtonWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed")}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <p className={styles.footerText}>
              Don't have an account? <Link to="/signup">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
