import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, googleLogin } from "../api/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./Login.module.css";

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!acceptedTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);

    try {
      const data = await register(fullName, email, password);

      if (data.success) {
        alert(
          "Account created successfully! Please check your email to verify your account.",
        );
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
      setError(err.response?.data?.message || "Google Sign-Up failed.");
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
              style={{ width: "100%", height: "auto" }}
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
            <h1 className={styles.title}>Get Started Now</h1>

            {error && <p className={styles.error}>{error}</p>}

            <input
              type="text"
              placeholder="Enter full Name"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

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

            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#">Terms of Service</a> &{" "}
                <a href="#">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !acceptedTerms}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.googleButtonWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-Up failed")}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <p className={styles.footerText}>
              Have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
