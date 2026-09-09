import express from "express";
import User from "../models/User.js";
import Poem from "../models/Poem.js";
import { attachUserIfPresent } from "../middleware/auth.js";
import { paginate } from "../utils/paginate.js";

const router = express.Router();

// GET /api/users/:username/poems — the poems this user has signed their
// name to. Anonymous poems never show up here, even ones by this same
// author, and regardless of who is asking (including the author
// themself) — this route is strictly the public, signed-only view.
router.get("/:username/poems", attachUserIfPresent, async (req, res) => {
  try {
    const author = await User.findOne({ username: req.params.username });
    if (!author) return res.status(404).json({ message: "That user could not be found" });

    const { page, limit, skip } = paginate(req.query);
    const filter = { author: author.id, isAnonymous: false };

    const [poems, total] = await Promise.all([
      Poem.find(filter).populate("author", "username").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Poem.countDocuments(filter),
    ]);

    res.json({
      user: { username: author.username, createdAt: author.createdAt },
      poems: poems.map((p) => p.toPublicJSON(req.user?.id)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(400).json({ message: "Could not load that user's poems", error: err.message });
  }
});

export default router;
