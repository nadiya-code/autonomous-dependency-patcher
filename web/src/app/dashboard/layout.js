"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { PageSkeleton } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <div className="p-8"><PageSkeleton /></div>;

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <header className="flex items-center justify-end gap-4 px-8 py-4 border-b border-slate-800">
            <span className="text-slate-300 text-sm">{user.name}</span>
            <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
              <LogOut size={16} /> Logout
            </button>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
