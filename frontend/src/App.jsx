import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Placeholder title="Repositories" />} />
          <Route path="/scans" element={<Placeholder title="Security Scans" />} />
          <Route path="/vulnerabilities" element={<Placeholder title="Vulnerabilities" />} />
          <Route path="/pull-requests" element={<Placeholder title="Pull Requests" />} />
          <Route path="/team" element={<Placeholder title="Team" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Routes>
      </main>
    </div>
  );
}