"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import DashboardMockup from "@/components/features/DashboardMockup";
import { getPublicStats, trackSubmission, type PublicStats, type TrackData } from "@/lib/api";

const CATEGORIES = [
  {
    tag: "Facilities", desc: "Physical campus & daily life",
    items: [
      "The library closes at 8 pm — we need it open until 10 during exams.",
      "There's no covered area near the main gate when it rains.",
      "The girls' common room has been locked for two months.",
    ],
  },
  {
    tag: "Academic", desc: "Classes, schedules & resources",
    items: [
      "Three exams in one day happens every semester — it shouldn't.",
      "CS lab computers can't run half the software we're taught on.",
      "Course outlines should be shared before enrollment, not after.",
    ],
  },
  {
    tag: "Campus Life", desc: "Culture, community & representation",
    items: [
      "No female faculty in engineering. That matters.",
      "Student societies need a proper budget process — not favouritism.",
      "Drinking water isn't available in half the buildings.",
    ],
  },
  {
    tag: "Open", desc: "Anything else worth saying",
    items: [
      "The canteen food has gotten noticeably worse this semester.",
      "Can we get lockers? Carrying everything all day is exhausting.",
      "The new dean's open-door policy is actually working — keep it.",
    ],
  },
];

const STEPS = [
  { n: "01", title: "Student Submits",    desc: "Pick a category and location, write your suggestion, hit submit. No login. No name. No identity. Done in under a minute." },
  { n: "02", title: "ML Processes It",    desc: "NLTK cleans text, TextBlob scores sentiment (−1 to +1), TF-IDF extracts keywords, K-Means assigns a topic cluster. All in a background task." },
  { n: "03", title: "Admin Sees Patterns", desc: "Trending issues, location hotspots, anomaly alerts, sentiment shifts — aggregated, never individual. One voice becomes signal. A hundred become action." },
];

const PIPELINE = [
  { label: "Ingest",   tech: "FastAPI + SQLite",  desc: "UUID4 token, bleach sanitize, rate limit 3/hr" },
  { label: "NLP",      tech: "NLTK + TextBlob",   desc: "Clean → tokenize → sentiment polarity" },
  { label: "Keywords", tech: "TF-IDF",             desc: "Top-5 terms per submission" },
  { label: "Cluster",  tech: "K-Means (k=6)",      desc: "Thematic grouping, PCA scatter" },
  { label: "Anomaly",  tech: "Z-score (SciPy)",    desc: "Flag volume spikes > 2σ" },
  { label: "Priority", tech: "Custom formula",     desc: "0.4×recency + 0.2×|sentiment|" },
];

const FEATURES = [
  { n: "01", title: "Anonymous by Design",    desc: "No name, no ID, no login. Each submission gets a UUID4 token — entries are distinct but completely untraceable. Anonymity is structural, not a setting." },
  { n: "02", title: "Six-Stage ML Pipeline",  desc: "NLTK cleaning, TextBlob sentiment, TF-IDF keywords, K-Means clustering, PCA visualization, Z-score anomaly detection — all running locally in Python." },
  { n: "03", title: "Admin Pattern Dashboard", desc: "A password-protected view shows trending categories, location heatmaps, weekly volume trends, topic clusters — aggregate only. No individual entry is ever visible." },
  { n: "04", title: "Fully Offline",           desc: "All data lives in a local SQLite database. No server, no cloud, no internet required. The institution owns its data completely." },
];

const PRIVACY = [
  { title: "Structural anonymity", body: "No name, student ID, email, or login — ever. UUID4 tokens are generated at random with no link to any person. Even the database owner cannot de-anonymise them." },
  { title: "Rate limiting without tracking", body: "Session IDs are browser-random strings, never linked to profiles. Limits 3 submissions/hour. When your browser session ends, the ID is gone." },
  { title: "No cloud, no external API", body: "SQLite on disk. Python on the same machine. No OpenAI, no analytics tracker. Data physically cannot leave the premises." },
  { title: "Admin sees patterns, not people", body: "The admin dashboard shows charts and aggregates only. Individual text is visible only in the Submissions Browser, with no identity link whatsoever." },
];

