"use client";

import { useEffect, useState } from "react";
import { Users, ScanSearch, GitPullRequest, ShieldAlert, XCircle, GitBranch } from "lucide-react";
import StatCard from "@/components/StatCard";
import { PageHeader, PageSkeleton, ErrorBox } from "@/components/ui";
import { apiFetch } from "@/lib/api";

export default function AdminOverview() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/stats").then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!d) return <PageSkeleton />;

  const stats = [
    { title: "Total users", value: d.totalUsers, icon: Users, color: "text-blue-400" },
    { title: "New users (7 days)", value: d.newUsers, icon: Users, color: "text-green-400" },
    { title: "Total scans", value: d.totalScans, icon: ScanSearch, color: "text-orange-400" },
    { title: "Failed scans", value: d.failedScans, icon: XCircle, color: "text-red-400" },
    { title: "Patch PRs created", value: d.prsCreated, icon: GitPullRequest, color: "text-green-400" },
    { title: "Failed patch validations", value: d.failedPatches, icon: XCircle, color: "text-yellow-400" },
    { title: "Open vulnerabilities", value: d.openVulns, icon: ShieldAlert, color: "text-red-400" },
    { title: "Repos scanned", value: d.reposScanned, icon: GitBranch, color: "text-blue-400" },
  ];
  const max = Math.max(1, ...d.series.map((s) => s.count));

  return (
    <div>
      <PageHeader title="Platform overview" subtitle="All users and scans across DependencyGuard." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6">
        <h2 className="text-white font-semibold mb-4">Scans per day (last 14 days)</h2>
        <div className="flex items-end gap-2 h-40">
          {d.series.map((s) => (
            <div key={s.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${s.date}: ${s.count}`}>
              <span className="text-[10px] text-slate-500 mb-1">{s.count || ""}</span>
              <div className="w-full bg-green-500/70 rounded-t" style={{ height: `${(s.count / max) * 100}%`, minHeight: s.count ? 4 : 1 }} />
              <span className="text-[10px] text-slate-600 mt-1">{s.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
