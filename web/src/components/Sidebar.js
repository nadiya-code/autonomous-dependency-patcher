"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, ScanSearch, ShieldAlert, GitPullRequest, Users, Settings, ShieldCheck,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/repositories", label: "Repositories", icon: GitBranch },
  { href: "/dashboard/scans", label: "Security Scans", icon: ScanSearch },
  { href: "/dashboard/vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert },
  { href: "/dashboard/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const active = (href) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 min-h-screen p-5 hidden md:block">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-green-400" size={28} />
        <span className="text-white font-bold text-lg">DependencyGuard</span>
      </Link>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              active(href) ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
