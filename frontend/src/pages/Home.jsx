import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPoems, fetchMyPoems, fetchFavorites } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePoemFeed, INITIAL_PAGE_SIZE } from "../hooks/usePoemFeed";
import { useLoadMoreSentinel } from "../hooks/useLoadMoreSentinel";
import { computeThemeGradient } from "../utils/themeFromPoems";
import { applyPageTheme } from "../utils/pageTheme";
import PoemCard from "../components/PoemCard";
import Loader from "../components/Loader";
import Dropdown from "../components/Dropdown";

const SEARCH_PLACEHOLDER = "Search titles, words, or a username...";

const SORT_OPTIONS = [
  { value: "new", label: "Newest first" },
  { value: "popular", label: "Most loved" },
];

const MINE_FILTER_OPTIONS = [
  { value: "all", label: "All poems" },
  { value: "signed", label: "Signed" },
  { value: "unsigned", label: "Unsigned" },
];

const TAB_META = {
  line: {
    label: "The Line",
    loadingLabel: "Walking down the line...",
    emptyTitle: "The line is empty",
    emptyBody: "Be the first to pin something up.",
  },
  mine: {
    label: "Hung by Me",
    loadingLabel: "Gathering what you've hung up...",
    emptyTitle: "Nothing here yet",
    emptyBody: "Poems you post will show up on this line.",
  },
  favorites: {
    label: "Favorites",
    loadingLabel: "Gathering your favorites...",
    emptyTitle: "Nothing here yet",
    emptyBody: "Poems you like will show up on this line.",
  },
};

