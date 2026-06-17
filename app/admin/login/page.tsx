"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

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
    <div className="min-h-screen font-sans flex flex-col items-center justify-center px-6"
      style={{ background: "#f7f5ef" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif italic text-ink text-2xl">
            <span className="text-sage2">Ec</span>ho
          </span>
        </Link>

        <div className="bg-white rounded-2xl p-8"
          style={{ border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone font-semibold text-center mb-2">
            Admin Access
          </p>
          <h1 className="font-display font-bold text-ink text-2xl text-center mb-8">
            Dashboard <span className="text-sage">Login</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full bg-white border border-black/10 focus:border-sage text-ink text-sm px-4 py-3 pr-11 rounded-xl outline-none transition-colors placeholder:text-stone/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-light">
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

        <p className="text-center mt-6 text-[11px] text-stone/60 font-light leading-relaxed">
          Student submissions are never visible here.<br />
          Only aggregate patterns are shown.
        </p>
      </motion.div>
    </div>
  );
}
