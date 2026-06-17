"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSubmissions, getAdminMe, getCategories, getLocations, type SubmissionsData } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";

const SENT_STYLE: Record<string, { bg: string; text: string }> = {
  positive: { bg: "#fff1e6", text: "#9a3412" },
  neutral:  { bg: "#e8e4db", text: "#5a5c58" },
  negative: { bg: "#fee2e2", text: "#9b1c1c" },
  pending:  { bg: "#e8e4db", text: "#8c897f" },
};

const PAGE_SIZE = 50;

export default function SubmissionsPage() {
  const router = useRouter();
  const [data, setData]           = useState<SubmissionsData | null>(null);
  const [institution, setIns]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [offset, setOffset]       = useState(0);
  const [categoryOpts, setCatOpts] = useState<string[]>([]);
  const [locationOpts, setLocOpts] = useState<string[]>([]);

  // Filters
  const [catFilter, setCat]       = useState("");
  const [locFilter, setLoc]       = useState("");
  const [sentFilter, setSent]     = useState("");

  // Expanded row
  const [expanded, setExpanded]   = useState<string | null>(null);

  const loadData = useCallback((off: number) => {
    setLoading(true);
    getSubmissions({
      limit: PAGE_SIZE,
      offset: off,
      category: catFilter || undefined,
      location: locFilter || undefined,
      sentiment: sentFilter || undefined,
    })
      .then(setData)
      .catch((err) => { if (err.message === "UNAUTHORIZED") router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [catFilter, locFilter, sentFilter, router]);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getAdminMe(), getCategories(), getLocations()]).then(([me, cats, locs]) => {
      setIns(me.institution);
      setCatOpts(cats.map((c) => c.name));
      setLocOpts(locs.map((l) => l.name));
    });
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    setOffset(0);
    loadData(0);
  }, [catFilter, locFilter, sentFilter, loadData]);

  function changePage(newOffset: number) {
    setOffset(newOffset);
    loadData(newOffset);
  }

  const selectCls =
    "border rounded-xl px-3 py-2 text-sm outline-none transition-colors bg-white border-[rgba(0,0,0,0.1)] text-[#111210] focus:border-sage/50 appearance-none";

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <>
      <AdminSidebar institution={institution} />

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#fafaf8", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div className="font-sans font-medium uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>
              Anonymized Submissions
            </div>
            <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
              Submissions <span style={{ color: "#e8580a" }}>Browser</span>
            </h1>
          </div>
          {data && (
            <div className="font-sans font-light text-sm" style={{ color: "#8c897f" }}>
              {total.toLocaleString()} total records
            </div>
          )}
        </div>

        <div className="px-8 py-4 flex flex-wrap gap-3 items-center" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          <select value={catFilter} onChange={(e) => setCat(e.target.value)} className={selectCls}>
            <option value="">All Categories</option>
            {categoryOpts.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={locFilter} onChange={(e) => setLoc(e.target.value)} className={selectCls}>
            <option value="">All Locations</option>
            {locationOpts.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={sentFilter} onChange={(e) => setSent(e.target.value)} className={selectCls}>
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          {(catFilter || locFilter || sentFilter) && (
            <button
              onClick={() => { setCat(""); setLoc(""); setSent(""); }}
              className="text-sm font-light transition-colors hover:text-ink"
              style={{ color: "#8c897f" }}
            >
              Clear filters ✕
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-8 py-5"
        >
          {loading ? (
            <div className="text-center py-16">
              <p className="font-sans font-light text-sm" style={{ color: "#8c897f" }}>Loading submissions…</p>
            </div>
          ) : data && data.submissions.length > 0 ? (
            <>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                {/* Table header */}
                <div className="grid px-4 py-3" style={{
                  gridTemplateColumns: "90px 110px 140px 90px 80px 90px 1fr",
                  background: "#f7f5ef",
                  borderBottom: "1px solid rgba(0,0,0,0.07)",
                }}>
                  {["Date", "Category", "Location", "Sentiment", "Priority", "Cluster", "Preview"].map((h) => (
                    <div key={h} className="font-sans font-medium uppercase" style={{ fontSize: 9, letterSpacing: "0.18em", color: "#8c897f" }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {data.submissions.map((s) => {
                  const sStyle = SENT_STYLE[s.sentiment_label] ?? SENT_STYLE.pending;
                  const isOpen = expanded === s.token;
                  return (
                    <div key={s.token}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : s.token)}
                        className="grid w-full px-4 py-3 text-left transition-colors hover:bg-warm/50"
                        style={{
                          gridTemplateColumns: "90px 110px 140px 90px 80px 90px 1fr",
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          background: isOpen ? "#faf9f5" : undefined,
                        }}
                      >
                        <div className="font-mono text-xs" style={{ color: "#8c897f" }}>{s.created_at}</div>
                        <div className="font-sans text-sm" style={{ color: "#111210" }}>{s.category}</div>
                        <div className="font-sans text-sm truncate pr-2" style={{ color: "#5a5c58" }}>{s.location}</div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sans font-medium"
                            style={{ fontSize: 10, background: sStyle.bg, color: sStyle.text }}>
                            {s.sentiment_label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: "#e8e4db" }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.round(s.priority_score * 100)}%`, background: "#e8580a" }} />
                          </div>
                          <span className="font-mono text-[10px]" style={{ color: "#8c897f" }}>{s.priority_score.toFixed(2)}</span>
                        </div>
                        <div className="font-mono text-xs" style={{ color: "#8c897f" }}>
                          {s.cluster_id >= 0 ? `C-${s.cluster_id}` : "—"}
                        </div>
                        <div className="font-sans font-light text-sm truncate pr-4" style={{ color: "#5a5c58" }}>
                          {s.text_preview}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 py-4 border-b" style={{ background: "#faf9f5", borderColor: "rgba(0,0,0,0.05)" }}>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full font-sans text-xs"
                              style={{ background: "#fff7ed", color: "#9a3412" }}>Category: {s.category}</span>
                            <span className="px-2.5 py-1 rounded-full font-sans text-xs"
                              style={{ background: "#f0ede7", color: "#5a5c58" }}>Location: {s.location}</span>
                            <span className="px-2.5 py-1 rounded-full font-sans text-xs"
                              style={{ background: sStyle.bg, color: sStyle.text }}>
                              Sentiment: {s.sentiment_score > 0 ? "+" : ""}{s.sentiment_score.toFixed(3)}
                            </span>
                            {s.cluster_id >= 0 && (
                              <span className="px-2.5 py-1 rounded-full font-sans text-xs"
                                style={{ background: "#f0ede7", color: "#5a5c58" }}>Cluster {s.cluster_id}</span>
                            )}
                            <span className="px-2.5 py-1 rounded-full font-sans text-xs"
                              style={{ background: s.processed ? "#fff7ed" : "#fee2e2", color: s.processed ? "#9a3412" : "#9b1c1c" }}>
                              {s.processed ? "NLP Processed" : "Pending NLP"}
                            </span>
                          </div>
                          <p className="font-sans font-light text-sm leading-relaxed italic"
                            style={{ color: "#5a5c58", background: "#f7f5ef", borderLeft: "3px solid #fff1e6",
                              padding: "12px 16px", borderRadius: "0 8px 8px 0" }}>
                            "{s.text_preview}"
                          </p>
                          <p className="font-mono text-[10px] mt-2" style={{ color: "#8c897f" }}>
                            Token prefix: {s.token} · Priority score: {s.priority_score}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="font-sans font-light text-sm" style={{ color: "#8c897f" }}>
                  Page {currentPage} of {totalPages} · {total} submissions
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={offset === 0}
                    onClick={() => changePage(Math.max(0, offset - PAGE_SIZE))}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", color: "#111210" }}
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={offset + PAGE_SIZE >= total}
                    onClick={() => changePage(offset + PAGE_SIZE)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", color: "#111210" }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="font-display font-bold text-xl mb-2" style={{ color: "#111210" }}>No submissions yet</p>
              <p className="font-sans font-light text-sm" style={{ color: "#8c897f" }}>
                {catFilter || locFilter || sentFilter ? "Try clearing the filters." : "Students haven't submitted anything yet."}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
