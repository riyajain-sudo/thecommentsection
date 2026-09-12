const THEMES = {
  love: {
    color: "#ec6f93",
    keywords: ["love", "heart", "kiss", "kissed", "beloved", "romance", "adore", "adored", "embrace", "darling", "lover", "soulmate", "forever", "together"],
  },
  grief: {
    color: "#5f7fae",
    keywords: ["grief", "loss", "lost", "gone", "goodbye", "cry", "cried", "tears", "mourn", "mourning", "ache", "aching", "empty", "alone", "sorrow", "weep"],
  },
  nature: {
    color: "#4fb87f",
    keywords: ["sky", "tree", "trees", "rain", "ocean", "wind", "flower", "flowers", "sun", "moon", "river", "leaves", "forest", "stars", "mountain", "sea", "petal", "petals", "bloom"],
  },
  hope: {
    color: "#eeac2f",
    keywords: ["hope", "hopeful", "dream", "dreams", "light", "tomorrow", "rise", "believe", "future", "dawn", "wish", "wishes", "faith"],
  },
  anger: {
    color: "#e2492f",
    keywords: ["rage", "anger", "angry", "fight", "burn", "burning", "scream", "fury", "furious", "hate", "break", "breaking", "shatter", "shattered"],
  },
  nostalgia: {
    color: "#8c62d1",
    keywords: ["remember", "childhood", "yesterday", "memory", "memories", "old", "faded", "echo", "nostalgia", "nostalgic"],
  },
  joy: {
    color: "#f0c33e",
    keywords: ["joy", "joyful", "laugh", "laughing", "smile", "smiling", "happy", "happiness", "bright", "dance", "dancing", "sing", "singing", "delight"],
  },
};

// A tag is a deliberate signal from the writer, so it counts for more than
// one incidental word showing up in the body text.
const TAG_WEIGHT = 3;

// Blends a hex color toward white by `amount` (0-1), so a single dominant
// theme still renders as a visible gradient rather than a flat, solid fill.
function lighten(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const channel = (shift) => {
    const value = (num >> shift) & 0xff;
    return Math.round(value + (255 - value) * amount);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function countKeywordHits(text, keywords) {
  let hits = 0;
  for (const word of keywords) {
    const matches = text.match(new RegExp(`\\b${word}\\b`, "gi"));
    if (matches) hits += matches.length;
  }
  return hits;
}

// Scores each theme across a set of poems (title + body text, plus tags
// weighted more heavily), then builds a two-stop CSS gradient from the
// top-scoring theme(s). Returns null when nothing matched at all, so the
// caller can fall back to the normal background.
export function computeThemeGradient(poems) {
  const scores = Object.fromEntries(Object.keys(THEMES).map((name) => [name, 0]));

  for (const poem of poems) {
    const text = `${poem.title || ""} ${poem.body || ""}`;
    for (const [name, { keywords }] of Object.entries(THEMES)) {
      scores[name] += countKeywordHits(text, keywords);
    }
    for (const tag of poem.tags || []) {
      for (const [name, { keywords }] of Object.entries(THEMES)) {
        if (name === tag || keywords.includes(tag)) {
          scores[name] += TAG_WEIGHT;
        }
      }
    }
  }

  const ranked = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) return null;

  const [topTheme] = ranked[0];
  const topColor = THEMES[topTheme].color;
  // With only one theme scoring, blend toward a lighter tint of itself
  // instead of repeating the same color — still a gradient, not a flat fill.
  const secondColor = ranked[1] ? THEMES[ranked[1][0]].color : lighten(topColor, 0.35);

  // The theme colors themselves stay vivid (useful if reused elsewhere),
  // but what actually paints the page is softened so it reads as a gentle
  // wash rather than a bold, saturated background.
  const GRADIENT_SOFTEN = 0.4;

  return {
    theme: topTheme,
    gradient: `linear-gradient(135deg, ${lighten(topColor, GRADIENT_SOFTEN)}, ${lighten(secondColor, GRADIENT_SOFTEN)})`,
  };
}
