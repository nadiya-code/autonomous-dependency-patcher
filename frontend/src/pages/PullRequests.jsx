import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GitPullRequest } from "lucide-react";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

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
    fetch("http://localhost:5000/api/pull-requests", { headers: authHeader() })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        setItems(d.pullRequests);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!items) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Pull Requests</h1>
      <p className="text-slate-400 mb-6">Patch PRs created by DependencyGuard. Status is read live from GitHub.</p>

      {items.length === 0 ? (
        <p className="text-slate-500">No PRs yet. Open a scan and click Create Patch PR.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <div
              key={p.scanId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <GitPullRequest size={16} className="text-green-400" />
                  {p.repoFullName} #{p.prNumber}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle[p.status]}`}>{p.status}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {p.changes} package change(s) · validated in {p.validation.length} folder(s) ·{" "}
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link to={`/scans/${p.scanId}`} className="text-slate-400 hover:text-white">
                  Scan
                </Link>
                <a href={p.prUrl} target="_blank" rel="noreferrer" className="text-green-400 hover:underline">
                  Open on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
