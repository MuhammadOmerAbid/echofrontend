"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminLogin } from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (isAuthenticated()) router.replace("/admin/dashboard");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(password);
      setToken(res.access_token);
      router.push("/admin/dashboard");
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink font-sans flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif italic text-white text-2xl">
            <span className="text-sage2">Ec</span>ho
          </span>
        </Link>

        <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-8" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone font-semibold text-center mb-2">
            Admin Access
          </p>
          <h1 className="font-display font-bold text-white text-2xl text-center mb-8">
            Dashboard <span className="text-sage2">Login</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                className="w-full bg-ink border border-white/[0.08] focus:border-sage/50 text-white text-sm px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-stone/30"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/40 text-red-300 text-sm px-4 py-3 rounded-xl font-light">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage hover:bg-sage2 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors duration-200"
            >
              {loading ? "Verifying…" : "Enter Dashboard →"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[11px] text-stone/30 font-light leading-relaxed">
          Student submissions are never visible here.<br />
          Only aggregate patterns are shown.
        </p>
      </motion.div>
    </div>
  );
}
