module.exports = (req, res, next) => {
  if (!req.user || !req.user.isOwner) {
    return res.status(403).json({ message: "Only the owner can do this" });
  }
  next();
};
