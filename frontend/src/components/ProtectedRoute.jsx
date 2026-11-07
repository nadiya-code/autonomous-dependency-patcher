import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 p-8">Loading...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}