"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageSkeleton, EmptyState, ErrorBox } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = () => apiFetch("/admin/users").then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const patch = async (u, path, body, patchLocal, message) => {
    try {
      await apiFetch(`/admin/users/${u._id}${path}`, { method: "PATCH", body: JSON.stringify(body) });
      setUsers((list) => list.map((x) => (x._id === u._id ? { ...x, ...patchLocal } : x)));
      toast(message);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const toggleDisabled = (u) => {
    const next = !u.disabled;
    if (next && !window.confirm(`Disable ${u.email}?`)) return;
    patch(u, "", { disabled: next }, { disabled: next }, next ? "User disabled" : "User enabled");
  };

  const toggleAdmin = (u) => {
    const next = !u.isPlatformAdmin;
    const text = next ? `Make ${u.email} an admin? They will see all users and scans.` : `Remove admin access from ${u.email}?`;
    if (!window.confirm(text)) return;
    patch(u, "/admin", { isPlatformAdmin: next }, { isPlatformAdmin: next }, next ? "Admin added" : "Admin removed");
  };

  if (error) return <ErrorBox message={error} />;
  if (!users) return <PageSkeleton />;

  const shown = users.filter((u) => (u.email + u.name).toLowerCase().includes(q.toLowerCase()));
  const isMe = (u) => String(u._id) === String(me?.id);

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.length} registered accounts.`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email"
        className="w-full sm:w-80 mb-4 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500" />

      {shown.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-2">User</th><th className="pb-2">GitHub</th><th className="pb-2">Scans</th>
                <th className="pb-2">PRs</th><th className="pb-2">Joined</th><th className="pb-2">Status</th><th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id} className="border-b border-slate-800/60 text-slate-300">
                  <td className="py-3">
                    {u.name} {u.isPlatformAdmin && <span className="ml-1 text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">admin</span>}
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </td>
                  <td>{u.githubLogin || "-"}</td>
                  <td>{u.scans}</td>
                  <td>{u.prs}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${u.disabled ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                      {u.disabled ? "disabled" : "active"}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {!isMe(u) && (
                      <>
                        <button onClick={() => toggleAdmin(u)} className="text-xs text-slate-300 hover:text-white border border-slate-700 rounded-lg px-3 py-1 mr-2">
                          {u.isPlatformAdmin ? "Remove admin" : "Make admin"}
                        </button>
                        {!u.isPlatformAdmin && (
                          <button onClick={() => toggleDisabled(u)} className="text-xs text-slate-300 hover:text-white border border-slate-700 rounded-lg px-3 py-1">
                            {u.disabled ? "Enable" : "Disable"}
                          </button>
                        )}
                      </>
                    )}
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
