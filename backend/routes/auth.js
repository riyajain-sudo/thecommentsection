import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are all required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
    });
    if (existing) {
      return res.status(409).json({ message: "That username or email is already taken" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    res.status(201).json({ user: user.toPublicJSON(), token: signToken(user) });
  } catch (err) {
    res.status(400).json({ message: "Could not create that account", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    res.json({ user: user.toPublicJSON(), token: signToken(user) });
  } catch (err) {
    res.status(400).json({ message: "Could not log you in", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Account not found" });
  res.json({ user: user.toPublicJSON() });
});

export default router;
