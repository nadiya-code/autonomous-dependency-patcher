import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-end gap-4 px-8 py-4 border-b border-slate-800">
          <span className="text-slate-300 text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}