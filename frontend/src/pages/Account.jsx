import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't delete your account right now. Please try again."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Account</h1>
        <p>Manage your details, sign out, or take your account down for good.</p>
      </section>

      <div className="submit-card" style={{ maxWidth: 520 }}>
        {error && <div className="banner banner--error">{error}</div>}

        <div className="field">
          <label>Username</label>
          <p>{user?.username}</p>
        </div>
        <div className="field">
          <label>Email</label>
          <p>{user?.email}</p>
        </div>

        <div className="form-actions" style={{ justifyContent: "flex-start" }}>
          <button className="btn btn--ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="danger-zone">
          <h3>Delete account</h3>
          <p>
            This permanently deletes your account, every poem you've hung up, and your likes
            on other people's poems. This can't be undone.
          </p>

          {!confirming ? (
            <button className="btn btn--danger" onClick={() => setConfirming(true)}>
              Delete my account
            </button>
          ) : (
            <div className="danger-zone__confirm">
              <p>Are you sure? There's no getting this back.</p>
              <div className="form-actions" style={{ justifyContent: "flex-start" }}>
                <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Taking it down..." : "Yes, delete everything"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