export default function Home() {
  const { user } = useAuth();

  // The active tab lives in the URL (?tab=mine) rather than plain component
  // state, so clicking into a poem and then hitting the browser's back
  // button returns to whichever tab you clicked it from, instead of always
  // resetting to "The Line".
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = tabParam === "mine" || tabParam === "favorites" ? tabParam : "line";
  const setTab = (nextTab) => {
    setSearchParams(nextTab === "line" ? {} : { tab: nextTab }, { replace: true });
  };

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("new");
  const [mineFilter, setMineFilter] = useState("all"); // "all" | "signed" | "unsigned"
  const [mineSearch, setMineSearch] = useState("");
  const [favSearch, setFavSearch] = useState("");

  const lineFetcher = useCallback(
    ({ page, limit }) => fetchPoems({ search, sort, page, limit }),
    [search, sort]
  );
  const lineFeed = usePoemFeed({
    fetcher: lineFetcher,
    active: tab === "line",
    resetKey: `${search}|${sort}`,
    debounceMs: 300,
  });

  const mineSigned = mineFilter === "signed" ? "true" : mineFilter === "unsigned" ? "false" : undefined;
  const mineFetcher = useCallback(
    ({ page, limit }) => fetchMyPoems({ page, limit, signed: mineSigned, search: mineSearch }),
    [mineSigned, mineSearch]
  );
  const mineFeed = usePoemFeed({
    fetcher: mineFetcher,
    active: tab === "mine" && !!user,
    resetKey: `${tab === "mine"}|${mineFilter}|${mineSearch}`,
    debounceMs: 300,
  });

  const favoritesFetcher = useCallback(
    ({ page, limit }) => fetchFavorites({ page, limit, search: favSearch }),
    [favSearch]
  );
  const favoritesFeed = usePoemFeed({
    fetcher: favoritesFetcher,
    active: tab === "favorites" && !!user,
    resetKey: `${tab === "favorites"}|${favSearch}`,
    debounceMs: 300,
  });

  // If the user logs out while looking at a tab that requires an account,
  // fall back to the public line rather than showing a tab that no longer
  // applies.
  useEffect(() => {
    if (!user && tab !== "line") setTab("line");
  }, [user, tab]);

  const [mineGradient, setMineGradient] = useState(null);

  // Recomputed from the 5 most recent poems every time this tab is opened —
  // independent of the Signed/Unsigned filter and search box above, since
  // this should always reflect everything you've written, not a filtered
  // view of it.
  useEffect(() => {
    if (tab !== "mine" || !user) {
      setMineGradient(null);
      return;
    }
    let cancelled = false;
    fetchMyPoems({ page: 1, limit: 5 })
      .then((data) => {
        if (!cancelled) setMineGradient(computeThemeGradient(data.poems));
      })
      .catch(() => {
        if (!cancelled) setMineGradient(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  const [favGradient, setFavGradient] = useState(null);

  // Same idea, but from the 5 most recently favorited poems — the "genre"
  // you love reading most, independent of the search box on this tab.
  useEffect(() => {
    if (tab !== "favorites" || !user) {
      setFavGradient(null);
      return;
    }
    let cancelled = false;
    fetchFavorites({ page: 1, limit: 5 })
      .then((data) => {
        if (!cancelled) setFavGradient(computeThemeGradient(data.poems));
      })
      .catch(() => {
        if (!cancelled) setFavGradient(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  // Wash the whole page background in the computed gradient while "Hung by
  // Me" or "Favorites" is open, and put it back to the default the moment
  // any other tab is picked (or this page is left altogether).
  useEffect(() => {
    const activeGradient = tab === "mine" ? mineGradient : tab === "favorites" ? favGradient : null;
    return applyPageTheme(activeGradient);
  }, [tab, mineGradient, favGradient]);

  const feed = { line: lineFeed, mine: mineFeed, favorites: favoritesFeed }[tab];
  const meta = TAB_META[tab];
  const activeSearch = { line: search, mine: mineSearch, favorites: favSearch }[tab];
  const sentinelRef = useLoadMoreSentinel(feed);

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
        <div className="home-tabs">
          <button
            className={`home-tab${tab === "line" ? " is-active" : ""}`}
            onClick={() => setTab("line")}
          >
            The Line
          </button>
          {user && (
            <>
              <button
                className={`home-tab${tab === "mine" ? " is-active" : ""}`}
                onClick={() => setTab("mine")}
              >
                Hung by Me
              </button>
              <button
                className={`home-tab${tab === "favorites" ? " is-active" : ""}`}
                onClick={() => setTab("favorites")}
              >
                Favorites
              </button>
            </>
          )}
        </div>

        {tab === "line" && (
          <div className="line-controls">
            <input
              className="search-input"
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Dropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
        )}

        {tab === "mine" && (
          <div className="line-controls">
            <input
              className="search-input"
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              value={mineSearch}
              onChange={(e) => setMineSearch(e.target.value)}
            />
            <Dropdown value={mineFilter} onChange={setMineFilter} options={MINE_FILTER_OPTIONS} />
          </div>
        )}

        {tab === "favorites" && (
          <div className="line-controls">
            <input
              className="search-input"
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              value={favSearch}
              onChange={(e) => setFavSearch(e.target.value)}
            />
          </div>
        )}

        {feed.loading && <Loader label={meta.loadingLabel} />}

        {!feed.loading && feed.error && (
          <div className="state-block">
            <h3>Something snagged</h3>
            <p>{feed.error}</p>
          </div>
        )}

        {!feed.loading && !feed.error && feed.items.length === 0 && (
          <div className="state-block">
            <h3>{activeSearch ? "No matches" : meta.emptyTitle}</h3>
            <p>
              {activeSearch
                ? "No poems match your search."
                : tab === "mine" && mineFilter !== "all"
                ? `No ${mineFilter} poems here yet.`
                : meta.emptyBody}
            </p>
          </div>
        )}

        {!feed.loading && !feed.error && feed.items.length > 0 && (
          <div className="clothesline-row">
            <div className="poem-grid">
              {feed.items.map((poem) => (
                <PoemCard key={poem.id} poem={poem} showEditIcon={tab !== "line"} />
              ))}
            </div>

            <div ref={sentinelRef} />

            {feed.loadingMore && <Loader label="Pulling more off the line..." />}

            {!feed.loadingMore && !feed.hasMore && feed.items.length > INITIAL_PAGE_SIZE && (
              <p className="feed-end">That's every poem on this line.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
