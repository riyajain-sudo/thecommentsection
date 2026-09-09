import express from "express";
import Poem from "../models/Poem.js";
import User from "../models/User.js";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.js";
import { paginate } from "../utils/paginate.js";

const router = express.Router();

// Builds the $or clause for a text search across a poem's title/body, plus
// its author's username — but a username match only ever surfaces that
// author's *signed* poems. An anonymous poem never becomes findable by
// searching the name of the person who wrote it.
const buildSearchFilter = async (search) => {
  if (!search) return null;

  const matchingAuthors = await User.find({ username: { $regex: search, $options: "i" } }).select("_id");
  const matchingAuthorIds = matchingAuthors.map((u) => u._id);

  return {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
      { isAnonymous: false, author: { $in: matchingAuthorIds } },
    ],
  };
};

// GET /api/poems?search=&tag=&sort=new|popular&page=1&limit=12
router.get("/", attachUserIfPresent, async (req, res) => {
  try {
    const { search = "", tag = "", sort = "new" } = req.query;
    const { page, limit, skip } = paginate(req.query);

    const filter = {};
    if (tag) filter.tags = tag.toLowerCase();
    Object.assign(filter, await buildSearchFilter(search));

    const sortOption = sort === "popular" ? { createdAt: -1 } : { createdAt: -1 };

    let poemsQuery = Poem.find(filter).populate("author", "username").sort(sortOption);
    if (sort !== "popular") {
      poemsQuery = poemsQuery.skip(skip).limit(limit);
    }

    let [poems, total] = await Promise.all([poemsQuery, Poem.countDocuments(filter)]);

    if (sort === "popular") {
      poems = poems
        .sort((a, b) => b.likedBy.length - a.likedBy.length)
        .slice(skip, skip + limit);
    }

    res.json({
      poems: poems.map((p) => p.toPublicJSON(req.user?.id)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load poems", error: err.message });
  }
});

// GET /api/poems/mine?signed=true|false&search= — poems the logged-in user
// has written; `signed=true` filters to just the ones they signed their
// name to, `signed=false` to just the ones they posted anonymously.
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const filter = { author: req.user.id };
    if (req.query.signed === "true") filter.isAnonymous = false;
    else if (req.query.signed === "false") filter.isAnonymous = true;
    Object.assign(filter, await buildSearchFilter(search));

    const [poems, total] = await Promise.all([
      Poem.find(filter).populate("author", "username").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Poem.countDocuments(filter),
    ]);

    res.json({
      poems: poems.map((p) => p.toPublicJSON(req.user.id)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load your poems", error: err.message });
  }
});

// GET /api/poems/favorites?search= — poems the logged-in user has liked
router.get("/favorites", requireAuth, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const filter = { likedBy: req.user.id };
    Object.assign(filter, await buildSearchFilter(search));

    const [poems, total] = await Promise.all([
      Poem.find(filter).populate("author", "username").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Poem.countDocuments(filter),
    ]);

    res.json({
      poems: poems.map((p) => p.toPublicJSON(req.user.id)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load your favorites", error: err.message });
  }
});

// GET /api/poems/:id
router.get("/:id", attachUserIfPresent, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id).populate("author", "username");
    if (!poem) return res.status(404).json({ message: "That poem could not be found" });
    res.json(poem.toPublicJSON(req.user?.id));
  } catch {
    res.status(400).json({ message: "That poem could not be found" });
  }
});

// POST /api/poems — requires an account, but you can still post anonymously
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, body, isAnonymous = true, tags = [] } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Your poem needs some words before it can be shared" });
    }

    let poem = await Poem.create({
      title,
      body,
      isAnonymous,
      tags,
      author: req.user.id,
    });
    poem = await poem.populate("author", "username");

    res.status(201).json({ poem: poem.toPublicJSON(req.user.id) });
  } catch (err) {
    res.status(400).json({ message: "Could not save your poem", error: err.message });
  }
});

// PATCH /api/poems/:id — only the poem's own author can edit it, including
// flipping it between signed and anonymous.
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ message: "That poem could not be found" });

    if (poem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "This poem does not belong to you" });
    }

    const { title, body, isAnonymous, tags } = req.body;

    if (body !== undefined) {
      if (!body.trim()) {
        return res.status(400).json({ message: "Your poem needs some words before it can be shared" });
      }
      poem.body = body;
    }
    if (title !== undefined) poem.title = title;
    if (isAnonymous !== undefined) poem.isAnonymous = isAnonymous;
    if (tags !== undefined) poem.tags = tags;

    await poem.save();
    await poem.populate("author", "username");

    res.json(poem.toPublicJSON(req.user.id));
  } catch (err) {
    res.status(400).json({ message: "Could not update that poem", error: err.message });
  }
});

// POST /api/poems/:id/like — toggles like on/off and keeps the user's
// favorites list in sync
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id).populate("author", "username");
    if (!poem) return res.status(404).json({ message: "That poem could not be found" });

    const alreadyLiked = poem.likedBy.some((id) => id.toString() === req.user.id);

    if (alreadyLiked) {
      poem.likedBy = poem.likedBy.filter((id) => id.toString() !== req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: poem.id } });
    } else {
      poem.likedBy.push(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: poem.id } });
    }

    await poem.save();
    res.json(poem.toPublicJSON(req.user.id));
  } catch (err) {
    res.status(400).json({ message: "Could not update that like", error: err.message });
  }
});

// DELETE /api/poems/:id — only the poem's own author can take it down
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) return res.status(404).json({ message: "That poem could not be found" });

    if (poem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "This poem does not belong to you" });
    }

    await poem.deleteOne();
    await User.updateMany({ favorites: poem.id }, { $pull: { favorites: poem.id } });

    res.json({ message: "Poem taken down" });
  } catch {
    res.status(400).json({ message: "Could not delete that poem" });
  }
});

export default router;
