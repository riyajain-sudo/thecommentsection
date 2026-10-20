import { useCallback, useEffect, useRef, useState } from "react";

export const INITIAL_PAGE_SIZE = 12;
export const MORE_PAGE_SIZE = 6;

// Loads a poem list with infinite scroll: the first page pulls
// INITIAL_PAGE_SIZE poems, and loadMore() pulls MORE_PAGE_SIZE at a time
// after that. `active` gates the fetch (so a hidden tab doesn't fetch),
// and `resetKey` re-runs the initial load whenever it changes (e.g. a new
// search term, or a different profile). `debounceMs` delays that initial
// load, useful while the user is still typing.
export function usePoemFeed({ fetcher, active, resetKey, debounceMs = 0 }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestGeneration = useRef(0);

  useEffect(() => {
    const generation = ++requestGeneration.current;
    let cancelled = false;
    if (!active) {
      setItems([]); setTotal(0); setLoading(false); setLoadingMore(false);
      return () => { cancelled = true; };
    }
    setItems([]); setTotal(0); setLoading(true); setLoadingMore(false);

    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      fetcher({ page: 1, limit: INITIAL_PAGE_SIZE })
        .then((data) => {
          if (cancelled || generation !== requestGeneration.current) return;
          setItems(data.poems);
          setTotal(data.total);
        })
        .catch(() => {
          if (!cancelled && generation === requestGeneration.current) setError("Couldn't reach the CommentSection. Check that the API server is running.");
        })
        .finally(() => {
          if (!cancelled && generation === requestGeneration.current) setLoading(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, resetKey]);

  const hasMore = items.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const generation = requestGeneration.current;
    setLoadingMore(true);
    fetcher({ page: items.length / MORE_PAGE_SIZE + 1, limit: MORE_PAGE_SIZE })
      .then((data) => {
        if (generation !== requestGeneration.current) return;
        setItems((prev) => [...prev, ...data.poems]);
        setTotal(data.total);
      })
      .catch(() => { if (generation === requestGeneration.current) setError("Couldn't load more poems right now."); })
      .finally(() => { if (generation === requestGeneration.current) setLoadingMore(false); });
  }, [fetcher, items.length, loading, loadingMore, hasMore]);

  return { items, total, loading, loadingMore, error, hasMore, loadMore };
}
