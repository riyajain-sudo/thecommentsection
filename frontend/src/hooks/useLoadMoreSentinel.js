import { useEffect, useRef } from "react";

// Returns a ref to attach to a sentinel element at the bottom of a list.
// Once that sentinel scrolls into view, loadMore() fires — this is what
// drives infinite scroll for any usePoemFeed() result.
export function useLoadMoreSentinel({ loading, hasMore, loadMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  return sentinelRef;
}
