"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GitPullRequest } from "lucide-react";
import { PageSkeleton, ErrorBox, severityBadge } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api";

export default function ScanDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");
  const [patching, setPatching] = useState(false);
  const [patchError, setPatchError] = useState("");

  useEffect(() => {
    apiFetch(`/scans/${id}`).then(setScan).catch((e) => setError(e.message));
  }, [id]);

  const createPatch = async () => {
    setPatchError("");
    setPatching(true);
    try {
      const d = await apiFetch(`/scans/${id}/patch`, { method: "POST" });
      setScan((s) => ({ ...s, patch: d.patch }));
      toast("Pull request created");
    } catch (e) {
      setPatchError(e.message);
      toast("Patch was not created", "error");
    } finally {
      setPatching(false);
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!scan) return <PageSkeleton />;

  return (
    <div>
      <Link href="/dashboard/scans" className="text-slate-400 hover:text-white text-sm">&larr; All scans</Link>
      <h1 className="text-2xl font-bold text-white mt-2">{scan.repoFullName}</h1>

      {scan.status === "failed" ? (
        <p className="text-red-400 mt-4">Scan failed: {scan.error}</p>
      ) : (
        <>
          <p className="text-slate-400 mb-2">{scan.packagesScanned} packages scanned from {scan.source} &middot; {scan.vulnCount} vulnerabilities</p>
          {scan.source && !scan.source.includes("package-lock.json") && (
            <p className="text-orange-400 text-sm mb-4">No package-lock.json found, so versions are approximate (taken from version ranges).</p>
          )}

          {scan.vulnCount > 0 && (
            <div className="my-4">
              {scan.patch?.prUrl ? (
                <p className="text-green-400">
                  Pull Request #{scan.patch.prNumber} created:{" "}
                  <a href={scan.patch.prUrl} target="_blank" rel="noreferrer" className="underline">{scan.patch.prUrl}</a>
                </p>
              ) : (
                <button onClick={createPatch} disabled={patching}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 rounded-lg">
                  <GitPullRequest size={16} />
                  {patching ? "Validating in sandbox (may take a few minutes)..." : "Create Patch PR"}
                </button>
              )}
              {patchError && <pre className="text-red-400 mt-2 text-xs whitespace-pre-wrap">{patchError}</pre>}
            </div>
          )}

          {scan.vulnCount === 0 ? (
            <p className="text-green-400 mt-4">No known vulnerabilities found.</p>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800">
                    <th className="pb-2">Package</th><th className="pb-2">Installed</th><th className="pb-2">Severity</th>
                    <th className="pb-2">Fixed in</th><th className="pb-2">Type</th><th className="pb-2">Advisory</th>
                  </tr>
                </thead>
                <tbody>
                  {scan.vulnerabilities.map((v, i) => (
                    <tr key={i} className="border-b border-slate-800/60 text-slate-300 align-top">
                      <td className="py-3">{v.packageName}<p className="text-slate-500 text-xs">{v.folder}</p></td>
                      <td>{v.installedVersion}</td>
                      <td><span className={`px-2 py-1 rounded-full text-xs ${severityBadge[v.severity]}`}>{v.severity}</span></td>
                      <td>{v.fixedVersions.length ? v.fixedVersions.join(", ") : "-"}</td>
                      <td>{v.direct ? "Direct" : "Transitive"}</td>
                      <td>
                        <a href={`https://osv.dev/vulnerability/${v.vulnerabilityId}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">{v.vulnerabilityId}</a>
                        <p className="text-slate-500 text-xs mt-1 max-w-xs">{v.summary}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
