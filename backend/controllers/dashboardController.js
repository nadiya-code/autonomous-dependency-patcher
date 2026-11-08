const Scan = require("../models/Scan");
const { getOctokitForUser } = require("../utils/octokit");

async function latestScans(userId) {
  const scans = await Scan.find({ user: userId, status: "completed" }).sort("-createdAt");
  const seen = new Set();
  return scans.filter((s) => {
    if (seen.has(s.repoFullName)) return false;
    seen.add(s.repoFullName);
    return true;
  });
}

exports.getStats = async (req, res) => {
  const latest = await latestScans(req.user._id);

  const severity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
  let openVulns = 0;
  latest.forEach((s) =>
    s.vulnerabilities.forEach((v) => {
      severity[v.severity] = (severity[v.severity] || 0) + 1;
      openVulns += 1;
    })
  );

  const totalScans = await Scan.countDocuments({ user: req.user._id });
  const prsCreated = await Scan.countDocuments({ user: req.user._id, "patch.prUrl": { $exists: true } });
  const recentScans = await Scan.find({ user: req.user._id })
    .select("-vulnerabilities")
    .sort("-createdAt")
    .limit(5);

  res.json({ reposScanned: latest.length, openVulns, prsCreated, totalScans, severity, recentScans });
};

exports.getVulnerabilities = async (req, res) => {
  const latest = await latestScans(req.user._id);
  const vulnerabilities = [];
  latest.forEach((s) =>
    s.vulnerabilities.forEach((v) =>
      vulnerabilities.push({
        ...v.toObject(),
        repoFullName: s.repoFullName,
        scanId: s._id,
        scannedAt: s.createdAt,
      })
    )
  );
  res.json({ vulnerabilities });
};

exports.getPullRequests = async (req, res) => {
  const scans = await Scan.find({ user: req.user._id, "patch.prUrl": { $exists: true } })
    .select("repoFullName patch updatedAt")
    .sort("-updatedAt")
    .limit(50);

  let octokit = null;
  try {
    octokit = await getOctokitForUser(req.user._id);
  } catch {
    octokit = null;
  }

  const pullRequests = await Promise.all(
    scans.map(async (s) => {
      let status = "unknown";
      if (octokit) {
        try {
          const [owner, repo] = s.repoFullName.split("/");
          const { data } = await octokit.rest.pulls.get({ owner, repo, pull_number: s.patch.prNumber });
          status = data.merged ? "merged" : data.state;
        } catch {
          status = "unknown";
        }
      }
      return {
        scanId: s._id,
        repoFullName: s.repoFullName,
        prUrl: s.patch.prUrl,
        prNumber: s.patch.prNumber,
        changes: (s.patch.summary || []).length,
        validation: s.patch.validation || [],
        status,
        createdAt: s.updatedAt,
      };
    })
  );

  res.json({ pullRequests });
};
