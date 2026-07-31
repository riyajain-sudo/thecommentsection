import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Welcome back</h1>
        <p>Log in to hang up a new poem or find the ones you've loved.</p>
      </section>

      <form className="submit-card" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        {error && <div className="banner banner--error">{error}</div>}

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
            New here? <Link to="/register" style={{ textDecoration: "underline" }}>Create an account</Link>
          </span>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}
