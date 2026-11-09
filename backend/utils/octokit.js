const fs = require("fs");
const path = require("path");
const User = require("../models/User");

let cachedKey;
const privateKey = () => {
  if (!cachedKey) {
    cachedKey = fs.readFileSync(path.resolve(__dirname, "..", process.env.GITHUB_APP_PRIVATE_KEY_PATH), "utf8");
  }
  return cachedKey;
};

exports.getOctokitForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.githubInstallationId) {
    const e = new Error("GitHub not connected");
    e.status = 400;
    throw e;
  }
  const { Octokit } = await import("@octokit/rest");
  const { createAppAuth } = await import("@octokit/auth-app");
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(process.env.GITHUB_APP_ID),
      privateKey: privateKey(),
      installationId: user.githubInstallationId,
    },
  });
};
