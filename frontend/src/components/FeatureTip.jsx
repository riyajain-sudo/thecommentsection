import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SHOWN_KEY = "clothesline_theme_tip_shown_count";
const MAX_SHOWS = 3;
const DELAY_MS = 5000;

// A nudge toward Submit, shown up to MAX_SHOWS times total — across both
// active logins and plain page refreshes — so it has a real chance of
// being noticed even if missed the first time, then never again.
export default function FeatureTip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const shown = Number(localStorage.getItem(SHOWN_KEY) || 0);
    if (shown >= MAX_SHOWS) return;

    const timer = setTimeout(() => {
      localStorage.setItem(SHOWN_KEY, String(shown + 1));
      setVisible(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = () => setVisible(false);

  const tryIt = () => {
    // Seen and acted on — no need to keep showing it.
    localStorage.setItem(SHOWN_KEY, String(MAX_SHOWS));
    setVisible(false);
    navigate("/submit");
  };

  if (!visible) return null;

  return (
    <div className="feature-tip">
      <button className="feature-tip__close" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
      <p className="feature-tip__title">✨ Your line changes with you</p>
      <p className="feature-tip__body">
        Notice the colors shifting? This page tints itself to match what you write and what you love. Try it yourself.
      </p>
      <button className="btn btn--primary" onClick={tryIt}>
        Try it
      </button>
    </div>
  );
}
