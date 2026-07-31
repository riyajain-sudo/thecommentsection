import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create that account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Join the line</h1>
        <p>Create an account to post, save favorites, and keep track of what you've written.</p>
      </section>

      <form className="submit-card" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        {error && <div className="banner banner--error">{error}</div>}

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            minLength={2}
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="tag-input-hint">
            Shown on poems you choose not to post anonymously.
          </span>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="tag-input-hint">At least 8 characters.</span>
        </div>

        <div className="form-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
            Already have an account? <Link to="/login" style={{ textDecoration: "underline" }}>Log in</Link>
          </span>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
