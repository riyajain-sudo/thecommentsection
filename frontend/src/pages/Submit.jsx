import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPoem } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Submit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!body.trim()) {
      setError("Your poem needs some words before it can be shared.");
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { poem } = await createPoem({
        title: title.trim() || "Untitled",
        body,
        isAnonymous,
        tags,
      });

      navigate(`/poems/${poem.id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't pin that up right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Pin something to the line</h1>
        <p>Say it plainly or say it slant. It's yours to sign or leave unsigned.</p>
      </section>

      <form className="submit-card" onSubmit={handleSubmit}>
        {error && <div className="banner banner--error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="field">
          <label htmlFor="body">Your words</label>
          <textarea
            id="body"
            placeholder="Start typing..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={6000}
            required
          />
        </div>

        <div className="toggle-row">
          <button
            type="button"
            className="toggle"
            role="switch"
            aria-pressed={!isAnonymous}
            onClick={() => setIsAnonymous((v) => !v)}
            aria-label="Toggle posting with your name"
          />
          <small>
            {isAnonymous
              ? "Posting anonymously — your name won't be shown"
              : `Posting as ${user?.username}`}
          </small>
        </div>

        <div className="field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            type="text"
            placeholder="grief, morning, love"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <span className="tag-input-hint">Comma-separated, up to 5</span>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Pinning it up..." : "Hang it on the line"}
          </button>
        </div>
      </form>
    </div>
  );
}
