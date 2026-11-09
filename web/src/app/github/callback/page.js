"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const installation_id = params.get("installation_id");
    if (!code || !state) {
      setError("Missing code from GitHub");
      return;
    }

    apiFetch("/github/callback", { method: "POST", body: JSON.stringify({ code, state, installation_id }) })
      .then(() => router.replace("/dashboard/repositories"))
      .catch((e) => setError(e.message));
  }, [loading, user, params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-300">
      {error ? <p className="text-red-400">Connection failed: {error}</p> : <p>Connecting GitHub...</p>}
    </div>
  );
}

export default function GithubCallback() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Loading...</p>}>
      <Callback />
    </Suspense>
  );
}
