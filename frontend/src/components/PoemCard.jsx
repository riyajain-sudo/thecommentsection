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

function Pencil() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.6 2.4a1.7 1.7 0 0 1 2.4 0l1.6 1.6a1.7 1.7 0 0 1 0 2.4L7 17l-4.5 1 1-4.5L13.6 2.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PoemCard({ poem, showEditIcon = true }) {
  // Anonymous poems never reveal who wrote them — no name, no profile link,
  // even for poems by an author who has other, signed poems elsewhere.
  const isSigned = !poem.isAnonymous && poem.authorName;
  const showEdit = poem.isOwner && showEditIcon;

  return (
    <div className={`poem-card${showEdit ? " poem-card--owner" : ""}`}>
      {showEdit && (
        <Link
          to={`/poems/${poem.id}/edit`}
          className="poem-card__edit"
          aria-label="Edit this poem"
          title="Edit this poem"
        >
          <Pencil />
        </Link>
      )}
      <Link to={`/poems/${poem.id}`} className="poem-card__body">
        <span className="poem-card__peg" aria-hidden="true">
          <Peg />
        </span>
        {poem.tags?.[0] && <span className="poem-card__tag">{poem.tags[0]}</span>}
        <h3 className="poem-card__title">{poem.title || "Untitled"}</h3>
        <p className="poem-card__excerpt">{poem.body}</p>
      </Link>
      <div className="poem-card__footer">
        {isSigned ? (
          <Link
            to={`/u/${encodeURIComponent(poem.authorName)}`}
            className="poem-card__author poem-card__author--link"
          >
            {poem.authorName}
          </Link>
        ) : (
          <span className="poem-card__author">Anonymous</span>
        )}
        <span className="poem-card__likes" aria-label={`${poem.likes} likes`}>
          {poem.likedByMe ? "♥" : "♡"} {poem.likes}
        </span>
      </div>
    </div>
  );
}
