import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Placeholder title="Repositories" />} />
          <Route path="/scans" element={<Placeholder title="Security Scans" />} />
          <Route path="/vulnerabilities" element={<Placeholder title="Vulnerabilities" />} />
          <Route path="/pull-requests" element={<Placeholder title="Pull Requests" />} />
          <Route path="/team" element={<Placeholder title="Team" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  );
}