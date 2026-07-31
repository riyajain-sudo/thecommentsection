import { Link } from "react-router-dom";

function Peg() {
  return (
    <svg viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="0" width="4.5" height="16" rx="2" fill="#C9B6E4" />
      <rect x="10.5" y="0" width="4.5" height="16" rx="2" fill="#A98FD1" />
      <circle cx="9" cy="3" r="2.6" fill="#7A7290" />
    </svg>
  );
}

export default function PoemCard({ poem }) {
  const author = poem.isAnonymous || !poem.authorName ? "Anonymous" : poem.authorName;

  return (
    <Link to={`/poems/${poem.id}`} className="poem-card">
      <span className="poem-card__peg" aria-hidden="true">
        <Peg />
      </span>
      {poem.tags?.[0] && <span className="poem-card__tag">{poem.tags[0]}</span>}
      <h3 className="poem-card__title">{poem.title || "Untitled"}</h3>
      <p className="poem-card__excerpt">{poem.body}</p>
      <div className="poem-card__footer">
        <span className="poem-card__author">{author}</span>
        <span className="poem-card__likes" aria-label={`${poem.likes} likes`}>
          {poem.likedByMe ? "♥" : "♡"} {poem.likes}
        </span>
      </div>
    </Link>
  );
}
