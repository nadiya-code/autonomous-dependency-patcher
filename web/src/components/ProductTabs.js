"use client";

import { useState } from "react";
import { ScanSearch, Wrench, FlaskConical, GitPullRequest, CheckCircle2, Loader2 } from "lucide-react";

const tabs = [
  { id: "scan", label: "Scan", icon: ScanSearch },
  { id: "patch", label: "Patch", icon: Wrench },
  { id: "validate", label: "Validate", icon: FlaskConical },
  { id: "pr", label: "Pull request", icon: GitPullRequest },
];

const badge = {
  HIGH: "bg-orange-500/10 text-orange-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
};

function Scan() {
  const rows = [
    ["axios", "0.21.1", "HIGH", "0.30.3"],
    ["lodash", "4.17.15", "HIGH", "4.17.21"],
    ["minimatch", "10.2.6", "MEDIUM", "11.0.1"],
  ];
  return (
    <div>
      <p className="text-sm text-slate-400">3 packages with known advisories</p>
      <table className="w-full text-sm mt-3">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-800">
            <th className="pb-2">Package</th><th className="pb-2">Installed</th><th className="pb-2">Severity</th><th className="pb-2">Fixed in</th>
          </tr>
        </thead>
        <tbody className="text-slate-300">
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-slate-800/60">
              <td className="py-2">{r[0]}</td><td>{r[1]}</td>
              <td><span className={`px-2 py-0.5 rounded-full text-xs ${badge[r[2]]}`}>{r[2]}</span></td>
              <td className="text-green-400">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Patch() {
  return (
    <div className="font-mono text-xs leading-6">
      <p className="text-slate-500">package.json</p>
      <p className="bg-red-500/10 text-red-300 px-2 rounded">- "axios": "0.21.1"</p>
      <p className="bg-green-500/10 text-green-300 px-2 rounded">+ "axios": "^0.30.3"</p>
      <p className="bg-red-500/10 text-red-300 px-2 rounded mt-1">- "lodash": "4.17.15"</p>
      <p className="bg-green-500/10 text-green-300 px-2 rounded">+ "lodash": "^4.17.21"</p>
      <p className="text-slate-500 mt-3">Transitive packages are pinned with overrides.</p>
    </div>
  );
}

function Validate() {
  const steps = [["npm install", "done"], ["npm test", "done"], ["npm run build", "running"]];
  return (
    <div className="space-y-2">
      {steps.map(([s, st]) => (
        <div key={s} className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300">
          {st === "done" ? <CheckCircle2 size={16} className="text-green-400" /> : <Loader2 size={16} className="text-yellow-400 animate-spin" />}
          <span className="font-mono">{s}</span>
          <span className="ml-auto text-xs text-slate-500">{st === "done" ? "passed" : "running"}</span>
        </div>
      ))}
      <p className="text-xs text-slate-500 pt-1">Runs inside an isolated Docker container.</p>
    </div>
  );
}

function PR() {
  return (
    <div>
      <div className="flex items-center gap-2 text-white font-medium text-sm">
        <GitPullRequest size={16} className="text-green-400" /> fix(deps): patch vulnerable dependencies
        <span className="ml-auto text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">open</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">dependencyguard[bot] wants to merge 2 commits into main</p>
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        {["npm install", "Tests", "Build"].map((s) => (
          <div key={s} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-300">
            <CheckCircle2 size={14} className="text-green-400" /> {s}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">package.json and package-lock.json updated.</p>
    </div>
  );
}

const views = { scan: Scan, patch: Patch, validate: Validate, pr: PR };

export default function ProductTabs() {
  const [active, setActive] = useState("scan");
  const View = views[active];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-green-500/5 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-slate-500">your-org/web-app</span>
      </div>
      <div className="flex gap-1 p-2 border-b border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
              active === t.id ? "bg-green-500/15 text-green-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <div className="p-5 min-h-[230px]"><View /></div>
      <p className="text-[11px] text-slate-600 px-5 pb-3">Illustrative example, not live data.</p>
    </div>
  );
}
