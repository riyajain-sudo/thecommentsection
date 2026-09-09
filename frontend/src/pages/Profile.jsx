import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserPoems } from "../api/client";
import { usePoemFeed, INITIAL_PAGE_SIZE } from "../hooks/usePoemFeed";
import { useLoadMoreSentinel } from "../hooks/useLoadMoreSentinel";
import PoemCard from "../components/PoemCard";
import Loader from "../components/Loader";

// A public profile: every poem this user has signed their name to.
// Anonymous poems — even ones by this same author — never appear here,
// no matter who's looking, including the author themself.
export default function Profile() {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setProfileUser(null);
  }, [username]);

  const fetcher = useCallback(
    ({ page, limit }) =>
      fetchUserPoems({ username, page, limit })
        .then((data) => {
          setProfileUser(data.user);
          return data;
        })
        .catch((err) => {
          if (err.response?.status === 404) setNotFound(true);
          throw err;
        }),
    [username]
  );

  const feed = usePoemFeed({ fetcher, active: !notFound, resetKey: username });
  const sentinelRef = useLoadMoreSentinel(feed);

  if (notFound) {
    return (
      <div className="container">
        <div className="state-block">
          <h3>Nobody here</h3>
          <p>That user could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>{profileUser ? `${profileUser.username}'s Line` : "Their Line"}</h1>
        <p>The poems {profileUser?.username || "this user"} has signed their name to.</p>
      </section>

      <div className="line-controls" />

      {feed.loading && <Loader label="Walking down their line..." />}

      {!feed.loading && feed.error && (
        <div className="state-block">
          <h3>Something snagged</h3>
          <p>{feed.error}</p>
        </div>
      )}

      {!feed.loading && !feed.error && feed.items.length === 0 && (
        <div className="state-block">
          <h3>Nothing signed yet</h3>
          <p>{profileUser?.username || "This user"} hasn't put their name on a poem yet.</p>
        </div>
      )}

      {!feed.loading && !feed.error && feed.items.length > 0 && (
        <div className="clothesline-row">
          <div className="poem-grid">
            {feed.items.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>

          <div ref={sentinelRef} />

          {feed.loadingMore && <Loader label="Pulling more off the line..." />}

          {!feed.loadingMore && !feed.hasMore && feed.items.length > INITIAL_PAGE_SIZE && (
            <p className="feed-end">That's every signed poem here.</p>
          )}
        </div>
      )}
    </div>
  );
}
