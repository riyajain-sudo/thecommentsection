import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { deletePoem, fetchPoem, likePoem } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function PoemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popping, setPopping] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    fetchPoem(id)
      .then(setPoem)
      .catch(() => setError("This poem may have been taken down, or the link is off."))
      .finally(() => setLoading(false));
  }, [id]);

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
    if (!window.confirm("Take this poem down for good?")) return;
    try {
      await deletePoem(id);
      navigate("/");
    } catch {
      window.alert("Couldn't take it down right now. Please try again.");
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

  const author = poem.isAnonymous || !poem.authorName ? "Anonymous" : poem.authorName;
  const date = new Date(poem.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container">
      <article className="poem-detail">
        <div className="poem-detail__meta">
          <span>{author}</span>
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

          {poem.isOwner && (
            <button className="btn btn--ghost" onClick={handleDelete}>
              Take down
            </button>
          )}
        </div>

        {likeError && (
          <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
            {likeError} <Link to="/login" style={{ textDecoration: "underline" }}>Log in</Link>
          </p>
        )}
      </article>
    </div>
  );
}
