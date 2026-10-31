import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import styles from "./Users.module.css";

function Users() {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("content_creator");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersRes, invitesRes] = await Promise.all([
        api.get("/users"),
        api.get("/users/invitations"),
      ]);

      setMembers(membersRes.data.data?.members || []);
      setInvitations(invitesRes.data.data?.invitations || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchData, 0);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleRoleChange = async (userId, role) => {
    try {
      setMessage("");
      await api.patch(`/users/${userId}/role`, { role });
      setMessage("Role updated successfully");
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }

    setInviteLoading(true);

    try {
      const response = await api.post("/onboarding/invite", {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (response.data.success) {
        setInviteSuccess("Invitation sent successfully");
        setInviteEmail("");
        setInviteRole("content_creator");
        await fetchData();

        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess("");
        }, 1200);
      }
    } catch (err) {
      setInviteError(
        err.response?.data?.message || "Failed to send invitation",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading users...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Users</h1>
            <p className={styles.subtitle}>
              Manage team members and invitations
            </p>
          </div>
          <button
            className={styles.primaryButton}
            onClick={() => {
              setShowInviteModal(true);
              setInviteError("");
              setInviteSuccess("");
            }}
          >
            + Invite User
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <h2>Team Members ({members.length})</h2>

          {members.length === 0 ? (
            <p className={styles.empty}>No members found</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className={styles.name}>{member.fullName}</td>
                      <td>{member.email}</td>
                      <td>
                        <select
                          className={styles.roleSelect}
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value)
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="content_creator">
                            Content Creator
                          </option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className={
                            member.isVerified
                              ? styles.verified
                              : styles.unverified
                          }
                        >
                          {member.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2>Pending Invitations ({invitations.length})</h2>

          {invitations.length === 0 ? (
            <p className={styles.empty}>No pending invitations</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invite) => (
                    <tr key={invite.id}>
                      <td>{invite.email}</td>
                      <td className={styles.roleBadge}>{invite.role}</td>
                      <td>
                        <span className={styles.pending}>{invite.status}</span>
                      </td>
                      <td>{new Date(invite.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showInviteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Invite User</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowInviteModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleInvite}>
                {inviteError && <p className={styles.error}>{inviteError}</p>}
                {inviteSuccess && (
                  <p className={styles.message}>{inviteSuccess}</p>
                )}

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="content_creator">Content Creator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;
