"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, ShieldAlert, GitPullRequest, ScanSearch, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import { PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
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

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function Overview() {
  const { user } = useAuth();
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

  const actions = [
    { href: "/dashboard/repositories", title: "Scan a repository", text: "Pick a repo and check its dependencies.", icon: ScanSearch },
    { href: "/dashboard/vulnerabilities", title: "Review vulnerabilities", text: "Everything open, filterable by severity.", icon: ShieldAlert },
    { href: "/dashboard/pull-requests", title: "Track patch PRs", text: "Live open, merged and closed status.", icon: GitPullRequest },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{greeting()}, {user?.name?.split(" ")[0]}</h1>
        <p className="text-slate-400 mt-1">Security overview, based on the latest scan of each repository.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="lift group bg-slate-900 border border-slate-800 hover:border-green-500/40 rounded-xl p-5">
            <a.icon size={20} className="text-green-400" />
            <p className="text-white font-medium mt-3 flex items-center gap-1">{a.title} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" /></p>
            <p className="text-slate-500 text-sm mt-1">{a.text}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent scans</h2>
          {data.recentScans.length === 0 ? (
            <EmptyState icon={ScanSearch} title="No scans yet" text="Start one from the Repositories page.">
              <Link href="/dashboard/repositories" className="text-green-400 hover:underline text-sm">Go to repositories</Link>
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="pb-2">Repository</th><th className="pb-2">Date</th><th className="pb-2">Issues</th><th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.map((s) => (
                    <tr key={s._id} className="border-b border-slate-800/60 text-slate-300 hover:bg-slate-800/30">
                      <td className="py-3"><Link href={`/dashboard/scans/${s._id}`} className="text-green-400 hover:underline">{s.repoFullName}</Link></td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>{s.vulnCount}</td>
                      <td><span className={`px-2 py-1 rounded-full text-xs ${statusStyle[s.status] || ""}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">By severity</h2>
          <div className="space-y-4">
            {bars.map((b) => {
              const count = data.severity[b.key] || 0;
              const pct = data.openVulns ? (count / data.openVulns) * 100 : 0;
              return (
                <div key={b.key}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1"><span>{b.label}</span><span>{count}</span></div>
                  <div className="h-2 bg-slate-800 rounded-full"><div className={`bar-grow h-2 rounded-full ${b.bar}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



