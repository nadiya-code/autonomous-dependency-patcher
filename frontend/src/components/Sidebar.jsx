import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GitBranch, ScanSearch, ShieldAlert,
  GitPullRequest, Users, Settings, ShieldCheck,
} from "lucide-react";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/repositories", label: "Repositories", icon: GitBranch },
  { to: "/scans", label: "Security Scans", icon: ScanSearch },
  { to: "/vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert },
  { to: "/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { to: "/team", label: "Team", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 min-h-screen p-5">
      <div className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-green-400" size={28} />
        <span className="text-white font-bold text-lg">DependencyGuard</span>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}