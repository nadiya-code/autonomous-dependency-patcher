const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/crypto");

const STATE_SECRET = () => process.env.JWT_SECRET + ":github-state";
const REDIRECT_URI = () => `${process.env.FRONTEND_URL}/github/callback`;

const getOctokit = async (token) => {
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: token });
};

exports.getConnectUrl = (req, res) => {
  const state = jwt.sign({ id: String(req.user._id) }, STATE_SECRET(), { expiresIn: "10m" });
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI(),
    scope: "repo",
    state,
  });
  res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
};

exports.callback = async (req, res) => {
  try {
    const { code, state } = req.body;
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
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI(),
      }),
    });
    const data = await tokenRes.json();

    if (!data.access_token) {
      return res.status(400).json({ message: data.error_description || "GitHub token exchange failed" });
    }

    const octokit = await getOctokit(data.access_token);
    const { data: ghUser } = await octokit.rest.users.getAuthenticated();

    await User.findByIdAndUpdate(req.user._id, {
      githubToken: encrypt(data.access_token),
      githubLogin: ghUser.login,
    });

    res.json({ githubLogin: ghUser.login });
  } catch (error) {
    console.error("GitHub callback error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+githubToken");
    if (!user.githubToken) {
      return res.status(400).json({ connected: false, message: "GitHub not connected" });
    }

    const octokit = await getOctokit(decrypt(user.githubToken));
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });

    res.json({
      githubLogin: user.githubLogin,
      repos: data.map((r) => ({
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
    if (error.status === 401) {
      return res.status(400).json({ connected: false, message: "GitHub token invalid. Reconnect." });
    }
    console.error("Get repos error:", error.message);
    res.status(500).json({ message: "Could not fetch repositories" });
  }
};