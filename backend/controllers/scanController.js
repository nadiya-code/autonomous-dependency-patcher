const Scan = require("../models/Scan");
const { scanRepo } = require("../services/scanner");

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
