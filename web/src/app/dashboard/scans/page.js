"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { apiFetch } from "@/lib/api";

export default function Scans() {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/scans").then((d) => setScans(d.scans)).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!scans) return <PageSkeleton />;

  return (
    <div>
      <PageHeader title="Security Scans" subtitle="Start a scan from the Repositories page." />
      {scans.length === 0 ? (
        <EmptyState icon={ScanSearch} title="No scans yet" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Repository</th><th className="pb-2">Date</th><th className="pb-2">Issues</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s._id} className="border-b border-slate-800/60 text-slate-300">
                  <td className="py-3"><Link href={`/dashboard/scans/${s._id}`} className="text-green-400 hover:underline">{s.repoFullName}</Link></td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>{s.vulnCount}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
