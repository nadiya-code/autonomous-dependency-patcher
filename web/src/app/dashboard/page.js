"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, ShieldAlert, GitPullRequest, ScanSearch } from "lucide-react";
import StatCard from "@/components/StatCard";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { apiFetch } from "@/lib/api";

const bars = [
  { key: "CRITICAL", label: "Critical", bar: "bg-red-500" },
  { key: "HIGH", label: "High", bar: "bg-orange-500" },
  { key: "MEDIUM", label: "Medium", bar: "bg-yellow-500" },
  { key: "LOW", label: "Low", bar: "bg-blue-500" },
  { key: "UNKNOWN", label: "Unknown", bar: "bg-slate-500" },
];

const statusStyle = {
  completed: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  running: "bg-yellow-500/10 text-yellow-400",
};

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/stats").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <PageSkeleton />;

  const stats = [
    { title: "Repositories Scanned", value: data.reposScanned, icon: GitBranch, color: "text-blue-400" },
    { title: "Open Vulnerabilities", value: data.openVulns, icon: ShieldAlert, color: "text-red-400" },
    { title: "Patch PRs Created", value: data.prsCreated, icon: GitPullRequest, color: "text-green-400" },
    { title: "Total Scans", value: data.totalScans, icon: ScanSearch, color: "text-orange-400" },
  ];

  return (
    <div>
      <PageHeader title="Security Overview" subtitle="Based on the latest scan of each repository." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Scans</h2>
          {data.recentScans.length === 0 ? (
            <EmptyState icon={ScanSearch} title="No scans yet" text="Start one from the Repositories page.">
              <Link href="/dashboard/repositories" className="text-green-400 hover:underline text-sm">Go to repositories</Link>
            </EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2">Repository</th><th className="pb-2">Date</th><th className="pb-2">Issues</th><th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentScans.map((s) => (
                  <tr key={s._id} className="border-b border-slate-800/60 text-slate-300">
                    <td className="py-3"><Link href={`/dashboard/scans/${s._id}`} className="text-green-400 hover:underline">{s.repoFullName}</Link></td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>{s.vulnCount}</td>
                    <td><span className={`px-2 py-1 rounded-full text-xs ${statusStyle[s.status] || ""}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">By Severity</h2>
          <div className="space-y-4">
            {bars.map((b) => {
              const count = data.severity[b.key] || 0;
              const pct = data.openVulns ? (count / data.openVulns) * 100 : 0;
              return (
                <div key={b.key}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1"><span>{b.label}</span><span>{count}</span></div>
                  <div className="h-2 bg-slate-800 rounded-full"><div className={`h-2 rounded-full ${b.bar}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
