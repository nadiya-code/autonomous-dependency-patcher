import Link from "next/link";
import {
  ShieldCheck, ScanSearch, Wrench, FlaskConical, GitPullRequest, Lock,
  Container, KeyRound, Boxes, CheckCircle2, ArrowRight, Clock, Users,
} from "lucide-react";
import NavAuth from "@/components/NavAuth";

const steps = [
  { icon: ScanSearch, title: "Scan", text: "Connect GitHub, pick repositories. We read every package.json and lockfile (monorepos included) and check each dependency against the OSV vulnerability database." },
  { icon: Wrench, title: "Patch", text: "For each advisory we pick the smallest fixed version. Direct dependencies are bumped, transitive ones are pinned with overrides. Major bumps are flagged." },
  { icon: FlaskConical, title: "Validate", text: "The patch runs in an isolated Docker sandbox: install, your tests, your build. If anything fails, no pull request is opened." },
  { icon: GitPullRequest, title: "Pull request", text: "A clean PR with the updated package.json, a regenerated lockfile and a validation report. You review and merge. We never merge for you." },
];

const features = [
  { icon: ScanSearch, title: "Real vulnerability data", text: "Advisories from OSV with severity, fixed versions and links, across direct and transitive dependencies." },
  { icon: Boxes, title: "Monorepo aware", text: "Finds every package.json in the repository, like frontend and backend folders, and patches each one." },
  { icon: FlaskConical, title: "Validated before PR", text: "Broken patches never reach your team. A failed install, test or build stops the run and shows the log." },
  { icon: GitPullRequest, title: "Reviewable output", text: "Every change is a normal pull request with a table of what changed and what was validated." },
  { icon: Clock, title: "Live status", text: "See open, merged and closed state of every patch PR, read live from GitHub." },
  { icon: Users, title: "Built for engineering orgs", text: "One workspace for your repositories, with severity breakdowns across everything you scan." },
];

const security = [
  { icon: KeyRound, title: "GitHub App, least privilege", text: "You choose exactly which repositories we can access. We ask only for contents, pull requests and metadata." },
  { icon: Lock, title: "No long-lived tokens stored", text: "We keep only the installation ID. Access tokens are minted on demand and expire after an hour." },
  { icon: Container, title: "Sandboxed execution", text: "Repository code runs in a locked-down container with memory, CPU and time limits and dropped capabilities." },
  { icon: ShieldCheck, title: "Humans stay in control", text: "Patches arrive as pull requests. Nothing is merged automatically." },
];

const faqs = [
  { q: "Will it change my main branch directly?", a: "No. Every patch goes to a new branch and opens a pull request. You review it and decide whether to merge." },
  { q: "What if a patch breaks my tests?", a: "We run install, tests and build in a sandbox first. If any step fails, we do not open a PR and show you the failure log instead." },
  { q: "Which ecosystems are supported?", a: "Today: npm (package.json and package-lock.json), including monorepos. Other ecosystems are on the roadmap." },
  { q: "Do you store my source code?", a: "Repositories are downloaded to a temporary folder for validation and deleted right after the run." },
  { q: "Can I choose which repositories you access?", a: "Yes. You install the GitHub App on selected repositories only, and can change that any time in GitHub settings." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/80 border-b border-slate-800/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="text-green-400" size={26} /> DependencyGuard
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <NavAuth />
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,197,94,0.18),transparent)]" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Autonomous dependency security
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-white leading-tight">
              Fix vulnerable dependencies. <span className="text-green-400">Before they become incidents.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-400 max-w-xl">
              DependencyGuard scans your repositories, upgrades vulnerable packages, validates the patch in a
              sandbox, and opens a clean pull request. You just review and merge.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 font-semibold px-6 py-3 rounded-lg">
                Start scanning <ArrowRight size={18} />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-200 px-6 py-3 rounded-lg">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Works with GitHub. You choose which repositories we can access.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white font-medium">
              <GitPullRequest size={18} className="text-green-400" />
              fix(deps): patch vulnerable dependencies
              <span className="ml-auto text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">open</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">dependencyguard[bot] wants to merge into main</p>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="pb-2">Package</th><th className="pb-2">From</th><th className="pb-2">To</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/60"><td className="py-2">axios</td><td>0.21.1</td><td className="text-green-400">0.33.0</td></tr>
                <tr><td className="py-2">lodash</td><td>4.17.15</td><td className="text-green-400">4.18.0</td></tr>
              </tbody>
            </table>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              {["npm install", "Tests", "Build"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-green-400" /> {s}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 mt-3">Illustrative example.</p>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white">From advisory to pull request, automatically</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Four steps, with a human review at the end.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <s.icon className="text-green-400" size={24} />
                <span className="text-slate-600 text-sm">0{i + 1}</span>
              </div>
              <h3 className="text-white font-semibold mt-4">{s.title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white">Everything your team needs to stay patched</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <f.icon className="text-green-400" size={20} />
                </div>
                <h3 className="text-white font-semibold mt-4">{f.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white">Built so you can trust it with your code</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Security tooling should not add risk. Access is minimal, short-lived and under your control.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          {security.map((s) => (
            <div key={s.title} className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <s.icon className="text-green-400 shrink-0" size={24} />
              <div>
                <h3 className="text-white font-semibold">{s.title}</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white">Simple pricing for engineering organizations</h2>
          <div className="max-w-md mx-auto mt-10 bg-slate-900 border border-green-500/30 rounded-2xl p-8 text-left">
            <p className="text-slate-400 text-sm">Organization plan</p>
            <p className="text-white mt-2"><span className="text-4xl font-bold">$1,500</span><span className="text-slate-400"> / month</span></p>
            <p className="text-slate-500 text-sm mt-1">Per engineering organization</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {["Unlimited repositories you connect", "Scanning, patching and sandbox validation", "Pull requests with validation reports", "Dashboard across all repositories"].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />{t}</li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 block text-center bg-green-500 hover:bg-green-400 text-slate-950 font-semibold py-3 rounded-lg">
              Get started
            </Link>
            <p className="text-xs text-slate-600 mt-3 text-center">Billing is not live yet. Pricing shown is the planned plan.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center">Frequently asked questions</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
              <summary className="cursor-pointer text-white font-medium list-none flex justify-between">
                {f.q}<span className="text-slate-500 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-green-500/20 to-slate-900 border border-green-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white">Stop chasing advisories by hand</h2>
          <p className="text-slate-400 mt-3">Connect a repository and see what is vulnerable in minutes.</p>
          <Link href="/register" className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 font-semibold px-6 py-3 rounded-lg">
            Start scanning <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800/70 py-8 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} DependencyGuard
      </footer>
    </div>
  );
}
