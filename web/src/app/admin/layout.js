"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Users, ScanSearch, ArrowLeft, LogOut } from "lucide-react";
import { ToastProvider } from "@/components/Toast";
import { PageSkeleton } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/scans", label: "All scans", icon: ScanSearch },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!user.isPlatformAdmin) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || !user || !user.isPlatformAdmin) return <div className="p-8"><PageSkeleton /></div>;

  return (
    <ToastProvider>
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="text-green-400" size={24} /> Admin
            <span className="text-xs text-slate-500 font-normal">DependencyGuard</span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${active ? "bg-green-500/10 text-white" : "text-slate-400 hover:text-white"}`}>
                  <t.icon size={16} className={active ? "text-green-400" : ""} /> <span className="hidden sm:inline">{t.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-white"><ArrowLeft size={14} /> App</Link>
            <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-1 text-slate-400 hover:text-white"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">{children}</main>
    </ToastProvider>
  );
}
