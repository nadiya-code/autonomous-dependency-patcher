"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Globe, ExternalLink, ScanSearch, GitBranch } from "lucide-react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api";

export default function Repositories() {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState({ loading: true });
  const [scanning, setScanning] = useState(null);

  useEffect(() => {
    apiFetch("/github/repos")
      .then((d) => setState({ connected: true, ...d }))
      .catch((e) => setState(e.status === 400 && e.data?.connected === false ? { connected: false } : { error: e.message }));
  }, []);

  const connect = async (mode = "install") => {
    try {
      const d = await apiFetch(`/github/connect?mode=${mode}`);
      window.location.href = d.url;
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const startScan = async (fullName) => {
    setScanning(fullName);
    try {
      const d = await apiFetch("/scans", { method: "POST", body: JSON.stringify({ fullName }) });
      router.push(`/dashboard/scans/${d._id}`);
    } catch (e) {
      toast(e.message, "error");
      setScanning(null);
    }
  };

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorBox message={state.error} />;

  if (!state.connected) {
    return (
      <div>
        <PageHeader title="Repositories" />
        <EmptyState icon={GitBranch} title="Connect GitHub" text="Install the DependencyGuard GitHub App and pick the repositories it can access.">
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => connect("install")} className="bg-green-500 hover:bg-green-400 text-slate-950 font-semibold px-5 py-2 rounded-lg">
              Install GitHub App
            </button>
            <button onClick={() => connect("link")} className="text-green-400 text-sm underline">Already installed? Link existing installation</button>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Repositories"
        subtitle={<>Connected as <span className="text-green-400">{state.githubLogin}</span> · {state.repos.length} repositories</>}
      />
      {state.repos.length === 0 ? (
        <EmptyState icon={GitBranch} title="No repositories selected" text="Add repositories in your GitHub App installation settings." />
      ) : (
        <div className="grid gap-3">
          {state.repos.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  {r.private ? <Lock size={14} className="text-orange-400" /> : <Globe size={14} className="text-blue-400" />}
                  {r.fullName}
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {r.language || "Unknown"} · branch {r.defaultBranch} · updated {new Date(r.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startScan(r.fullName)}
                  disabled={scanning !== null}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-950 font-medium text-sm px-3 py-1.5 rounded-lg"
                >
                  <ScanSearch size={16} /> {scanning === r.fullName ? "Scanning..." : "Scan"}
                </button>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white"><ExternalLink size={18} /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
