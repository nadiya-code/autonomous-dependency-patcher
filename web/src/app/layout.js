import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "DependencyGuard | Autonomous dependency vulnerability patching",
  description:
    "DependencyGuard scans your repositories for vulnerable dependencies, patches them, validates the patch in a sandbox, and opens a clean pull request.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
