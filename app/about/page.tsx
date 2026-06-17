"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const PIPELINE = [
  { n: "01", stage: "Ingest", tech: "FastAPI + Pydantic + bleach", desc: "Student submits text via Next.js form. FastAPI validates with Pydantic, sanitizes with bleach (strips HTML/scripts), checks rate limit (max 3/hour per session), then stores to SQLite with a UUID4 anonymous token." },
  { n: "02", stage: "NLP Processing", tech: "NLTK + TextBlob", desc: "Background task immediately after ingest. NLTK cleans text: lowercase, punctuation strip, tokenize, remove stopwords. TextBlob computes sentiment polarity (−1 to +1) and assigns positive/neutral/negative label." },
  { n: "03", stage: "Keyword Extraction", tech: "TF-IDF (scikit-learn)", desc: "TF-IDF (Term Frequency–Inverse Document Frequency) vectorizes all submissions. Top-5 per-document keywords are extracted, ignoring common words but surfacing domain-specific terms like 'library', 'wifi', 'attendance'." },
  { n: "04", stage: "Topic Clustering", tech: "K-Means + PCA", desc: "K-Means (k=6) clusters TF-IDF vectors into thematic groups. Cluster centers' top terms become auto-labels (e.g. 'library / hours / study'). PCA reduces to 2D for the scatter plot visualization in admin insights." },
  { n: "05", stage: "Anomaly Detection", tech: "SciPy Z-score", desc: "Weekly submission counts are Z-score normalized. Any week more than 2 standard deviations above the rolling mean triggers an anomaly banner in the admin dashboard — signaling a potential campus issue spike." },
  { n: "06", stage: "Priority Scoring", tech: "Custom formula", desc: "Priority = 0.4 × recency + 0.2 × |sentiment|. Recency decays over 30 days. High-sentiment submissions (strongly positive or negative) score higher. Top 3 priority issues surface in the ML Insights panel." },
];

const PRIVACY = [
  {
    title: "Structural anonymity vs. policy anonymity",
    body: "Policy anonymity says 'we promise not to identify you'. Structural anonymity makes identification architecturally impossible. Echo stores no name, no student ID, no email, no login — ever. The anonymous token (UUID4) is generated at random with no link to any person. Even we cannot trace a submission.",
  },
  {
    title: "Rate limiting without tracking",
    body: "To prevent spam, we limit 3 submissions per hour per session. Session IDs are random browser-generated strings, stored only in sessionStorage — they're never sent to a server-side profile, never written to a cookie. When your browser session ends, the ID is gone.",
  },
  {
    title: "No cloud, no external API",
    body: "The entire pipeline runs locally. SQLite on disk. Python on the same machine. No OpenAI API, no cloud NLP service, no analytics tracker. Your institution's data physically cannot leave the premises because there's no outbound connection in the codebase.",
  },
  {
    title: "Admin sees patterns, not people",
    body: "The admin dashboard shows charts and aggregates — category counts, sentiment averages, weekly volumes, topic clusters. Individual entries are only visible in the Submissions Browser, shown as short previews with truncated tokens. The admin cannot identify who wrote what.",
  },
];

const FAQ = [
  { q: "Can the admin see my exact words?", a: "Admins can see submission text previews in the Submissions Browser. However, there is no way to link that text to you — no name, ID, IP address, or login is ever stored. The text is just anonymous text." },
  { q: "What if I submit more than 3 times in an hour?", a: "You'll receive a 429 Too Many Requests error. After 1 hour from your first submission in that session, you can submit again. The limit is per browser session, not per person." },
  { q: "How accurate is the sentiment analysis?", a: "TextBlob sentiment is lexicon-based, achieving roughly 70–80% accuracy on informal text. It scores polarity from −1 (very negative) to +1 (very positive). It's not perfect, but it captures the general tone reliably." },
  { q: "What do the clusters mean?", a: "K-Means groups submissions by word similarity. Cluster labels are auto-generated from the top TF-IDF terms in each cluster center. Similar complaints or requests end up together, helping admins see the big picture without reading everything." },
  { q: "Is my token secret?", a: "Yes — keep your token private. Anyone with your token can look up the category, location, and sentiment of that submission (but not your identity). If you share your token, someone can see those aggregate details." },
  { q: "Can Echo be used for multiple campuses?", a: "Each campus runs its own instance with its own SQLite database. There's no multi-tenant server. To expand to another campus, simply run a fresh installation with that campus's configuration." },
];

