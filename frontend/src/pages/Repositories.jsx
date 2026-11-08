import { useEffect, useState } from "react";
import { Lock, Globe, ExternalLink } from "lucide-react";

const API = "http://localhost:5000/api/github";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Repositories() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    fetch(`${API}/repos`, { headers: authHeader() })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 400 && data.connected === false) return setState({ connected: false });
        if (!res.ok) throw new Error(data.message);
        setState({ connected: true, ...data });
      })
      .catch((err) => setState({ error: err.message }));
  }, []);

  const connect = async () => {
    const res = await fetch(`${API}/connect`, { headers: authHeader() });
    const data = await res.json();
    window.location.href = data.url;
  };

  if (state.loading) return <p className="text-slate-400">Loading...</p>;
  if (state.error) return <p className="text-red-400">{state.error}</p>;

  if (!state.connected) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Repositories</h1>
        <p className="text-slate-400 mt-2 mb-6">Connect your GitHub account to see your repositories.</p>
        <button
          onClick={connect}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Repositories</h1>
      <p className="text-slate-400 mb-6">
        Connected as <span className="text-green-400">{state.githubLogin}</span> · {state.repos.length} repositories
      </p>

      <div className="grid gap-3">
        {state.repos.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-white font-medium">
                {r.private ? (
                  <Lock size={14} className="text-orange-400" />
                ) : (
                  <Globe size={14} className="text-blue-400" />
                )}
                {r.fullName}
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {r.language || "Unknown"} · branch {r.defaultBranch} · updated{" "}
                {new Date(r.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
              <ExternalLink size={18} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
