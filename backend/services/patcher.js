const semver = require("semver");
const { getOctokitForUser } = require("../utils/octokit");

function pickFix(installed, fixedVersions) {
  if (!semver.valid(installed)) return null;
  const valid = (fixedVersions || []).filter((v) => semver.valid(v) && semver.gt(v, installed));
  if (!valid.length) return null;
  const sameMajor = valid.filter((v) => semver.major(v) === semver.major(installed)).sort(semver.compare);
  if (sameMajor.length) return { to: sameMajor[0], majorBump: false };
  return { to: valid.sort(semver.compare)[0], majorBump: true };
}

function planChanges(vulns) {
  const byFolder = {};
  for (const v of vulns) {
    const fix = pickFix(v.installedVersion, v.fixedVersions);
    if (!fix) continue;
    const folder = v.folder || "(root)";
    byFolder[folder] = byFolder[folder] || {};
    const cur = byFolder[folder][v.packageName];
    if (!cur || semver.gt(fix.to, cur.to)) {
      byFolder[folder][v.packageName] = {
        from: v.installedVersion,
        to: fix.to,
        direct: v.direct,
        majorBump: fix.majorBump,
      };
    }
  }
  return byFolder;
}

function applyToPackageJson(text, changes) {
  const pkg = JSON.parse(text);
  const indent = (text.match(/^(\s+)"/m) || [null, "  "])[1];
  for (const [name, c] of Object.entries(changes)) {
    const section = ["dependencies", "devDependencies", "optionalDependencies"].find(
      (s) => pkg[s] && pkg[s][name]
    );
    if (c.direct && section) {
      pkg[section][name] = `^${c.to}`;
    } else {
      pkg.overrides = pkg.overrides || {};
      pkg.overrides[name] = c.to;
    }
  }
  return JSON.stringify(pkg, null, indent) + (text.endsWith("\n") ? "\n" : "");
}

exports.createPatch = async (userId, scan) => {
  const [owner, repo] = scan.repoFullName.split("/");
  const octokit = await getOctokitForUser(userId);

  const plan = planChanges(scan.vulnerabilities);
  if (Object.keys(plan).length === 0) {
    throw new Error("No fixed versions available for the vulnerabilities found");
  }

  const { data: info } = await octokit.rest.repos.get({ owner, repo });
  const base = info.default_branch;
  const { data: ref } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${base}` });

  const branch = `dependency-patch/${Date.now()}`;
  await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: ref.object.sha });

  const summary = [];
  for (const [folder, changes] of Object.entries(plan)) {
    const path = folder === "(root)" ? "package.json" : `${folder}/package.json`;
    const { data: file } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
    const oldText = Buffer.from(file.content, "base64").toString("utf8");
    const newText = applyToPackageJson(oldText, changes);
    if (newText === oldText) continue;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch,
      sha: file.sha,
      message: `fix(deps): patch vulnerable dependencies in ${folder}`,
      content: Buffer.from(newText, "utf8").toString("base64"),
    });

    for (const [name, c] of Object.entries(changes)) {
      summary.push({ folder, name, from: c.from, to: c.to, type: c.direct ? "direct" : "override", majorBump: c.majorBump });
    }
  }

  if (summary.length === 0) {
    await octokit.rest.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
    throw new Error("Nothing to change in package.json files");
  }

  const rows = summary
    .map((s) => `| ${s.folder} | ${s.name} | ${s.from} | ${s.to} | ${s.type}${s.majorBump ? " (major bump)" : ""} |`)
    .join("\n");

  const body = [
    "Automated dependency security patch by DependencyGuard.",
    "",
    "| Folder | Package | From | To | Change |",
    "|---|---|---|---|---|",
    rows,
    "",
    "**Warning:** only package.json was changed. package-lock.json was NOT regenerated and tests were NOT run.",
    "Run `npm install` and your test suite before merging. Review carefully, especially major version bumps.",
  ].join("\n");

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    title: "fix(deps): patch vulnerable dependencies",
    head: branch,
    base,
    body,
  });

  return { branch, prUrl: pr.html_url, prNumber: pr.number, summary };
};
