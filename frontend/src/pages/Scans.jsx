import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Scans() {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/scans", { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => setScans(data.scans || []))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!scans) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Security Scans</h1>
      <p className="text-slate-400 mb-6">Start a scan from the Repositories page.</p>

      {scans.length === 0 ? (
        <p className="text-slate-500">No scans yet.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">Repository</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Issues</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s._id} className="border-b border-slate-800/60 text-slate-300">
                  <td className="py-3">
                    <Link to={`/scans/${s._id}`} className="text-green-400 hover:underline">
                      {s.repoFullName}
                    </Link>
                  </td>
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
