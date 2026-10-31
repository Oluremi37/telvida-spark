import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit3, FiActivity } from "react-icons/fi";
import { LuInfinity } from "react-icons/lu";
import { createOrganization, inviteTeamMember } from "../api/auth";
import styles from "./Onboarding.module.css";

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [organizationName, setOrganizationName] = useState("");
  const [industry, setIndustry] = useState("");
  const [usage, setUsage] = useState("");
  const [website, setWebsite] = useState("");
  const [invites, setInvites] = useState([
    { email: "", role: "content_creator" },
  ]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));

  const handleFinish = () => {
    navigate("/dashboard");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  // ========== STEP 2: Create Organization ==========
  const handleOrganizationSubmit = async () => {
    if (!organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createOrganization({
        name: organizationName,
        industry,
        website,
        usage,
      });

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 3: Send Invites ==========
  const handleInviteSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      for (const invite of invites) {
        if (invite.email.trim()) {
          await inviteTeamMember(invite.email, invite.role);
        }
      }

      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.logo}>
            <div className={styles.logoBox}>
              <span>✦</span>
            </div>
            <span className={styles.logoText}>TELVIDA SPARK</span>
          </div>

          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>1</div>
                {step > 1 && <div className={styles.stepLine}></div>}
              </div>
              <div>
                <p className={styles.stepTitle}>Welcome!</p>
                <p className={styles.stepDesc}>Set up your account</p>
              </div>
            </div>

            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>2</div>
                {step > 2 && <div className={styles.stepLine}></div>}
              </div>
              <div>
                <p className={styles.stepTitle}>Organization Information</p>
                <p className={styles.stepDesc}>
                  This helps us personalize your experience
                </p>
              </div>
            </div>

            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>3</div>
                {step > 3 && <div className={styles.stepLine}></div>}
              </div>
              <div>
                <p className={styles.stepTitle}>Invite Team Members</p>
                <p className={styles.stepDesc}>
                  Add team members now or skip and invite later
                </p>
              </div>
            </div>

            <div className={`${styles.step} ${step >= 4 ? styles.active : ""}`}>
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>4</div>
              </div>
              <div>
                <p className={styles.stepTitle}>You're all set!</p>
                <p className={styles.stepDesc}>Go to Dashboard</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebarSpark}>
            <svg
              width="140"
              height="140"
              viewBox="0 0 281 288"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.2"
                d="M0.75 166.25C116.012 166.25 166.25 117.758 166.25 0.75C166.25 117.758 216.139 166.25 331.75 166.25C216.139 166.25 166.25 216.139 166.25 331.75C166.25 216.139 116.012 166.25 0.75 166.25Z"
                fill="#990099"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Right Content */}
        <div className={styles.content}>
          <button className={styles.skipButton} onClick={handleSkip}>
            Skip Onboarding
          </button>

          {error && <p className={styles.error}>{error}</p>}

          {step === 1 && (
            <div className={styles.stepContent}>
              <h1>Welcome to Telvida Spark</h1>
              <p className={styles.subtitle}>
                Let’s set up your account and get you started in just a few
                steps
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <LuInfinity size={20} />
                  </div>
                  <div>
                    <strong>Manage unlimited screens</strong>
                    <p>Control and monitor all your displays from one place.</p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FiEdit3 size={20} />
                  </div>
                  <div>
                    <strong>Create engaging contents</strong>
                    <p>Design, schedule and deliver content effortlessly.</p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <FiActivity size={20} />
                  </div>
                  <div>
                    <strong>Track performance</strong>
                    <p>
                      Get real-time insights and feedback from your displays.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.buttonContainer}>
                <button className={styles.primaryButton} onClick={nextStep}>
                  Get Started
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h1>Tell us about your organization</h1>
              <p className={styles.subtitle}>
                This helps us personalize your experience.
              </p>

              <div className={styles.formGroup}>
                <label>Organization Name</label>
                <input
                  type="text"
                  placeholder="Enter organisation name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select industry</option>
                  <option value="retail">Retail</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="corporate">Corporate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>How will you use Telvida Spark</label>
                <select
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                >
                  <option value="">Select all that apply</option>
                  <option value="digital-signage">Digital Signage</option>
                  <option value="menu-boards">Menu Boards</option>
                  <option value="internal-comms">
                    Internal Communications
                  </option>
                  <option value="advertising">Advertising</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Organization Website (optional)</label>
                <input
                  type="url"
                  placeholder="www.organisation.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className={styles.buttonRow}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setStep(3)}
                  disabled={loading}
                >
                  Skip
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleOrganizationSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Next"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h1>Invite your team members</h1>
              <p className={styles.subtitle}>
                Add your team now or skip and invite later.
              </p>

              {invites.map((invite, index) => (
                <div key={index} className={styles.inviteRow}>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={invite.email}
                    onChange={(e) => {
                      const updated = [...invites];
                      updated[index].email = e.target.value;
                      setInvites(updated);
                    }}
                  />
                  <select
                    value={invite.role}
                    onChange={(e) => {
                      const updated = [...invites];
                      updated[index].role = e.target.value;
                      setInvites(updated);
                    }}
                  >
                    <option value="content_creator">Content creator</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              ))}

              <button
                className={styles.addButton}
                onClick={() =>
                  setInvites([
                    ...invites,
                    { email: "", role: "content_creator" },
                  ])
                }
              >
                + Add
              </button>

              <div className={styles.buttonRow}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setStep(4)}
                  disabled={loading}
                >
                  Skip
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleInviteSubmit}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepContent} style={{ textAlign: "center" }}>
              <div className={styles.successIcon}>✓</div>
              <h1>You're all set!</h1>
              <p className={styles.subtitle}>
                Your account is ready, start creating, scheduling and managing
                your content.
              </p>
              <button className={styles.primaryButton} onClick={handleFinish}>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
