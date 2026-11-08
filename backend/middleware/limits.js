const rateLimit = require("express-rate-limit");

const make = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

exports.authLimiter = make(15, 20, "Too many attempts. Try again in 15 minutes.");
exports.apiLimiter = make(1, 120, "Too many requests. Slow down.");
exports.scanLimiter = make(60, 30, "Scan limit reached (30 per hour).");
exports.patchLimiter = make(60, 10, "Patch limit reached (10 per hour).");

// Only one patch (Docker run) per user at a time
const running = new Set();
exports.onePatchAtATime = (req, res, next) => {
  const id = String(req.user._id);
  if (running.has(id)) {
    return res.status(429).json({ message: "A patch is already running. Wait for it to finish." });
  }
  running.add(id);
  const release = () => running.delete(id);
  res.on("finish", release);
  res.on("close", release);
  next();
};
