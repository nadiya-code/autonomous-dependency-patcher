const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getOctokitForUser } = require("../utils/octokit");

const STATE_SECRET = () => process.env.JWT_SECRET + ":github-state";
const REDIRECT_URI = () => `${process.env.FRONTEND_URL}/github/callback`;

exports.getConnectUrl = (req, res) => {
  const state = jwt.sign({ id: String(req.user._id) }, STATE_SECRET(), { expiresIn: "10m" });

  if (req.query.mode === "link") {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      redirect_uri: REDIRECT_URI(),
      state,
    });
    return res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
  }

  const params = new URLSearchParams({ state });
  res.json({ url: `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new?${params}` });
};

exports.callback = async (req, res) => {
  try {
    const { code, state, installation_id } = req.body;
    if (!code || !state) {
      return res.status(400).json({ message: "Missing code or state" });
    }

    let decoded;
    try {
      decoded = jwt.verify(state, STATE_SECRET());
    } catch {
      return res.status(400).json({ message: "Invalid or expired state. Try connecting again." });
    }
    if (decoded.id !== String(req.user._id)) {
      return res.status(403).json({ message: "State does not match this user" });
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_APP_CLIENT_ID,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI(),
      }),
    });
    const data = await tokenRes.json();
    if (!data.access_token) {
      return res.status(400).json({ message: data.error_description || "GitHub authorization failed" });
    }

    const { Octokit } = await import("@octokit/rest");
    const userOctokit = new Octokit({ auth: data.access_token });
    const { data: list } = await userOctokit.rest.apps.listInstallationsForAuthenticatedUser({ per_page: 100 });

    const mine = list.installations.filter((i) => i.app_id === Number(process.env.GITHUB_APP_ID));
    const inst = installation_id
      ? mine.find((i) => String(i.id) === String(installation_id))
      : mine[0];

    if (!inst) {
      return res.status(400).json({ message: "GitHub App is not installed on your account yet. Click Install first." });
    }

    await User.findByIdAndUpdate(req.user._id, {
      githubInstallationId: inst.id,
      githubLogin: inst.account.login,
      $unset: { githubToken: "" },
    });

    res.json({ githubLogin: inst.account.login });
  } catch (error) {
    console.error("GitHub callback error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.githubInstallationId) {
      return res.status(400).json({ connected: false, message: "GitHub not connected" });
    }

    const octokit = await getOctokitForUser(req.user._id);
    const repos = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation, { per_page: 100 });
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    res.json({
      githubLogin: user.githubLogin,
      repos: repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        language: r.language,
        defaultBranch: r.default_branch,
        updatedAt: r.updated_at,
        url: r.html_url,
      })),
    });
  } catch (error) {
    if ([401, 403, 404].includes(error.status)) {
      return res.status(400).json({ connected: false, message: "GitHub App installation not found. Reconnect." });
    }
    console.error("Get repos error:", error.message);
    res.status(500).json({ message: "Could not fetch repositories" });
  }
};
