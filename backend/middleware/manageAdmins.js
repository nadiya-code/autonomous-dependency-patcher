module.exports = (req, res, next) => {
  const u = req.user;
  if (!u || !(u.isOwner || (u.isPlatformAdmin && u.canManageAdmins))) {
    return res.status(403).json({ message: "You do not have permission to manage admins" });
  }
  next();
};
