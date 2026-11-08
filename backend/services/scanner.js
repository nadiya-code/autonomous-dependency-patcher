const { getOctokitForUser } = require("../utils/octokit");

const OSV = "https://api.osv.dev/v1";
const RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
const SKIP_DIRS = ["node_modules/", "/dist/", "/build/", "/.next/", "/vendor/"];

async function readFile(octokit, owner, repo, path) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner, repo, path, mediaType: { format: "raw" },
    });
    return typeof data === "string" ? data : null;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

async function findPackageDirs(octokit, owner, repo) {
  const { data: info } = await octokit.rest.repos.get({ owner, repo });
  const { data } = await octokit.rest.git.getTree({
    owner, repo, tree_sha: info.default_branch, recursive: "true",
  });
  return data.tree
    .filter((n) => n.type === "blob" && (n.path === "package.json" || n.path.endsWith("/package.json")))
    .filter((n) => !SKIP_DIRS.some((s) => ("/" + n.path).includes(s)))
    .map((n) => n.path.slice(0, -"package.json".length).replace(/\/$/, ""))
    .slice(0, 10);
}

const isVersion = (v) => /^\d+\.\d+\.\d+/.test(v || "");

function fromLock(lock, directNames) {
  const out = new Map();
  if (lock.packages) {
    for (const [p, info] of Object.entries(lock.packages)) {
      if (!p.startsWith("node_modules/") || !isVersion(info.version)) continue;
      const name = p.slice(p.lastIndexOf("node_modules/") + 13);
      out.set(`${name}@${info.version}`, {
        name,
        version: info.version,
        direct: p === `node_modules/${name}` && directNames.has(name),
      });
    }
  } else if (lock.dependencies) {
    const walk = (deps, top) => {
      for (const [name, info] of Object.entries(deps)) {
        if (isVersion(info.version)) {
          out.set(`${name}@${info.version}`, { name, version: info.version, direct: top && directNames.has(name) });
        }
        if (info.dependencies) walk(info.dependencies, false);
      }
    };
    walk(lock.dependencies, true);
  }
  return [...out.values()];
}

function fromPackageJson(pkg) {
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  const out = [];
  for (const [name, range] of Object.entries(all)) {
    const m = String(range).match(/\d+\.\d+\.\d+/);
    if (m) out.push({ name, version: m[0], direct: true });
  }
  return out;
}

async function queryBatch(pkgs) {
  const results = [];
  for (let i = 0; i < pkgs.length; i += 500) {
    const chunk = pkgs.slice(i, i + 500);
    const res = await fetch(`${OSV}/querybatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queries: chunk.map((p) => ({ package: { name: p.name, ecosystem: "npm" }, version: p.version })),
      }),
    });
    if (!res.ok) throw new Error(`OSV query failed (${res.status})`);
    const data = await res.json();
    results.push(...data.results);
  }
  return results;
}

async function getVuln(id) {
  const res = await fetch(`${OSV}/vulns/${encodeURIComponent(id)}`);
  return res.ok ? res.json() : null;
}

async function fetchDetails(ids) {
  const map = new Map();
  const queue = [...ids];
  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      map.set(id, await getVuln(id));
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  return map;
}

function severityOf(v) {
  const s = String((v.database_specific && v.database_specific.severity) || "").toUpperCase();
  if (s === "MODERATE") return "MEDIUM";
  return RANK[s] !== undefined && s !== "UNKNOWN" ? s : "UNKNOWN";
}

function fixedFor(v, name) {
  const fixed = new Set();
  for (const a of v.affected || []) {
    if (!a.package || a.package.name !== name || a.package.ecosystem !== "npm") continue;
    for (const r of a.ranges || []) {
      for (const e of r.events || []) if (e.fixed) fixed.add(e.fixed);
    }
  }
  return [...fixed];
}

async function collectPackages(octokit, owner, repo, dir) {
  const prefix = dir ? `${dir}/` : "";
  const pkgText = await readFile(octokit, owner, repo, `${prefix}package.json`);
  if (!pkgText) return { pkgs: [], source: null };

  const pkg = JSON.parse(pkgText);
  const directNames = new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }));

  const lockText = await readFile(octokit, owner, repo, `${prefix}package-lock.json`);
  let pkgs = lockText ? fromLock(JSON.parse(lockText), directNames) : [];
  let source = `${prefix}package-lock.json`;
  if (pkgs.length === 0) {
    pkgs = fromPackageJson(pkg);
    source = `${prefix}package.json`;
  }
  return { pkgs, source };
}

exports.scanRepo = async (userId, fullName) => {
  const [owner, repo] = fullName.split("/");
  const octokit = await getOctokitForUser(userId);

  const dirs = await findPackageDirs(octokit, owner, repo);
  if (dirs.length === 0) {
    throw new Error("No package.json found in this repository");
  }

  const sources = [];
  const entries = [];
  for (const dir of dirs) {
    const { pkgs, source } = await collectPackages(octokit, owner, repo, dir);
    if (pkgs.length === 0) continue;
    sources.push(source);
    pkgs.forEach((p) => entries.push({ ...p, dir: dir || "(root)" }));
  }
  if (entries.length === 0) {
    throw new Error("package.json files found, but they list no dependencies");
  }

  const results = await queryBatch(entries);
  const hits = [];
  results.forEach((r, i) => (r.vulns || []).forEach((v) => hits.push({ pkg: entries[i], id: v.id })));

  const details = await fetchDetails(new Set(hits.map((h) => h.id)));

  const vulnerabilities = hits.map(({ pkg: p, id }) => {
    const d = details.get(id);
    return {
      packageName: p.name,
      installedVersion: p.version,
      direct: p.direct,
      folder: p.dir,
      vulnerabilityId: id,
      summary: d ? d.summary || "" : "",
      severity: d ? severityOf(d) : "UNKNOWN",
      fixedVersions: d ? fixedFor(d, p.name) : [],
    };
  });

  vulnerabilities.sort(
    (a, b) => RANK[a.severity] - RANK[b.severity] || Number(b.direct) - Number(a.direct)
  );

  return {
    source: sources.join(", "),
    packagesScanned: entries.length,
    vulnerabilities,
    vulnCount: vulnerabilities.length,
  };
};
