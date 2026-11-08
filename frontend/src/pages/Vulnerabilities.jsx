import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const badge = {
  CRITICAL: "bg-red-500/10 text-red-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
  LOW: "bg-blue-500/10 text-blue-400",
  UNKNOWN: "bg-slate-500/10 text-slate-400",
};

const levels = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Vulnerabilities() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/vulnerabilities", { headers: authHeader() })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        setItems(d.vulnerabilities);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!items) return <p className="text-slate-400">Loading...</p>;

  const shown = filter === "ALL" ? items : items.filter((v) => v.severity === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Vulnerabilities</h1>
      <p className="text-slate-400 mb-4">
        {items.length} open across all repositories (latest scan of each).
      </p>

      <div className="flex gap-2 mb-4">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === l ? "bg-green-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-slate-500">Nothing to show.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Repository</th>
                <th className="pb-2">Package</th>
                <th className="pb-2">Installed</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">Fixed in</th>
                <th className="pb-2">Advisory</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((v, i) => (
                <tr key={i} className="border-b border-slate-800/60 text-slate-300 align-top">
                  <td className="py-3">
                    <Link to={`/scans/${v.scanId}`} className="text-green-400 hover:underline">
                      {v.repoFullName}
                    </Link>
                  </td>
                  <td>
                    {v.packageName}
                    <p className="text-slate-500 text-xs">{v.folder}</p>
                  </td>
                  <td>{v.installedVersion}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${badge[v.severity]}`}>{v.severity}</span>
                  </td>
                  <td>{v.fixedVersions.length ? v.fixedVersions.join(", ") : "-"}</td>
                  <td>
                    <a
                      href={`https://osv.dev/vulnerability/${v.vulnerabilityId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-400 hover:underline"
                    >
                      {v.vulnerabilityId}
                    </a>
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
