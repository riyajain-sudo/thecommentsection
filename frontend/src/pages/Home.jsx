import { useEffect, useState } from "react";
import { fetchPoems } from "../api/client";
import PoemCard from "../components/PoemCard";
import Loader from "../components/Loader";

export default function Home() {
  const [poems, setPoems] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      fetchPoems({ search, sort, page })
        .then((data) => {
          setPoems(data.poems);
          setPages(data.pages);
        })
        .catch(() =>
          setError(
            "Couldn't reach the clothesline. Check that the API server is running."
          )
        )
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, sort, page]);

  return (
    <>
      <section className="hero">
        <h1>
          Hang your <em>words</em> out to dry
        </h1>
        <p>
          A quiet line for poems and half-formed thoughts. Sign them or don't —
          everyone here is reading with the same soft attention.
        </p>
      </section>

      <div className="container">
        <div className="line-controls">
          <input
            className="search-input"
            type="text"
            placeholder="Search titles and words..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="select-input"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="new">Newest first</option>
            <option value="popular">Most loved</option>
          </select>
        </div>

        {loading && <Loader label="Walking down the line..." />}

        {!loading && error && (
          <div className="state-block">
            <h3>Something snagged</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && poems.length === 0 && (
          <div className="state-block">
            <h3>The line is empty</h3>
            <p>Be the first to pin something up.</p>
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
            <button
              className="btn btn--ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              className="btn btn--ghost"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
