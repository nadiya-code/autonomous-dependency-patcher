module.exports = (req, res, next) => {
  if (!req.user || !req.user.isPlatformAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
