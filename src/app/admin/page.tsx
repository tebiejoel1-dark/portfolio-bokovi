"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { ADMIN_CODE } from "@/lib/content";
import Dashboard from "@/components/admin/Dashboard";

const SESSION_KEY = "bk_admin_auth";

function useAuth() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) === "true";
  });
  const login = (code: string) => {
    if (code === ADMIN_CODE) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };
  return { authed, login, logout };
}

export default function AdminPage() {
  const { authed, login, logout } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Lock size={24} />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Espace Pro — BOKOVI
            </h1>
            <p className="mt-2 text-sm text-dim">
              Saisis ton code d’accès pour ouvrir le dashboard.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!login(code.trim())) {
                setError(true);
                setTimeout(() => setError(false), 600);
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code d'accès"
              className={`w-full rounded-2xl border bg-transparent px-5 py-4 text-center text-lg tracking-[0.3em] outline-none transition-colors focus:border-accent ${
                error ? "animate-pulse border-red-500" : "border-white/10"
              }`}
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-accent py-4 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
            >
              Ouvrir le dashboard
            </button>
          </form>
          <button
            onClick={() => router.push("/")}
            className="mt-6 flex w-full items-center justify-center gap-2 text-xs text-dim transition-colors hover:text-accent"
          >
            <ShieldCheck size={14} /> Retour au site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="font-display text-lg font-bold">
            BOKOVI<span className="text-accent">.</span>
            <span className="ml-2 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              Pro
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-dim transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </header>
      <Dashboard />
    </div>
  );
}