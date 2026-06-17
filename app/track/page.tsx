"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackSubmission, type TrackData } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

const SENT_CONFIG = {
  positive: { label: "Positive",  dot: "#e8580a", bg: "#fff1e6", text: "#9a3412" },
  neutral:  { label: "Neutral",   dot: "#8c897f", bg: "#e8e4db", text: "#5a5c58" },
  negative: { label: "Negative",  dot: "#ef4444", bg: "#fee2e2", text: "#9b1c1c" },
  pending:  { label: "Processing…", dot: "#fff1e6", bg: "#f7f5ef", text: "#8c897f" },
};

function TrackInner() {
  const searchParams = useSearchParams();
  const [token, setToken]     = useState(searchParams.get("token") ?? "");
  const [result, setResult]   = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    if (t && !result) {
      setToken(t);
    }
  }, [searchParams, result]);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await trackSubmission(t);
      setResult(data);
    } catch (err: any) {
      setError(err.message?.includes("404") || err.message?.includes("not found")
        ? "Token not found. Check for typos — tokens are case-sensitive."
        : err.message ?? "Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const sentCfg = result
    ? SENT_CONFIG[result.sentiment_label as keyof typeof SENT_CONFIG] ?? SENT_CONFIG.pending
    : null;

  return (
    <div className="min-h-screen bg-ink font-sans flex flex-col">

      <Navbar showAdmin />

      <div className="flex-1 flex items-start justify-center px-6 pt-20 pb-16">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sage2 font-semibold text-xs tracking-[0.24em] uppercase mb-3">
              Submission Tracker
            </p>
            <h1 className="font-display font-bold text-white text-3xl leading-snug mb-3">
              Where is your <span className="text-sage2">suggestion?</span>
            </h1>
            <p className="text-stone font-light text-sm leading-relaxed mb-8">
              Enter the anonymous token you received after submitting. We'll show you what
              category it was assigned to and how it was processed — without ever identifying you.
            </p>

            <form onSubmit={handleTrack} className="space-y-3 mb-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-semibold mb-2">
                  Your Anonymous Token
                </label>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. 3f8a2c1d-7b4e-..."
                  required
                  className="w-full bg-ink2 border border-white/[0.08] focus:border-sage/60 text-white text-sm px-4 py-3 rounded-xl outline-none transition-colors font-mono placeholder:text-stone/30"
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
                className="w-full bg-sage hover:bg-sage2 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {loading ? "Looking up…" : "Track Submission →"}
              </button>
            </form>

            <AnimatePresence>
              {result && sentCfg && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3"
                >
                  {/* Status header */}
                  <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: result.processed ? "#fff1e6" : "#2a2c28" }}>
                        <span style={{ fontSize: 16 }}>{result.processed ? "✓" : "⟳"}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {result.processed ? "Submission processed" : "Processing in progress"}
                        </div>
                        <div className="text-stone font-light text-xs">
                          {result.processed
                            ? "NLP analysis complete · cluster assigned"
                            : "NLP pipeline running · check back shortly"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Category", value: result.category },
                        { label: "Location", value: result.location },
                        { label: "Submitted", value: result.submitted },
                        { label: "Week #", value: result.week_num },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-ink/60 rounded-xl p-3">
                          <div className="text-[9px] uppercase tracking-[0.2em] text-stone/40 font-semibold mb-1">{label}</div>
                          <div className="text-white text-sm font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment */}
                  {result.processed && (
                    <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-stone/40 font-semibold mb-3">
                        Sentiment Analysis
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: sentCfg.dot }} />
                        <span className="font-display font-bold text-white text-xl">{sentCfg.label}</span>
                        <span className="font-mono text-sm text-stone">
                          {result.sentiment_score > 0 ? "+" : ""}{result.sentiment_score.toFixed(3)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#221a14" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(((result.sentiment_score + 1) / 2) * 100)}%`,
                            background: sentCfg.dot,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-stone/30">−1 Negative</span>
                        <span className="text-[10px] text-stone/30">+1 Positive</span>
                      </div>
                    </div>
                  )}

                  {/* Cluster info */}
                  {result.processed && result.cluster_id >= 0 && (
                    <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-stone/40 font-semibold mb-3">
                        Topic Cluster
                      </div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-display font-bold text-white text-2xl">Cluster {result.cluster_id}</span>
                      </div>
                      <p className="text-stone font-light text-sm leading-relaxed">
                        K-Means clustering grouped your submission with other suggestions that share similar language
                        and themes. Your voice is part of a broader pattern.
                      </p>
                    </div>
                  )}

                  {/* Priority */}
                  {result.processed && (
                    <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-stone/40 font-semibold mb-3">
                        Priority Score
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-display font-bold text-white text-2xl">{result.priority_score.toFixed(4)}</span>
                        <span className="text-stone text-xs">/ 1.0000</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "#221a14" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(result.priority_score * 100)}%`, background: "#e8580a" }} />
                      </div>
                      <p className="text-stone font-light text-xs leading-relaxed">
                        Priority = 0.4 × recency + 0.2 × |sentiment|. Higher-priority issues surface first in the admin dashboard.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setToken(""); setResult(null); }}
                      className="border border-white/10 hover:border-white/25 text-stone hover:text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                    >
                      Track Another
                    </button>
                    <Link href="/" className="bg-sage hover:bg-sage2 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
                      Back to Home
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Explainer */}
          {!result && (
            <div className="mt-10 pt-8 border-t border-white/[0.05]">
              <p className="text-stone/30 text-[10px] uppercase tracking-[0.22em] font-semibold mb-4">How tracking works</p>
              <div className="space-y-3">
                {[
                  { step: "01", text: "Enter your UUID4 token from the submission confirmation screen." },
                  { step: "02", text: "We look up the submission by token (no name or login required)." },
                  { step: "03", text: "You see category, location, sentiment score, and cluster — never individual identity." },
                ].map(({ step, text }) => (
                  <div key={step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-sage/15 flex items-center justify-center text-sage2 text-[10px] font-bold shrink-0 mt-0.5">
                      {step}
                    </div>
                    <p className="text-stone font-light text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-sans font-light text-sm" style={{ color: "#8c897f" }}>Loading…</p>
      </div>
    }>
      <TrackInner />
    </Suspense>
  );
}
