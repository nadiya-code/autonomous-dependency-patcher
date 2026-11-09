"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function NavAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-9 w-40" />;

  if (user) {
    return (
      <Link href="/dashboard" className="bg-green-500 hover:bg-green-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg">
        Open dashboard
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-slate-300 hover:text-white text-sm">Log in</Link>
      <Link href="/register" className="bg-green-500 hover:bg-green-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg">
        Get started
      </Link>
    </div>
  );
}
