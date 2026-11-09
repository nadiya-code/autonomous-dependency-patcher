"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox, severityBadge } from "@/components/ui";
import { apiFetch } from "@/lib/api";

const levels = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Vulnerabilities() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/vulnerabilities").then((d) => setItems(d.vulnerabilities)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!items) return <PageSkeleton />;

  const shown = filter === "ALL" ? items : items.filter((v) => v.severity === filter);

  return (
    <div>
      <PageHeader title="Vulnerabilities" subtitle={`${items.length} open across all repositories (latest scan of each).`} />
      <div className="flex gap-2 mb-4 flex-wrap">
        {levels.map((l) => (
          <button key={l} onClick={() => setFilter(l)}
            className={`px-3 py-1 rounded-lg text-sm ${filter === l ? "bg-green-500 text-slate-950 font-medium" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Nothing to show" text="No vulnerabilities match this filter." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Repository</th><th className="pb-2">Package</th><th className="pb-2">Installed</th>
                <th className="pb-2">Severity</th><th className="pb-2">Fixed in</th><th className="pb-2">Advisory</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((v, i) => (
                <tr key={i} className="border-b border-slate-800/60 text-slate-300 align-top">
                  <td className="py-3"><Link href={`/dashboard/scans/${v.scanId}`} className="text-green-400 hover:underline">{v.repoFullName}</Link></td>
                  <td>{v.packageName}<p className="text-slate-500 text-xs">{v.folder}</p></td>
                  <td>{v.installedVersion}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs ${severityBadge[v.severity]}`}>{v.severity}</span></td>
                  <td>{v.fixedVersions.length ? v.fixedVersions.join(", ") : "-"}</td>
                  <td><a href={`https://osv.dev/vulnerability/${v.vulnerabilityId}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">{v.vulnerabilityId}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
