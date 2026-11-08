const Scan = require("../models/Scan");
const { scanRepo } = require("../services/scanner");
const { createPatch } = require("../services/patcher");

exports.createScan = async (req, res) => {
  const { fullName } = req.body;
  if (!/^[\w.-]+\/[\w.-]+$/.test(fullName || "")) {
    return res.status(400).json({ message: "Invalid repository name" });
  }

  const scan = await Scan.create({ user: req.user._id, repoFullName: fullName });
  try {
    const result = await scanRepo(req.user._id, fullName);
    scan.set({ ...result, status: "completed" });
  } catch (error) {
    console.error("Scan error:", error.message);
    scan.status = "failed";
    scan.error = error.message;
  }
  await scan.save();
  res.status(201).json(scan);
};

exports.listScans = async (req, res) => {
  const scans = await Scan.find({ user: req.user._id })
    .select("-vulnerabilities")
    .sort("-createdAt")
    .limit(50);
  res.json({ scans });
};

exports.getScan = async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    res.json(scan);
  } catch {
    res.status(404).json({ message: "Scan not found" });
  }
};

exports.createPatch = async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    if (scan.status !== "completed" || scan.vulnCount === 0) {
      return res.status(400).json({ message: "Nothing to patch in this scan" });
    }
    if (scan.patch && scan.patch.prUrl) {
      return res.status(409).json({ message: "A patch PR already exists for this scan", patch: scan.patch });
    }

    const patch = await createPatch(req.user._id, scan);
    scan.patch = patch;
    await scan.save();
    res.status(201).json({ patch });
  } catch (error) {
    console.error("Patch error:", error.message);
    const msg = error.status === 403 || error.status === 404
      ? "GitHub denied access. Check that the token can write to this repository."
      : error.message;
    res.status(500).json({ message: msg });
  }
};