export default function AboutPage() {
  return (
    <div className="bg-ink min-h-screen font-sans">
      <Navbar showAdmin />

      {/* Hero */}
      <section className="pt-28 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sage2 font-semibold text-xs tracking-[0.26em] uppercase mb-5">About Echo</p>
            <h1 className="font-display font-bold text-white mb-6" style={{ fontSize: "clamp(36px,6vw,72px)", lineHeight: 1.05 }}>
              Anonymous. <span className="text-sage2">Honest.</span><br />Actionable.
            </h1>
            <p className="text-stone font-light text-base leading-relaxed max-w-2xl mb-8">
              Echo is a campus feedback platform built on the premise that students already know what's wrong — they just have
              nowhere safe to say it. A suggestion box nobody reads. A student council that doesn't reach everyone.
              A town hall where speaking up feels risky. Echo closes that gap.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/submit"
                className="bg-sage hover:bg-sage2 text-white font-semibold rounded-full px-6 py-3 text-sm transition-colors">
                Submit a Suggestion
              </Link>
              <Link href="/track"
                className="border border-leaf/40 hover:border-leaf text-leaf hover:text-white rounded-full px-6 py-3 text-sm font-medium transition-colors">
                Track Your Submission
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-ink2 py-20 px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { title: "The Problem", body: "Student concerns live in WhatsApp groups, anonymous forum posts, and whispered complaints — never reaching the people who can actually fix things. Traditional surveys have low response rates and no structure. Town halls are intimidating. The feedback loop is broken." },
            { title: "The Solution", body: "Echo creates a zero-friction, structurally anonymous submission channel. Students pick a category, pick a location, write their thought, and hit submit. No login, no name, no 30-question survey. The ML pipeline turns a stream of individual voices into actionable institutional intelligence." },
            { title: "The Outcome", body: "Admins see trending issues, sentiment shifts, location hotspots, and topic clusters — not individual entries. Silence becomes signal. Patterns become priorities. One anonymous submission means nothing; a hundred of them, mapped by location and time, become impossible to ignore." },
          ].map((col, i) => (
            <motion.div key={col.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <h3 className="font-display font-bold text-white text-lg mb-3">{col.title}</h3>
              <p className="text-stone font-light text-sm leading-relaxed">{col.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ML Pipeline */}
      <section className="bg-paper py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Data Science Pipeline</p>
          <h2 className="font-display font-bold text-ink mb-4" style={{ fontSize: "clamp(26px,4vw,44px)", lineHeight: 1.15 }}>
            Six stages from raw text to <span className="text-sage">actionable insight.</span>
          </h2>
          <p className="text-stone font-light text-sm leading-relaxed mb-14 max-w-2xl">
            Every submission travels through a fully local Python pipeline. No cloud API calls, no external data processors.
            TextBlob + NLTK for NLP, scikit-learn for ML, SciPy for statistics.
          </p>

          <div className="space-y-0">
            {PIPELINE.map((p, i) => (
              <motion.div key={p.n} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex gap-6 pb-8"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.n}
                  </div>
                  {i < PIPELINE.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: "#fff1e6" }} />}
                </div>
                <div className="pb-2">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h4 className="font-display font-semibold text-ink text-lg">{p.stage}</h4>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#fff7ed", color: "#e8580a" }}>
                      {p.tech}
                    </span>
                  </div>
                  <p className="text-stone font-light text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-warm py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sage text-xs font-semibold tracking-[0.26em] uppercase mb-4">Privacy Architecture</p>
          <h2 className="font-display font-bold text-ink mb-14" style={{ fontSize: "clamp(26px,4vw,44px)", lineHeight: 1.15 }}>
            Anonymous isn't a setting here. <span className="text-sage">It's the structure.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PRIVACY.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55 }}
                className="bg-cream rounded-2xl p-7 border border-leaf/50"
              >
                <h4 className="font-display font-semibold text-ink text-lg mb-3">{item.title}</h4>
                <p className="text-stone font-light text-sm leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="bg-ink2 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sage2 text-xs font-semibold tracking-[0.26em] uppercase mb-4">Technology</p>
          <h2 className="font-display font-bold text-white mb-10" style={{ fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.15 }}>
            Entirely open-source. <span className="text-sage2">Runs on one machine.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
            {[
              ["FastAPI", "Python REST API with Pydantic validation"],
              ["Next.js 14", "React frontend, App Router, TypeScript"],
              ["SQLite", "Lightweight local database, no external server"],
              ["NLTK + TextBlob", "Text cleaning and sentiment analysis"],
              ["scikit-learn", "TF-IDF vectorization, K-Means, PCA"],
              ["SciPy", "Z-score anomaly detection on weekly volumes"],
              ["Recharts", "Interactive charts in the admin dashboard"],
              ["Framer Motion", "Page transitions and micro-animations"],
              ["bcrypt + JWT", "Admin password hashing and session tokens"],
              ["bleach", "Input sanitization against XSS"],
            ].map(([name, desc]) => (
              <div key={name} className="flex gap-3 py-2.5 border-b border-white/[0.04]">
                <span className="font-mono text-sage2 text-sm font-medium w-32 shrink-0">{name}</span>
                <span className="text-stone font-light text-sm">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ink py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sage2 text-xs font-semibold tracking-[0.26em] uppercase mb-4">FAQ</p>
          <h2 className="font-display font-bold text-white mb-12" style={{ fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.15 }}>
            Common questions.
          </h2>
          <div className="space-y-5">
            {FAQ.map((item, i) => (
              <motion.div key={item.q} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="bg-ink2 border border-white/[0.06] rounded-2xl p-6"
              >
                <h4 className="font-display font-semibold text-white text-base mb-2">{item.q}</h4>
                <p className="text-stone font-light text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink border-t border-white/[0.04] px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-serif italic text-white text-xl">
          <span className="text-sage2">Ec</span>ho
        </Link>
        <div className="flex gap-6">
          <Link href="/submit" className="text-stone/40 hover:text-white text-xs transition-colors">Submit</Link>
          <Link href="/track" className="text-stone/40 hover:text-white text-xs transition-colors">Track</Link>
          <Link href="/admin/login" className="text-stone/40 hover:text-white text-xs transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
