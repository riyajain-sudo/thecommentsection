import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import poemRoutes from "./routes/poems.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";


//this is for Cloudflare to work with Vite, otherwise it will throw a 403 error when trying to access the API from the frontend
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to your .env file (see .env.example).");
  process.exit(1);
}

connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: "100kb" }));

// A gentle rate limit so the wall of poems can't be spammed.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Too many poems shared recently, please slow down and try again later" },
});
app.use("/api/poems", (req, res, next) => {
  if (req.method === "POST") return submitLimiter(req, res, next);
  next();
});

app.use("/api/poems", poemRoutes);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, please wait a bit and try again" },
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));


//for cloudflare
// // Serve the built React (Vite) frontend.
// // This must come BEFORE the 404 handler below, or it will never run.
// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// app.get("*", (req, res, next) => {
//   // Let unmatched /api routes still fall through to the 404 handler
//   // instead of being served index.html.
//   if (req.path.startsWith("/api")) return next();
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on our end" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;