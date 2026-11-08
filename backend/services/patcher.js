const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const semver = require("semver");
const { getOctokitForUser } = require("../utils/octokit");
const { runInSandbox } = require("./sandbox");

const exec = promisify(execFile);

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

const folderPath = (srcDir, folder, file) => {
  const full = path.resolve(srcDir, folder === "(root)" ? "" : folder, file);
  if (!full.startsWith(path.resolve(srcDir) + path.sep)) throw new Error("Invalid folder path");
  return full;
};

const repoPath = (folder, file) => (folder === "(root)" ? file : `${folder}/${file}`);

async function commitFile(octokit, { owner, repo, branch, filePath, content, message }) {
  let sha;
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: filePath, ref: branch });
    sha = data.sha;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path: filePath, branch, sha, message,
    content: Buffer.from(content).toString("base64"),
  });
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
  const baseSha = ref.object.sha;

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "dg-"));
  try {
    // 1. Download and extract the repo at the exact commit we are patching
    const { data: tar } = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref: baseSha });
    const tarPath = path.join(workDir, "repo.tgz");
    const srcDir = path.join(workDir, "src");
    await fs.writeFile(tarPath, Buffer.from(tar));
    await fs.mkdir(srcDir);
    await exec("tar", ["-xzf", tarPath, "-C", srcDir, "--strip-components=1"]);

    // 2. Apply the patch locally
    const summary = [];
    for (const [folder, changes] of Object.entries(plan)) {
      const file = folderPath(srcDir, folder, "package.json");
      const oldText = await fs.readFile(file, "utf8");
      const newText = applyToPackageJson(oldText, changes);
      if (newText === oldText) continue;
      await fs.writeFile(file, newText);
      for (const [name, c] of Object.entries(changes)) {
        summary.push({ folder, name, from: c.from, to: c.to, type: c.direct ? "direct" : "override", majorBump: c.majorBump });
      }
    }
    if (summary.length === 0) throw new Error("Nothing to change in package.json files");

    // 3. Validate inside Docker
    const folders = [...new Set(summary.map((s) => s.folder))];
    const validation = [];
    for (const folder of folders) {
      const result = await runInSandbox(srcDir, folder);
      validation.push({ folder, ...result });
      if (!result.ok) {
        const err = new Error(
          `Validation failed at "${result.stage}" in ${folder}. No PR was created.\n\n${result.log}`
        );
        err.validation = validation;
        throw err;
      }
    }

    // 4. Validation passed: branch, commit package.json + lockfile, open PR
    const branch = `dependency-patch/${Date.now()}`;
    await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: baseSha });

    for (const folder of folders) {
      const pkgText = await fs.readFile(folderPath(srcDir, folder, "package.json"));
      await commitFile(octokit, {
        owner, repo, branch,
        filePath: repoPath(folder, "package.json"),
        content: pkgText,
        message: `fix(deps): patch vulnerable dependencies in ${folder}`,
      });
      try {
        const lock = await fs.readFile(folderPath(srcDir, folder, "package-lock.json"));
        await commitFile(octokit, {
          owner, repo, branch,
          filePath: repoPath(folder, "package-lock.json"),
          content: lock,
          message: `chore(deps): update lockfile in ${folder}`,
        });
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    }

    const rows = summary
      .map((s) => `| ${s.folder} | ${s.name} | ${s.from} | ${s.to} | ${s.type}${s.majorBump ? " (major bump)" : ""} |`)
      .join("\n");
    const vrows = validation
      .map((v) => `| ${v.folder} | passed | ${v.tests} | ${v.build} |`)
      .join("\n");

    const body = [
      "Automated dependency security patch by DependencyGuard.",
      "",
      "| Folder | Package | From | To | Change |",
      "|---|---|---|---|---|",
      rows,
      "",
      "**Sandbox validation (Docker, node:20):**",
      "",
      "| Folder | npm install | Tests | Build |",
      "|---|---|---|---|",
      vrows,
      "",
      "`skipped` means the repository has no such script. package-lock.json was regenerated.",
      "Review carefully before merging, especially major version bumps.",
    ].join("\n");

    const { data: pr } = await octokit.rest.pulls.create({
      owner, repo, head: branch, base,
      title: "fix(deps): patch vulnerable dependencies",
      body,
    });

    return { branch, prUrl: pr.html_url, prNumber: pr.number, summary, validation };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
};
