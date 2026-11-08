const User = require("../models/User");
const { decrypt } = require("./crypto");

exports.getOctokitForUser = async (userId) => {
  const user = await User.findById(userId).select("+githubToken");
  if (!user || !user.githubToken) {
    const e = new Error("GitHub not connected");
    e.status = 400;
    throw e;
  }
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: decrypt(user.githubToken) });
};
