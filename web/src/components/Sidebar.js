"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, ScanSearch, ShieldAlert, GitPullRequest, Users, Settings, ShieldCheck, KeyRound,
} from "lucide-react";

export const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/repositories", label: "Repositories", icon: GitBranch },
  { href: "/dashboard/scans", label: "Security Scans", icon: ScanSearch },
  { href: "/dashboard/vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert },
  { href: "/dashboard/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function NavList({ onNavigate, isAdmin }) {
  const pathname = usePathname();
  const active = (href) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
  const links = isAdmin ? [...navLinks, { href: "/admin", label: "Admin panel", icon: KeyRound }] : navLinks;

  return (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
            active(href) ? "bg-green-500/10 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          {active(href) && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-green-400 rounded-full" />}
          <Icon size={18} className={active(href) ? "text-green-400" : ""} /> {label}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 shrink-0 bg-slate-900/60 border-r border-slate-800 min-h-screen p-5 hidden md:flex flex-col">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-green-400" size={28} />
        <span className="text-white font-bold text-lg">DependencyGuard</span>
      </Link>
      <NavList isAdmin={user?.isPlatformAdmin} />
      <div className="mt-auto flex items-center gap-3 bg-slate-800/50 border border-slate-800 rounded-xl p-3">
        <div className="w-9 h-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-semibold">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
