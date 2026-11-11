"use client";

import { useEffect, useState } from "react";
import { ScanSearch } from "lucide-react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { apiFetch } from "@/lib/api";

const style = {
  completed: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  running: "bg-yellow-500/10 text-yellow-400",
};

export default function AdminScans() {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/scans").then((d) => setScans(d.scans)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!scans) return <PageSkeleton />;

  return (
    <div>
      <PageHeader title="All scans" subtitle="Latest 100 scans across all users." />
      {scans.length === 0 ? (
        <EmptyState icon={ScanSearch} title="No scans yet" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Repository</th><th className="pb-2">User</th><th className="pb-2">Date</th>
                <th className="pb-2">Issues</th><th className="pb-2">Status</th><th className="pb-2">Patch</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s._id} className="border-b border-slate-800/60 text-slate-300 align-top">
                  <td className="py-3">{s.repoFullName}{s.error && <p className="text-red-400 text-xs max-w-xs truncate">{s.error}</p>}</td>
                  <td>{s.userEmail}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>{s.vulnCount}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs ${style[s.status] || ""}`}>{s.status}</span></td>
                  <td>
                    {s.prUrl ? <a href={s.prUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">PR #{s.prNumber}</a>
                      : s.patchFailed ? <span className="text-yellow-400 text-xs">validation failed</span> : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
