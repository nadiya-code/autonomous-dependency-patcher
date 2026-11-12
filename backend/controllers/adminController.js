const User = require("../models/User");
const Scan = require("../models/Scan");

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

exports.getStats = async (req, res) => {
  const [totalUsers, newUsers, disabledUsers, totalScans, failedScans, prsCreated, failedPatches] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
      User.countDocuments({ disabled: true }),
      Scan.countDocuments(),
      Scan.countDocuments({ status: "failed" }),
      Scan.countDocuments({ "patch.prUrl": { $exists: true } }),
      Scan.countDocuments({ patchAttempt: { $exists: true } }),
    ]);

  const perDay = await Scan.aggregate([
    { $match: { createdAt: { $gte: daysAgo(14) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  const map = new Map(perDay.map((d) => [d._id, d.count]));
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i).toISOString().slice(0, 10);
    series.push({ date, count: map.get(date) || 0 });
  }

  const latest = await Scan.aggregate([
    { $match: { status: "completed" } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: { user: "$user", repo: "$repoFullName" }, vulnCount: { $first: "$vulnCount" } } },
    { $group: { _id: null, openVulns: { $sum: "$vulnCount" }, repos: { $sum: 1 } } },
  ]);

  res.json({
    totalUsers, newUsers, disabledUsers, totalScans, failedScans, prsCreated, failedPatches,
    openVulns: latest[0]?.openVulns || 0,
    reposScanned: latest[0]?.repos || 0,
    series,
  });
};

exports.listUsers = async (req, res) => {
  const users = await User.find()
    .select("name email isPlatformAdmin isOwner canManageAdmins disabled githubLogin createdAt")
    .sort("-createdAt")
    .limit(500)
    .lean();

  const counts = await Scan.aggregate([
    {
      $group: {
        _id: "$user",
        scans: { $sum: 1 },
        prs: { $sum: { $cond: [{ $ifNull: ["$patch.prUrl", false] }, 1, 0] } },
      },
    },
  ]);
  const byUser = new Map(counts.map((c) => [String(c._id), c]));

  res.json({
    users: users.map((u) => ({
      ...u,
      scans: byUser.get(String(u._id))?.scans || 0,
      prs: byUser.get(String(u._id))?.prs || 0,
    })),
  });
};

exports.setDisabled = async (req, res) => {
  const { disabled } = req.body;
  if (typeof disabled !== "boolean") {
    return res.status(400).json({ message: "disabled must be true or false" });
  }
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot disable your own account" });
  }
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.isPlatformAdmin) {
      return res.status(400).json({ message: "Remove admin access before disabling this account" });
    }
    await User.updateOne({ _id: target._id }, { $set: { disabled } });
    res.json({ ok: true, disabled });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
};

exports.setAdmin = async (req, res) => {
  const { isPlatformAdmin } = req.body;
  if (typeof isPlatformAdmin !== "boolean") {
    return res.status(400).json({ message: "isPlatformAdmin must be true or false" });
  }
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot change your own admin status" });
  }
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.isOwner) {
      return res.status(400).json({ message: "The owner cannot be changed" });
    }
    if (!req.user.isOwner && target.canManageAdmins) {
      return res.status(403).json({ message: "Only the owner can change an admin who can manage admins" });
    }
    if (isPlatformAdmin && target.disabled) {
      return res.status(400).json({ message: "Enable this account before making it admin" });
    }
    const update = isPlatformAdmin
      ? { isPlatformAdmin: true }
      : { isPlatformAdmin: false, canManageAdmins: false };
    await User.updateOne({ _id: target._id }, { $set: update });
    res.json({ ok: true, isPlatformAdmin });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
};

exports.setManageAdmins = async (req, res) => {
  const { canManageAdmins } = req.body;
  if (typeof canManageAdmins !== "boolean") {
    return res.status(400).json({ message: "canManageAdmins must be true or false" });
  }
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot change your own permissions" });
  }
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.isOwner) {
      return res.status(400).json({ message: "The owner cannot be changed" });
    }
    if (canManageAdmins && (!target.isPlatformAdmin || target.disabled)) {
      return res.status(400).json({ message: "Only active admins can get this permission" });
    }
    await User.updateOne({ _id: target._id }, { $set: { canManageAdmins } });
    res.json({ ok: true, canManageAdmins });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
};

exports.listScans = async (req, res) => {
  const scans = await Scan.find()
    .select("-vulnerabilities")
    .populate("user", "email name")
    .sort("-createdAt")
    .limit(100)
    .lean();

  res.json({
    scans: scans.map((s) => ({
      _id: s._id,
      repoFullName: s.repoFullName,
      status: s.status,
      vulnCount: s.vulnCount,
      createdAt: s.createdAt,
      userEmail: s.user?.email || "deleted user",
      prUrl: s.patch?.prUrl || null,
      prNumber: s.patch?.prNumber || null,
      patchFailed: !!s.patchAttempt,
      error: s.error || null,
    })),
  });
};
