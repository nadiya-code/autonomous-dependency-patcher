"use client";

import { useState } from "react";
import { User, Lock, GitBranch, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

const input =
  "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 disabled:opacity-60";
const primary =
  "bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg";

function Section({ icon: Icon, title, text, children }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Icon size={18} className="text-green-400" /> {title}
      </div>
      {text && <p className="text-slate-500 text-sm mt-1">{text}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const d = await apiFetch("/auth/profile", { method: "PATCH", body: JSON.stringify({ name }) });
      setUser(d.user);
      toast("Profile updated");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast("New passwords do not match", "error");
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      setPw({ current: "", next: "", confirm: "" });
      toast("Password changed");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSavingPw(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect GitHub from DependencyGuard? Your scan history is kept.")) return;
    setDisconnecting(true);
    try {
      await apiFetch("/github/connection", { method: "DELETE" });
      const d = await apiFetch("/auth/me");
      setUser(d.user);
      toast("GitHub disconnected");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDisconnecting(false);
    }
  };

  const connected = !!user?.githubInstallationId;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and integrations." />

      <Section icon={User} title="Profile">
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} />
          </div>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input className={input} value={user?.email || ""} disabled />
          </div>
          <button disabled={savingName || name.trim() === user?.name} className={primary}>
            {savingName ? "Saving..." : "Save changes"}
          </button>
        </form>
      </Section>

      <Section icon={Lock} title="Password" text="Use at least 8 characters.">
        <form onSubmit={savePassword} className="space-y-4">
          <input className={input} type="password" placeholder="Current password" autoComplete="current-password"
            value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          <input className={input} type="password" placeholder="New password" autoComplete="new-password"
            value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={8} maxLength={72} />
          <input className={input} type="password" placeholder="Confirm new password" autoComplete="new-password"
            value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required minLength={8} maxLength={72} />
          <button disabled={savingPw} className={primary}>{savingPw ? "Updating..." : "Change password"}</button>
        </form>
      </Section>

      <Section icon={GitBranch} title="GitHub connection">
        {connected ? (
          <div className="space-y-3">
            <p className="text-slate-300 text-sm">
              Connected as <span className="text-green-400">{user.githubLogin}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={disconnect} disabled={disconnecting}
                className="text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg px-4 py-2 disabled:opacity-50">
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
              <a href="https://github.com/settings/installations" target="_blank" rel="noreferrer"
                className="text-sm text-green-400 hover:underline">
                Manage or uninstall on GitHub
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Disconnect removes the link inside DependencyGuard only. To revoke access completely, uninstall the app in your GitHub settings.
            </p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">
            GitHub is not connected. Go to the Repositories page to install the GitHub App.
          </p>
        )}
      </Section>

      <Section icon={Sparkles} title="AI assistance" text="Let AI suggest code fixes when an upgrade breaks your tests or build.">
        <div className="flex items-center justify-between opacity-60">
          <span className="text-sm text-slate-300">AI-assisted code migration</span>
          <span className="flex items-center gap-2 text-xs text-slate-500">
            Coming soon
            <span className="w-10 h-6 rounded-full bg-slate-700 relative">
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-slate-400" />
            </span>
          </span>
        </div>
      </Section>
    </div>
  );
}
