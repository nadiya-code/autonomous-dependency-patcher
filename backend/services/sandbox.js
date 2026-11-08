const { spawn } = require("child_process");
const crypto = require("crypto");

const IMAGE = "node:20-slim";
const TAIL = 6000;
const STAGES = { 10: "npm install", 20: "npm test", 30: "npm run build", 40: "folder not found" };

const SCRIPT = `cd "/work/$DIR" || exit 40
T=skipped
B=skipped
npm install --no-audit --no-fund 2>&1 || exit 10
if node -e 'const s=require("./package.json").scripts||{};process.exit(s.test&&!/no test specified/.test(s.test)?0:1)'; then
  npm test 2>&1 || exit 20
  T=passed
fi
if node -e 'const s=require("./package.json").scripts||{};process.exit(s.build?0:1)'; then
  npm run build 2>&1 || exit 30
  B=passed
fi
echo "[result] tests=$T build=$B"`;

exports.runInSandbox = (hostDir, folder, timeoutMs = 5 * 60 * 1000) =>
  new Promise((resolve) => {
    const name = `dg-${crypto.randomBytes(6).toString("hex")}`;
    const args = [
      "run", "--rm", "--name", name,
      "--memory", "1g", "--cpus", "1", "--pids-limit", "512",
      "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
      "-e", "CI=true",
      "-e", `DIR=${folder === "(root)" ? "." : folder}`,
      "--mount", `type=bind,source=${hostDir},target=/work`,
      IMAGE, "sh", "-c", SCRIPT,
    ];

    let log = "";
    let done = false;
    let timer;

    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ...result, log: log.slice(-TAIL) });
    };

    const proc = spawn("docker", args);
    const add = (d) => {
      log += d.toString();
      if (log.length > TAIL * 2) log = log.slice(-TAIL);
    };
    proc.stdout.on("data", add);
    proc.stderr.on("data", add);

    timer = setTimeout(() => {
      spawn("docker", ["rm", "-f", name]);
      finish({ ok: false, stage: "timeout (5 min)" });
    }, timeoutMs);

    proc.on("error", () => finish({ ok: false, stage: "docker not available" }));
    proc.on("close", (code) => {
      if (code === 0) {
        const m = log.match(/\[result\] tests=(\w+) build=(\w+)/);
        finish({ ok: true, tests: m ? m[1] : "unknown", build: m ? m[2] : "unknown" });
      } else {
        finish({ ok: false, stage: STAGES[code] || `docker error (exit ${code})` });
      }
    });
  });