const sentCfg = {
  positive: { label: "Positive",   color: "#e8580a", bg: "rgba(232,88,10,0.1)" },
  neutral:  { label: "Neutral",    color: "#8c897f", bg: "rgba(140,137,127,0.1)" },
  negative: { label: "Negative",   color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  pending:  { label: "Processing", color: "#8c897f", bg: "rgba(140,137,127,0.06)" },
};

export default function Home() {
  const [stats, setStats]           = useState<PublicStats | null>(null);
  const [trackToken, setTrackToken] = useState("");
  const [trackResult, setResult]    = useState<TrackData | null>(null);
  const [trackLoading, setTL]       = useState(false);
  const [trackError, setTE]         = useState("");

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
  }, []);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const t = trackToken.trim();
    if (!t) return;
    setTE("");
    setResult(null);
    setTL(true);
    try {
      setResult(await trackSubmission(t));
    } catch (err: any) {
      setTE(err.message?.includes("404") || err.message?.includes("not found")
        ? "Token not found. Check for typos — tokens are case-sensitive."
        : "Lookup failed. Make sure the backend is running.");
    } finally {
      setTL(false);
    }
  }

  const sc = trackResult
    ? sentCfg[trackResult.sentiment_label as keyof typeof sentCfg] ?? sentCfg.pending
    : null;

  return (
    <div className="bg-paper min-h-screen font-sans">
      <Navbar transparent showAdmin />

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(232,88,10,0.12) 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute -top-10 -left-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(232,88,10,0.05)" }} />
        <div className="absolute -bottom-24 -right-28 w-[460px] h-[460px] rounded-full border-[56px] border-sage/20 pointer-events-none" />
        <div className="absolute top-32 right-8 w-14 h-14 rounded-full bg-sage/[0.08] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-8 pt-24 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sage font-semibold text-xs tracking-[0.25em] uppercase mb-5">
              Student Voice Platform · 2026
            </p>
            <h1 className="font-display font-bold text-ink mb-6"
              style={{ fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
              Your voice,<br />finally<br /><span className="text-sage">heard.</span>
            </h1>
            <p className="text-stone font-light text-[15px] leading-relaxed mb-10 max-w-md">
              An anonymous suggestion platform where students say what they actually think — and institutions finally see{" "}
              <span className="text-ink font-medium">the pattern behind the noise.</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/submit"
                className="bg-sage hover:bg-sage2 text-white font-semibold rounded-full px-7 py-3.5 text-sm transition-colors duration-200">
                Submit Anonymously
              </Link>
              <a href="#how-it-works"
                className="border border-black/15 hover:border-sage text-stone hover:text-sage rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-200">
                How It Works →
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 48, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-center"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-sage/10 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <span className="text-stone text-sm font-light">Anonymous by design · Zero logins · Never leaves campus · Built-in ML</span>
          </div>
        </div>
      </section>

      {/* ══ LIVE STATS ══ */}
      <section className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-6 text-center">Live Platform Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats ? (
              [
                { value: stats.total.toLocaleString(),     label: "Total Submissions",    accent: true },
                { value: stats.this_week.toLocaleString(), label: "This Week",            accent: false },
                { value: `${stats.positive_pct}%`,         label: "Positive Sentiment",   accent: true },
                { value: stats.top_category,               label: "Most Active Category", accent: false },
                { value: stats.locations_covered,          label: "Locations Covered",    accent: false },
              ].map(({ value, label, accent }) => (
                <div key={label} className="text-center p-5 rounded-2xl"
                  style={{
                    background: accent ? "rgba(232,88,10,0.07)" : "#ffffff",
                    border: accent ? "1px solid rgba(232,88,10,0.15)" : "1px solid rgba(0,0,0,0.07)",
                  }}>
                  <div className="font-display font-bold mb-1" style={{ fontSize: 28, color: accent ? "#e8580a" : "#111210" }}>
                    {value}
                  </div>
                  <div className="font-sans font-light text-xs" style={{ color: "#8c897f" }}>{label}</div>
                </div>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center p-5 rounded-2xl animate-pulse"
                  style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="h-7 w-16 rounded mx-auto mb-2" style={{ background: "rgba(0,0,0,0.07)" }} />
                  <div className="h-3 w-24 rounded mx-auto" style={{ background: "rgba(0,0,0,0.05)" }} />
                </div>
              ))
            )}
          </div>
          <p className="text-center font-sans font-light text-xs mt-4" style={{ color: "#8c897f" }}>
            {stats ? "Real-time data from this deployment. " : "Connecting to local backend… "}
            <a href="#track" className="text-sage hover:underline">Track your submission →</a>
          </p>
        </div>
      </section>

      {/* ══ WHAT STUDENTS SAY ══ */}
      <section id="categories" className="bg-paper py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Example Submissions</p>
          <h2 className="font-display font-bold text-ink mb-4" style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.15 }}>
            The things said in WhatsApp groups —<br />
            <span className="text-sage">finally said somewhere useful.</span>
          </h2>
          <p className="text-stone font-light text-sm mb-12 max-w-xl">
            Illustrative examples across four categories. Real submissions from your campus will reflect your institution's specific concerns.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {CATEGORIES.map((card) => (
              <div key={card.tag} className="bg-cream rounded-2xl p-7 border border-leaf/50">
                <div className="flex items-center gap-3 mb-5">
                  <span className="bg-sage/10 text-sage text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">{card.tag}</span>
                  <span className="text-stone text-xs">{card.desc}</span>
                </div>
                <ul className="space-y-2.5">
                  {card.items.map((ex, i) => (
                    <li key={i} className="font-light italic text-[13px] leading-relaxed px-4 py-3 rounded-xl bg-warm border-l-2 border-sage/30 text-stone">"{ex}"</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="bg-warm py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">How It Works</p>
          <h2 className="font-display font-bold text-ink mb-16" style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.15 }}>
            Three steps. <span className="text-sage">Zero friction.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col gap-5"
              >
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-xs font-bold shrink-0">{s.n}</div>
                <div className="font-display font-semibold text-ink text-xl">{s.title}</div>
                <p className="text-stone font-light text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Core Features</p>
          <h2 className="font-display font-bold text-ink mb-16" style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.15 }}>
            Simple on the surface. <span className="text-sage">Deep</span> underneath.
          </h2>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {FEATURES.map((f) => (
              <div key={f.n} className="flex gap-5">
                <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center text-sage text-[11px] font-bold shrink-0 mt-0.5">{f.n}</div>
                <div>
                  <div className="font-display font-semibold text-ink text-lg mb-2">{f.title}</div>
                  <p className="text-stone font-light text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT — ML PIPELINE ══ */}
      <section id="about" className="bg-paper py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">About Echo · Data Science Pipeline</p>
          <h2 className="font-display font-bold text-ink mb-4" style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.15 }}>
            Six stages from raw text<br />to <span className="text-sage">institutional insight.</span>
          </h2>
          <p className="text-stone font-light text-sm leading-relaxed mb-14 max-w-xl">
            Every submission travels through a fully local Python pipeline. No cloud API, no external NLP service.
            Runs on the institution's own machine.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-16">
            {PIPELINE.map((p, i) => (
              <motion.div key={p.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.55 }}
                className="rounded-2xl p-6 bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <div className="font-mono text-[10px] font-bold mb-3" style={{ color: "#e8580a", letterSpacing: "0.12em" }}>
                  STAGE {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display font-bold text-ink text-xl mb-1">{p.label}</div>
                <div className="font-mono text-xs mb-3 px-2 py-1 rounded-full inline-block"
                  style={{ background: "rgba(232,88,10,0.1)", color: "#e8580a" }}>
                  {p.tech}
                </div>
                <p className="text-stone font-light text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Privacy sub-section */}
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Privacy Architecture</p>
          <h3 className="font-display font-bold text-ink mb-10" style={{ fontSize: "clamp(22px,3vw,36px)", lineHeight: 1.2 }}>
            Anonymous isn't a setting. <span className="text-sage">It's the structure.</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {PRIVACY.map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-6 bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <h4 className="font-display font-semibold text-ink text-base mb-2">{item.title}</h4>
                <p className="text-stone font-light text-sm leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRACK ══ */}
      <section id="track" className="bg-warm py-24 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Submission Tracker</p>
            <h2 className="font-display font-bold text-ink mb-4" style={{ fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.15 }}>
              Know your suggestion <span className="text-sage">made it.</span>
            </h2>
            <p className="text-stone font-light text-sm leading-relaxed mb-8">
              Every submission returns an anonymous UUID4 token. Use it here to see the category your suggestion was assigned to,
              the TextBlob sentiment score, and which K-Means cluster it joined — without ever identifying you.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { step: "01", text: "Enter the token you received after submitting." },
                { step: "02", text: "We look up the submission by token — no login, no name." },
                { step: "03", text: "See category, sentiment, cluster — never individual identity." },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-sage/10 flex items-center justify-center text-sage text-[10px] font-bold shrink-0 mt-0.5">
                    {step}
                  </div>
                  <p className="text-stone font-light text-sm leading-relaxed pt-1">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/submit" className="inline-flex items-center bg-sage hover:bg-sage2 text-white font-semibold rounded-full px-6 py-3 text-sm transition-colors">
              Submit Anonymously →
            </Link>
          </div>

          {/* Right — live track widget */}
          <div>
            <form onSubmit={handleTrack} className="mb-4">
              <label className="block font-sans font-medium text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#8c897f" }}>
                Your Anonymous Token
              </label>
              <div className="flex gap-2">
                <input
                  value={trackToken}
                  onChange={(e) => { setTrackToken(e.target.value); setResult(null); setTE(""); }}
                  placeholder="Paste your UUID4 token here…"
                  className="flex-1 border text-sm px-4 py-3 rounded-xl outline-none transition-colors font-mono"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.12)",
                    color: "#111210",
                  }}
                />
                <button
                  type="submit"
                  disabled={trackLoading || !trackToken.trim()}
                  className="bg-sage hover:bg-sage2 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors shrink-0"
                >
                  {trackLoading ? "…" : "Track →"}
                </button>
              </div>
              {trackError && (
                <p className="mt-2 text-sm font-light" style={{ color: "#dc2626" }}>{trackError}</p>
              )}
            </form>

            <AnimatePresence mode="wait">
              {trackResult && sc ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  {/* Header band */}
                  <div className="px-5 py-3 flex items-center gap-2"
                    style={{ background: sc.bg, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: sc.color }} />
                    <span className="font-sans font-semibold text-sm" style={{ color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="font-mono text-xs ml-auto" style={{ color: sc.color }}>
                      {trackResult.sentiment_score > 0 ? "+" : ""}{trackResult.sentiment_score.toFixed(3)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-white px-5 py-4 space-y-3">
                    {[
                      { label: "Category",  value: trackResult.category },
                      { label: "Location",  value: trackResult.location },
                      { label: "Submitted", value: trackResult.submitted },
                      { label: "Week",      value: `Week ${trackResult.week_num}` },
                      { label: "Cluster",   value: trackResult.cluster_id >= 0 ? `Cluster ${trackResult.cluster_id}` : "Pending clustering" },
                      { label: "Priority",  value: trackResult.priority_score.toFixed(4) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-1.5"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <span className="font-sans text-xs" style={{ color: "#8c897f" }}>{label}</span>
                        <span className="font-sans font-medium text-xs" style={{ color: "#111210" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="bg-warm px-5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans text-xs" style={{ color: "#8c897f" }}>NLP Status</span>
                      <span className="font-sans font-medium text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: trackResult.processed ? "rgba(232,88,10,0.1)" : "rgba(140,137,127,0.1)",
                          color: trackResult.processed ? "#e8580a" : "#8c897f",
                        }}>
                        {trackResult.processed ? "✓ Processed" : "⟳ Pending"}
                      </span>
                    </div>
                    <p className="font-sans font-light" style={{ fontSize: 10, color: "#8c897f" }}>
                      Priority score = 0.4 × recency + 0.2 × |sentiment|
                    </p>
                  </div>
                </motion.div>
              ) : !trackResult && !trackLoading ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl"
                  style={{ border: "1px dashed rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.015)" }}
                >
                  <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <div className="h-3 w-20 rounded" style={{ background: "rgba(0,0,0,0.06)" }} />
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {["Category", "Location", "Submitted", "Week", "Cluster", "Priority"].map((l) => (
                      <div key={l} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <span className="font-sans text-xs" style={{ color: "rgba(140,137,127,0.5)" }}>{l}</span>
                        <div className="h-3 w-24 rounded" style={{ background: "rgba(0,0,0,0.05)" }} />
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3" style={{ background: "rgba(0,0,0,0.02)" }}>
                    <p className="font-sans font-light text-center text-xs" style={{ color: "rgba(140,137,127,0.6)" }}>
                      Enter your token above to see results
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ══ */}
      <section className="bg-white py-28 px-8">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-serif italic text-ink text-5xl mb-8 select-none">✦</p>
          <h2 className="font-display font-bold text-ink mb-5" style={{ fontSize: "clamp(26px,4vw,44px)", lineHeight: 1.15 }}>
            Every campus has a <span className="text-sage">gap.</span>
          </h2>
          <p className="text-stone font-light text-sm leading-relaxed mb-10">
            Echo lives in that gap. One anonymous suggestion means nothing. A hundred of them,
            mapped by location and time, become impossible to ignore. Silence into signal. Signal into change.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/submit"
              className="inline-flex items-center bg-sage hover:bg-sage2 text-white font-semibold rounded-full px-8 py-4 text-sm transition-colors duration-200">
              Submit Your First Suggestion →
            </Link>
            <a href="#about"
              className="inline-flex items-center border border-black/15 hover:border-sage text-stone hover:text-sage font-medium rounded-full px-8 py-4 text-sm transition-colors duration-200">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-white border-t border-black/[0.08] px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <span className="font-serif italic text-ink text-xl"><span className="text-sage2">Ec</span>ho</span>
          <div className="flex gap-6">
            <Link href="/submit"    className="text-stone hover:text-ink text-xs transition-colors">Submit</Link>
            <a    href="#track"     className="text-stone hover:text-ink text-xs transition-colors">Track</a>
            <a    href="#about"     className="text-stone hover:text-ink text-xs transition-colors">About</a>
            <Link href="/admin/login" className="text-stone hover:text-ink text-xs transition-colors">Admin</Link>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone/60">Python · FastAPI · Next.js</span>
        </div>
      </footer>
    </div>
  );
}
