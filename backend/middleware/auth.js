import jwt from "jsonwebtoken";

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
};

// Blocks the request unless a valid token is present.
export const requireAuth = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ message: "Please log in to do that" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired, please log in again" });
  }
};

// Attaches req.user if a valid token is present, but doesn't block the
// request otherwise. Used on public GET routes so we can flag things like
// "did I like this poem" without forcing a login.
export const attachUserIfPresent = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
  } catch {
    // ignore invalid/expired tokens on optional routes
  }
  next();
};
