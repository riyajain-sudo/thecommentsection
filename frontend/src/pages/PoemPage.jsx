import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { deletePoem, fetchPoem, likePoem } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { computeThemeGradient } from "../utils/themeFromPoems";
import { applyPageTheme } from "../utils/pageTheme";
import Loader from "../components/Loader";

export default function PoemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justPosted = location.state?.justPosted;
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popping, setPopping] = useState(false);
  const [likeError, setLikeError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchPoem(id)
      .then(setPoem)
      .catch(() => setError("This poem may have been taken down, or the link is off."))
      .finally(() => setLoading(false));
  }, [id]);

  // Wash the page background in this poem's own theme, and put it back to
  // the default the moment it's left.
  useEffect(() => {
    if (!poem) return;
    return applyPageTheme(computeThemeGradient([poem]));
  }, [poem]);

  const handleLike = async () => {
    if (!user) {
      setLikeError("Log in to save poems you love.");
      return;
    }
    setLikeError("");
    setPopping(true);
    setTimeout(() => setPopping(false), 260);
    try {
      const updated = await likePoem(id);
      setPoem(updated);
    } catch {
      setLikeError("Couldn't update that like right now.");
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await deletePoem(id);
      navigate("/?tab=mine");
    } catch {
      setDeleteError("Couldn't take it down right now. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) return <Loader label="Unpinning this one for you..." />;

  if (error || !poem) {
    return (
      <div className="state-block">
        <h3>Not found</h3>
        <p>{error}</p>
      </div>
    );
  }

  const isSigned = !poem.isAnonymous && poem.authorName;
  const date = new Date(poem.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container">
      <article className="poem-detail">
        {justPosted && (
          <div className="banner banner--success">
            Your poem is hanging on the line.{" "}
            <Link to="/?tab=mine" style={{ textDecoration: "underline", fontWeight: 700 }}>
              See your line
            </Link>
          </div>
        )}

        <div className="poem-detail__meta">
          {isSigned ? (
            <Link to={`/u/${encodeURIComponent(poem.authorName)}`} className="poem-card__author--link">
              {poem.authorName}
            </Link>
          ) : (
            <span>Anonymous</span>
          )}
          <span>·</span>
          <span>{date}</span>
        </div>
        <h1 className="poem-detail__title">{poem.title}</h1>
        <p className="poem-detail__body">{poem.body}</p>

        {poem.tags?.length > 0 && (
          <div className="poem-detail__tags">
            {poem.tags.map((tag) => (
              <span className="poem-card__tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="poem-detail__actions">
          <button
            className={`like-btn ${poem.likedByMe ? "liked" : ""} ${popping ? "pop" : ""}`}
            onClick={handleLike}
          >
            <span className="like-btn__heart">{poem.likedByMe ? "♥" : "♡"}</span>
            {poem.likes} {poem.likes === 1 ? "person" : "people"} felt this
          </button>

          {poem.isOwner && !confirmingDelete && (
            <>
              <Link to={`/poems/${id}/edit`} className="btn btn--ghost">
                Touch it up
              </Link>
              <button className="btn btn--ghost" onClick={() => setConfirmingDelete(true)}>
                Take down
              </button>
            </>
          )}
        </div>

        {poem.isOwner && confirmingDelete && (
          <div className="danger-zone__confirm">
            <p>Take this poem down for good? There's no getting it back.</p>
            {deleteError && <div className="banner banner--error">{deleteError}</div>}
            <div className="form-actions" style={{ justifyContent: "flex-start" }}>
              <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Taking it down..." : "Yes, take it down"}
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {likeError && (
          <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
            {likeError} <Link to="/login" style={{ textDecoration: "underline" }}>Log in</Link>
          </p>
        )}
      </article>
    </div>
  );
}
