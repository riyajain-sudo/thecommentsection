import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPoem, updatePoem } from "../api/client";
import Loader from "../components/Loader";

// "Touch It Up" — where the author of a poem can revise its words or flip
// it between signed and anonymous after the fact.
export default function EditPoem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPoem(id)
      .then((poem) => {
        if (!poem.isOwner) {
          setNotAllowed(true);
          return;
        }
        setTitle(poem.title === "Untitled" ? "" : poem.title);
        setBody(poem.body);
        setIsAnonymous(poem.isAnonymous);
        setTagsInput((poem.tags || []).join(", "));
      })
      .catch(() => setLoadError("This poem may have been taken down, or the link is off."))
      .finally(() => setLoading(false));
  }, [id]);

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

      await updatePoem(id, {
        title: title.trim() || "Untitled",
        body,
        isAnonymous,
        tags,
      });

      navigate(`/poems/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't save those changes right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Fetching it off the line..." />;

  if (notAllowed) {
    return (
      <div className="state-block">
        <h3>Not yours to touch up</h3>
        <p>This poem does not belong to you.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="state-block">
        <h3>Not found</h3>
        <p>{loadError}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Touch It Up</h1>
        <p>Change a word, or change your mind about your name — it's still your line.</p>
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
              : "Posting signed — your name will be shown"}
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
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
