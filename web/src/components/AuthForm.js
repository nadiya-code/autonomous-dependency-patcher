"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : err.message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(34,197,94,0.15),transparent)]">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
        <Link href="/" className="flex items-center gap-2 justify-center mb-2">
          <ShieldCheck className="text-green-400" size={28} />
          <span className="text-white font-bold text-xl">DependencyGuard</span>
        </Link>
        <h1 className="text-white text-lg font-semibold text-center">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>

        {error && <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">{error}</p>}

        {isRegister && (
          <input className={input} name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
        )}
        <input className={input} type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input className={input} type="password" name="password" placeholder="Password (min 8 characters)"
          value={form.password} onChange={onChange} minLength={8} required />

        <button disabled={busy} className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-slate-950 font-semibold rounded-lg py-2.5 transition">
          {busy ? "Please wait..." : isRegister ? "Register" : "Log in"}
        </button>

        <p className="text-slate-400 text-sm text-center">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link href={isRegister ? "/login" : "/register"} className="text-green-400 hover:underline">
            {isRegister ? "Log in" : "Register"}
          </Link>
        </p>
      </form>
    </div>
  );
}
