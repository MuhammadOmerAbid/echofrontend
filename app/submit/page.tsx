"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { submitSuggestion, getCategories, getLocations } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("echo_session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("echo_session", id);
  }
  return id;
}

const fieldClass =
  "w-full bg-ink2 border border-white/[0.08] text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-sage/60 transition-colors placeholder:text-stone/40 appearance-none";

export default function SubmitPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations]   = useState<string[]>([]);
  const [category, setCategory]     = useState("");
  const [location, setLocation]     = useState("");
  const [text, setText]             = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [token, setToken]           = useState("");
  const [error, setError]           = useState("");

  useEffect(() => {
    getCategories().then((d) => setCategories(d.map((c) => c.name)));
    getLocations().then((d) => setLocations(d.map((l) => l.name)));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !location || !text.trim()) {
      setError("Please fill in all fields before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await submitSuggestion({ category, location, text, session_id: getSessionId() });
      setToken(res.token);
      setDone(true);
    } catch (err: any) {
      setError(
        err.message?.includes("Too many")
          ? "You've submitted 3 times this hour. Please wait before trying again."
          : err.message ?? "Submission failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink font-sans flex flex-col">
      <Navbar showAdmin />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-sage2 font-semibold text-xs tracking-[0.24em] uppercase mb-3">
                  Anonymous Submission
                </p>
                <h1 className="font-display font-bold text-white text-3xl leading-snug mb-2">
                  Say what you <span className="text-sage2">actually think.</span>
                </h1>
                <p className="text-stone font-light text-sm leading-relaxed mb-8">
                  No name. No login. No trace. Your suggestion goes straight to the pattern — not to a person.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-semibold mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className={fieldClass}
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-semibold mb-2">
                      Campus Location
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className={fieldClass}
                    >
                      <option value="" disabled>Select a location</option>
                      {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Text */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-stone font-semibold">
                        Your Suggestion
                      </label>
                      <span className={`text-[11px] font-light ${1000 - text.length < 100 ? "text-red-400" : "text-stone/40"}`}>
                        {1000 - text.length} left
                      </span>
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, 1000))}
                      rows={5}
                      placeholder="Be specific. What's the issue, and what would help?"
                      required
                      className={`${fieldClass} resize-y`}
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
                    {loading ? "Submitting…" : "Submit Anonymously →"}
                  </button>
                </form>

                <p className="text-center mt-6 text-[11px] text-stone/30 font-light leading-relaxed">
                  Your identity is never collected. Each submission receives a random token.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-center mb-7">
                  <p className="font-serif italic text-sage2 text-5xl mb-5 select-none">✦</p>
                  <h2 className="font-display font-bold text-white text-3xl mb-3">Your voice has been heard.</h2>
                  <p className="text-stone font-light text-sm leading-relaxed">
                    Your suggestion is anonymous and has joined the pattern. Thank you for speaking up.
                  </p>
                </div>

                <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5 mb-4">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-stone/40 font-semibold mb-2">
                    Your Anonymous Token — save this
                  </p>
                  <code className="text-sage2 text-sm font-mono break-all leading-relaxed">{token}</code>
                  <p className="text-stone/40 text-[10px] font-light mt-2 leading-relaxed">
                    This token is your only link to this submission. It doesn't identify you — it lets you check the category and sentiment that were assigned.
                  </p>
                </div>

                {/* What happens next */}
                <div className="bg-ink2 border border-white/[0.07] rounded-2xl p-5 mb-5">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-stone/40 font-semibold mb-3">What happens next</p>
                  <div className="space-y-2.5">
                    {[
                      { icon: "⟳", label: "NLP Pipeline", desc: "NLTK cleans your text, TextBlob scores sentiment, TF-IDF extracts keywords." },
                      { icon: "◎", label: "Cluster Assignment", desc: "K-Means groups your suggestion with similar ones. Your theme joins a pattern." },
                      { icon: "↑", label: "Priority Scoring", desc: "Recency + sentiment weight determines if it surfaces in the admin priority view." },
                    ].map(({ icon, label, desc }) => (
                      <div key={label} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-sage/15 flex items-center justify-center text-sage2 text-xs shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold mb-0.5">{label}</div>
                          <div className="text-stone/60 text-xs font-light">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href={`/track?token=${encodeURIComponent(token)}`}
                    className="w-full text-center bg-sage hover:bg-sage2 text-white rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                  >
                    Track This Submission →
                  </Link>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setDone(false); setText(""); setCategory(""); setLocation(""); }}
                      className="flex-1 border border-white/10 hover:border-white/25 text-stone hover:text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
                    >
                      Submit Another
                    </button>
                    <Link href="/" className="flex-1 text-center border border-white/10 hover:border-white/25 text-stone hover:text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors">
                      Home
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
