import { GitBranch, ShieldAlert, GitPullRequest, CheckCircle2 } from "lucide-react";
import StatCard from "../components/StatCard";

// Sample data only. Later backend nunchi vasthundi.
const stats = [
  { title: "Repositories", value: 12, icon: GitBranch, color: "text-blue-400" },
  { title: "Open Vulnerabilities", value: 28, icon: ShieldAlert, color: "text-red-400" },
  { title: "Patches Created", value: 15, icon: CheckCircle2, color: "text-green-400" },
  { title: "Open Pull Requests", value: 6, icon: GitPullRequest, color: "text-orange-400" },
];

const scans = [
  { repo: "ecommerce-website", date: "Today", found: 5, status: "Completed" },
  { repo: "student-management", date: "Yesterday", found: 2, status: "Completed" },
  { repo: "chat-application", date: "2 days ago", found: 0, status: "Failed" },
];

const severity = [
  { label: "Critical", count: 3, bar: "bg-red-500" },
  { label: "High", count: 8, bar: "bg-orange-500" },
  { label: "Medium", count: 11, bar: "bg-yellow-500" },
  { label: "Low", count: 6, bar: "bg-blue-500" },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Security Overview</h1>
      <p className="text-slate-400 mb-6">Sample data. Real data later connect chestham.</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Scans</h2>
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
                <tr key={s.repo} className="border-b border-slate-800/60 text-slate-300">
                  <td className="py-3">{s.repo}</td>
                  <td>{s.date}</td>
                  <td>{s.found}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      s.status === "Completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">By Severity</h2>
          <div className="space-y-4">
            {severity.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>{s.label}</span><span>{s.count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${(s.count / 28) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}