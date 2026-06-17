"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getAnalytics, getAdminMe, type AnalyticsData } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";

const CAT_COLORS: Record<string, string> = {
  Facilities:    "#e8580a",
  Academic:      "#f97316",
  "Campus Life": "#fb923c",
  Open:          "#c2410c",
};

function sentColor(s: number) {
  return s > 0.1 ? "#e8580a" : s < -0.1 ? "#ef4444" : "#8c897f";
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [institution, setIns] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getAnalytics(), getAdminMe()])
      .then(([a, me]) => { setData(a); setIns(me.institution); })
      .catch((err) => { if (err.message === "UNAUTHORIZED") router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <AdminPageSkeleton />
    );
  }

  return (
    <>
      <AdminSidebar institution={institution} />

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#fafaf8", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        <div className="flex items-start justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div className="font-sans font-medium uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>
              Deep Analytics
            </div>
            <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
              Submission <span style={{ color: "#e8580a" }}>Patterns</span>
            </h1>
            <p className="font-sans font-light mt-1" style={{ fontSize: 12, color: "#8c897f" }}>
              Day-of-week distribution · text statistics · category evolution · location ranking
            </p>
          </div>
        </div>

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-8 py-6 space-y-5"
          >
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Avg Text Length"    value={`${data.avg_text_length} chars`} accent />
              <MetricCard label="Avg Word Count"     value={`${data.avg_word_count} words`} />
              <MetricCard label="Locations Active"   value={data.unique_locations} />
              <MetricCard label="NLP Processed"      value={`${data.processed_rate}%`} accent />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Words Submitted" value={data.total_words.toLocaleString()} />
              <MetricCard label="Median Sentiment"      value={(data.median_sentiment > 0 ? "+" : "") + data.median_sentiment} />
              <MetricCard label="Sentiment Std Dev"     value={data.std_sentiment} />
              <MetricCard label="Median Char Length"    value={data.median_text_length} />
            </div>

            {/* Day of week + text length */}
            <div className="grid lg:grid-cols-2 gap-5">
              <Card title="Submissions by Day of Week">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.day_of_week} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }}
                      tickFormatter={(v) => v.slice(0, 3)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#e8580a" radius={[4, 4, 0, 0]} name="Submissions"
                      isAnimationActive animationDuration={700} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Text Length Distribution">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.text_length_dist} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Submissions"
                      isAnimationActive animationDuration={700} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="font-sans font-light mt-2" style={{ fontSize: 11, color: "#8c897f" }}>
                  Character count per submission (0–1000 max). Most students write 101–250 chars.
                </p>
              </Card>
            </div>

            {/* Category evolution */}
            {data.category_evolution.length > 0 && (
              <Card title="Category Volume Over Time — Last 8 Weeks">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.category_evolution} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {data.categories.map((cat) => (
                      <Area
                        key={cat}
                        type="monotone"
                        dataKey={cat}
                        stackId="1"
                        stroke={CAT_COLORS[cat] ?? "#e8580a"}
                        fill={CAT_COLORS[cat] ?? "#e8580a"}
                        fillOpacity={0.7}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Sentiment evolution + location ranking */}
            <div className="grid lg:grid-cols-2 gap-5">
              {data.sentiment_evolution.length > 0 && (
                <Card title="Sentiment Evolution — Mean ± σ">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.sentiment_evolution} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4db" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} tickFormatter={(v) => v.toFixed(1)} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(232,88,10,0.10)" fillOpacity={1} name="Upper σ" />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" fillOpacity={1} name="Lower σ" />
                      <Line type="monotone" dataKey="mean" stroke="#e8580a" strokeWidth={2.5} dot={{ r: 3.5, fill: "#e8580a", stroke: "#fff", strokeWidth: 1.5 }} name="Mean Sentiment"
                        isAnimationActive animationDuration={800} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="font-sans font-light mt-2" style={{ fontSize: 11, color: "#8c897f" }}>
                    Shaded band shows ±1 standard deviation around weekly mean. Wider = more polarised opinions.
                  </p>
                </Card>
              )}

              <Card title="Location Ranking">
                <div className="space-y-2 mt-1">
                  {data.location_ranking.slice(0, 8).map((loc, i) => {
                    const maxCount = data.location_ranking[0]?.count || 1;
                    const pct = Math.round((loc.count / maxCount) * 100);
                    return (
                      <div key={loc.location}>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px]" style={{ color: "#8c897f", minWidth: 16 }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="font-sans text-sm" style={{ color: "#111210" }}>{loc.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-xs font-medium" style={{ color: sentColor(loc.avg_sentiment) }}>
                              {loc.avg_sentiment > 0 ? "+" : ""}{loc.avg_sentiment.toFixed(2)}
                            </span>
                            <span className="font-display font-bold text-sm" style={{ color: "#111210", minWidth: 24, textAlign: "right" }}>
                              {loc.count}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8e4db" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#e8580a" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="font-sans font-light mt-3" style={{ fontSize: 11, color: "#8c897f" }}>
                  Count = total submissions from that location. Sentiment score shows avg polarity (+1 most positive).
                </p>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}
