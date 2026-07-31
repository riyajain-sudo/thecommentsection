import { useEffect, useState } from "react";
import { fetchFavorites } from "../api/client";
import PoemCard from "../components/PoemCard";
import Loader from "../components/Loader";

export default function Favorites() {
  const [poems, setPoems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchFavorites({ page })
      .then((data) => {
        setPoems(data.poems);
        setPages(data.pages);
      })
      .catch(() => setError("Couldn't load your favorites right now."))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Poems you've loved</h1>
        <p>Everything you've marked with a ♡, all in one place.</p>
      </section>

      <div className="line-controls" style={{ justifyContent: "flex-end" }} />

      {loading && <Loader label="Gathering your favorites..." />}

      {!loading && error && (
        <div className="state-block">
          <h3>Something snagged</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && poems.length === 0 && (
        <div className="state-block">
          <h3>Nothing here yet</h3>
          <p>Poems you like will show up on this line.</p>
        </div>
      )}

      {!loading && !error && poems.length > 0 && (
        <div className="clothesline-row">
          <div className="poem-grid">
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && pages > 1 && (
        <div className="pagination">
          <button className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span>
            {page} / {pages}
          </span>
          <button className="btn btn--ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
