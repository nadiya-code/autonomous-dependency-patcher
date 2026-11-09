"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitPullRequest } from "lucide-react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { apiFetch } from "@/lib/api";

const statusStyle = {
  open: "bg-green-500/10 text-green-400",
  merged: "bg-purple-500/10 text-purple-400",
  closed: "bg-red-500/10 text-red-400",
  unknown: "bg-slate-500/10 text-slate-400",
};

export default function PullRequests() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/pull-requests").then((d) => setItems(d.pullRequests)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!items) return <PageSkeleton />;

  return (
    <div>
      <PageHeader title="Pull Requests" subtitle="Patch PRs created by DependencyGuard. Status is read live from GitHub." />
      {items.length === 0 ? (
        <EmptyState icon={GitPullRequest} title="No PRs yet" text="Open a scan and click Create Patch PR." />
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <div key={p.scanId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <GitPullRequest size={16} className="text-green-400" />
                  {p.repoFullName} #{p.prNumber}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle[p.status]}`}>{p.status}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {p.changes} package change(s) · validated in {p.validation.length} folder(s) · {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/dashboard/scans/${p.scanId}`} className="text-slate-400 hover:text-white">Scan</Link>
                <a href={p.prUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">Open on GitHub</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
