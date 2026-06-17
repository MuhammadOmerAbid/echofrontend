"use client";

import { motion } from "framer-motion";

const BARS = [
  { label: "Facilities", pct: 84, v: 34 },
  { label: "Academic",   pct: 66, v: 27 },
  { label: "Campus",     pct: 52, v: 21 },
  { label: "Open",       pct: 38, v: 15 },
];

export default function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(232,88,10,0.2) 0%, transparent 70%)",
          filter: "blur(32px)",
          transform: "scale(1.2)",
        }}
      />

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ rotate: "-2deg" }}
      >
        <div
          className="rounded-2xl overflow-hidden w-[400px]"
          style={{
            background: "#13150f",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,88,10,0.06)",
          }}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2c28]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2c28]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2c28]" />
            </div>
            <span className="font-serif italic text-white/60 text-xs">Echo Admin</span>
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-sage2 inline-block"
              />
              <span className="text-[10px] text-stone/60">Live</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 3 metric pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total",    value: "97"  },
                { label: "Positive", value: "68%" },
                { label: "↑ Week",   value: "+14%"},
              ].map((m) => (
                <div key={m.label} className="bg-black/30 rounded-xl p-2.5 text-center">
                  <div className="text-white text-sm font-semibold">{m.value}</div>
                  <div className="text-stone/50 text-[9px] mt-0.5 font-light">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-stone/40 mb-2.5 font-medium">
                Submissions by Category
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {BARS.map((b) => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-sage rounded-t-sm" style={{ height: `${b.pct}%` }} />
                    <span className="text-[7px] text-stone/40">{b.label.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two suggestion previews */}
            <div className="space-y-2">
              {[
                { cat: "Facilities", text: "Library should stay open until 10 pm during exam period..." },
                { cat: "Academic",   text: "Course outlines must be shared before enrollment starts..." },
              ].map((c) => (
                <div key={c.cat} className="bg-black/20 rounded-lg px-3 py-2 border-l-2 border-sage">
                  <div className="text-sage2 text-[8px] uppercase tracking-[0.16em] font-medium mb-0.5">{c.cat}</div>
                  <p className="text-stone/50 text-[10px] font-light leading-relaxed line-clamp-1">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-white/[0.05]">
              <span className="text-[9px] text-stone/30 font-light">97 anonymous submissions</span>
              <span className="text-[9px] text-sage2 font-medium">↑ 14% this week</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
