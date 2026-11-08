import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import AuthPage from "./pages/AuthPage";
import Repositories from "./pages/Repositories";
import GithubCallback from "./pages/GithubCallback";
import Scans from "./pages/Scans";
import ScanDetail from "./pages/ScanDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/github/callback" element={<GithubCallback />} />
          <Route path="/scans" element={<Scans />} />
          <Route path="/scans/:id" element={<ScanDetail />} />
          <Route path="/vulnerabilities" element={<Placeholder title="Vulnerabilities" />} />
          <Route path="/pull-requests" element={<Placeholder title="Pull Requests" />} />
          <Route path="/team" element={<Placeholder title="Team" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  );
}
