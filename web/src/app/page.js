import Link from "next/link";
import {
  ShieldCheck, ScanSearch, Wrench, FlaskConical, GitPullRequest, Lock, Container,
  KeyRound, Boxes, CheckCircle2, ArrowRight, Clock, Users, GitBranch, Package, Database,
} from "lucide-react";
import NavAuth from "@/components/NavAuth";
import ProductTabs from "@/components/ProductTabs";
import Reveal from "@/components/Reveal";

const steps = [
  { icon: ScanSearch, title: "Scan", text: "Connect GitHub, pick repositories. We read every package.json and lockfile (monorepos included) and check each dependency against the OSV database." },
  { icon: Wrench, title: "Patch", text: "For each advisory we pick the smallest fixed version. Direct dependencies are bumped, transitive ones are pinned with overrides." },
  { icon: FlaskConical, title: "Validate", text: "The patch runs in an isolated Docker sandbox: install, your tests, your build. If anything fails, no pull request is opened." },
  { icon: GitPullRequest, title: "Pull request", text: "A clean PR with the updated package.json, a regenerated lockfile and a validation report. You review and merge." },
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

const rows = [
  {
    icon: ScanSearch, tag: "Detect", title: "See every vulnerable package, direct or transitive",
    text: "Advisories come from the OSV database with severity, affected version and the version that fixes it. Monorepos are handled: every package.json in the repository is scanned.",
    points: ["Severity breakdown across all repositories", "Direct and transitive dependencies", "Links to the original advisory"],
    card: (
      <div className="space-y-3">
        {[["Critical", "w-[12%]", "bg-red-500"], ["High", "w-[45%]", "bg-orange-500"], ["Medium", "w-[30%]", "bg-yellow-500"], ["Low", "w-[13%]", "bg-blue-500"]].map(([l, w, c]) => (
          <div key={l}>
            <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{l}</span></div>
            <div className="h-2 bg-slate-800 rounded-full"><div className={`h-2 rounded-full ${w} ${c}`} /></div>
          </div>
        ))}
        <p className="text-[11px] text-slate-600 pt-1">Illustrative example.</p>
      </div>
    ),
  },
  {
    icon: FlaskConical, tag: "Validate", title: "Broken patches never reach your team",
    text: "Before a pull request exists, the patch is installed, tested and built in an isolated container. A failure stops the run and shows you the log.",
    points: ["Runs your own test and build scripts", "Regenerates the lockfile", "No PR is opened when validation fails"],
    card: (
      <div className="font-mono text-xs space-y-1.5 text-slate-300">
        <p className="text-green-400">$ npm install</p><p className="text-slate-500">added 24 packages</p>
        <p className="text-green-400">$ npm test</p><p className="text-slate-500">tests passed</p>
        <p className="text-green-400">$ npm run build</p><p className="text-slate-500">build passed</p>
        <p className="text-[11px] text-slate-600 pt-2 font-sans">Illustrative example.</p>
      </div>
    ),
  },
  {
    icon: GitPullRequest, tag: "Review", title: "A normal pull request, ready for review",
    text: "Every patch opens as a regular pull request with a table of what changed and what was validated. Status is tracked live in your dashboard.",
    points: ["Table of changes and validation results", "Open, merged and closed status", "You decide what gets merged"],
    card: (
      <div className="space-y-3 text-sm">
        {[["open", "bg-green-500/10 text-green-400"], ["merged", "bg-purple-500/10 text-purple-400"], ["closed", "bg-red-500/10 text-red-400"]].map(([s, c]) => (
          <div key={s} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300">
            <GitPullRequest size={14} className="text-green-400" /> your-org/web-app
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${c}`}>{s}</span>
          </div>
        ))}
        <p className="text-[11px] text-slate-600">Illustrative example.</p>
      </div>
    ),
  },
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,197,94,0.20),transparent)]" />
        <div className="absolute -z-10 top-40 -right-40 w-[500px] h-[500px] rounded-full bg-green-500/10 blur-3xl animate-float" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Autonomous dependency security
            </span>
            <h1 style={{ animationDelay: "100ms" }} className="animate-fade-up mt-6 text-4xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Fix vulnerable dependencies.{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Before they become incidents.</span>
            </h1>
            <p style={{ animationDelay: "200ms" }} className="animate-fade-up mt-6 text-lg text-slate-400 max-w-xl">
              DependencyGuard scans your repositories, upgrades vulnerable packages, validates the patch in a
              sandbox, and opens a clean pull request. You just review and merge.
            </p>
            <div style={{ animationDelay: "300ms" }} className="animate-fade-up mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 font-semibold px-6 py-3 rounded-lg shadow-lg shadow-green-500/20 transition">
                Start scanning <ArrowRight size={18} />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-200 px-6 py-3 rounded-lg transition">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Works with GitHub. You choose which repositories we can access.</p>
          </div>
          <div style={{ animationDelay: "250ms" }} className="animate-fade-up"><ProductTabs /></div>
        </div>
      </section>

      <section className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-500">
          <span className="flex items-center gap-2"><Package size={16} /> npm and monorepos</span>
          <span className="flex items-center gap-2"><Database size={16} /> OSV advisory data</span>
          <span className="flex items-center gap-2"><Container size={16} /> Docker sandbox</span>
          <span className="flex items-center gap-2"><GitBranch size={16} /> GitHub App</span>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">From advisory to pull request, automatically</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Four steps, with a human review at the end.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {steps.map((s, i) => (
            <div key={s.title} className="lift group bg-slate-900 border border-slate-800 hover:border-green-500/40 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><s.icon className="text-green-400" size={20} /></div>
                <span className="text-slate-700 text-2xl font-bold">0{i + 1}</span>
              </div>
              <h3 className="text-white font-semibold mt-5">{s.title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-24 space-y-24">
          {rows.map((r, i) => (
            <Reveal key={r.title}><div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={i % 2 ? "lg:order-2" : ""}>
                <span className="inline-flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-full px-3 py-1"><r.icon size={14} /> {r.tag}</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-4">{r.title}</h3>
                <p className="text-slate-400 mt-4 leading-relaxed">{r.text}</p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2"><CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />{p}</li>
                  ))}
                </ul>
              </div>
              <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl ${i % 2 ? "lg:order-1" : ""}`}>{r.card}</div>
            </div></Reveal>
          ))}
        </div>
      </section>

      <section id="security" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Built so you can trust it with your code</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Security tooling should not add risk. Access is minimal, short-lived and under your control.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-12">
          {security.map((s) => (
            <div key={s.title} className="lift flex gap-4 bg-slate-900 border border-slate-800 hover:border-green-500/40 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0"><s.icon className="text-green-400" size={20} /></div>
              <div>
                <h3 className="text-white font-semibold">{s.title}</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Simple pricing for engineering organizations</h2>
          <div className="lift max-w-md mx-auto mt-12 bg-slate-900 border border-green-500/30 rounded-2xl p-8 text-left shadow-2xl shadow-green-500/5">
            <p className="text-slate-400 text-sm">Organization plan</p>
            <p className="text-white mt-2"><span className="text-5xl font-bold">$1,500</span><span className="text-slate-400"> / month</span></p>
            <p className="text-slate-500 text-sm mt-1">Per engineering organization</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {["Unlimited repositories you connect", "Scanning, patching and sandbox validation", "Pull requests with validation reports", "Dashboard across all repositories"].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />{t}</li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 block text-center bg-green-500 hover:bg-green-400 text-slate-950 font-semibold py-3 rounded-lg transition">Get started</Link>
            <p className="text-xs text-slate-600 mt-3 text-center">Billing is not live yet. Pricing shown is the planned plan.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center">Frequently asked questions</h2>
        <div className="mt-12 space-y-3">
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
        <div className="bg-gradient-to-br from-green-500/20 to-slate-900 border border-green-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Stop chasing advisories by hand</h2>
          <p className="text-slate-400 mt-3">Connect a repository and see what is vulnerable in minutes.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 font-semibold px-6 py-3 rounded-lg shadow-lg shadow-green-500/20 transition">
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


