"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import Sidebar, { NavList } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { PageSkeleton } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <div className="p-8"><PageSkeleton /></div>;

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar user={user} />

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2 text-white font-bold"><ShieldCheck className="text-green-400" size={24} /> DependencyGuard</Link>
                <button onClick={() => setOpen(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/80 flex items-center justify-between px-6 md:px-8 py-4 border-b border-slate-800">
            <button onClick={() => setOpen(true)} className="md:hidden text-slate-300"><Menu size={22} /></button>
            <span className="hidden md:block" />
            <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
              <LogOut size={16} /> Logout
            </button>
          </header>
          <main key={pathname} className="animate-fade-in p-6 md:p-8 max-w-6xl">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}



