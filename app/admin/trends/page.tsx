"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getTrends, getAdminMe, type TrendsData } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";

const CAT_COLORS: Record<string, string> = {
  Facilities: "#e8580a", Academic: "#f97316", "Campus Life": "#fb923c", Open: "#c2410c",
};

function MomentumBadge({ value }: { value: TrendsData["momentum"] }) {
  const cfg = {
    growing:  { label: "Growing",  bg: "#fff1e6", text: "#9a3412", icon: "↑" },
    stable:   { label: "Stable",   bg: "#e8e4db", text: "#5a5c58", icon: "→" },
    declining:{ label: "Declining",bg: "#fee2e2", text: "#9b1c1c", icon: "↓" },
  }[value];
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans font-semibold text-xs"
      style={{ background: cfg.bg, color: cfg.text }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.06)",
      borderLeft: `3px solid ${highlight ? "#e8580a" : "#fff1e6"}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div className="font-sans font-medium uppercase mb-2" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>
        {label}
      </div>
      <div className="font-display font-bold mb-0.5" style={{ fontSize: 26, lineHeight: 1, color: "#111210" }}>
        {value}
      </div>
      {sub && <div className="font-sans font-light" style={{ fontSize: 11, color: "#8c897f" }}>{sub}</div>}
    </div>
  );
}

export default function TrendsPage() {
  const router = useRouter();
  const [data, setData]       = useState<TrendsData | null>(null);
  const [institution, setIns] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getTrends(), getAdminMe()])
      .then(([t, me]) => { setData(t); setIns(me.institution); })
      .catch((err) => { if (err.message === "UNAUTHORIZED") router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <AdminPageSkeleton />
    );
  }

  const volumeChartData = data
    ? [...data.weekly_volume, ...data.forecast.map((f) => ({ week: f.week, count: null, forecast: f.count }))]
    : [];

  const historicalWithNull = data?.weekly_volume.map((w) => ({ ...w, forecast: null })) ?? [];
  const forecastRows = data?.forecast.map((f) => ({
    week: f.week,
    count: null,
    forecast: f.count,
  })) ?? [];
  const combinedVolume = [...historicalWithNull, ...forecastRows];

  const momentumEntries = data
    ? Object.entries(data.category_momentum).sort(([, a], [, b]) => b - a)
    : [];
  const momentumChartData = momentumEntries.map(([cat, pct]) => ({ category: cat, change: pct }));

  return (
    <>
      <AdminSidebar institution={institution} />

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#ffffff", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        <div className="flex items-start justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div className="font-sans font-medium uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>
              Trend Analysis
            </div>
            <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
              Volume <span style={{ color: "#e8580a" }}>Forecasting</span>
            </h1>
            <p className="font-sans font-light mt-1" style={{ fontSize: 12, color: "#8c897f" }}>
              Linear regression model · week-over-week · category momentum · sentiment drift
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
            {/* Model stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 flex flex-col gap-2" style={{
                background: "#fff", border: "1px solid rgba(0,0,0,0.06)",
                borderLeft: "3px solid #e8580a", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div className="font-sans font-medium uppercase" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>Momentum</div>
                <MomentumBadge value={data.momentum} />
              </div>
              <StatCard
                label="Week-over-Week"
                value={`${data.wow_change > 0 ? "+" : ""}${data.wow_change}%`}
                sub="current vs previous week"
                highlight={data.wow_change > 0}
              />
              <StatCard
                label="Regression Slope"
                value={data.slope}
                sub="submissions/week change rate"
                highlight={data.slope > 0}
              />
              <StatCard
                label="Model R²"
                value={data.r_squared}
                sub={data.r_squared > 0.7 ? "Strong fit" : data.r_squared > 0.4 ? "Moderate fit" : "Weak fit — few weeks of data"}
              />
            </div>

            {/* Volume trend + forecast */}
            <Card title="Weekly Volume — Historical + 4-Week Linear Forecast">
              <p className="font-sans font-light mb-4" style={{ fontSize: 12, color: "#8c897f", lineHeight: 1.6 }}>
                Solid line = observed data. Dashed line = linear regression forecast (y = slope × week + intercept).
                Forecast accuracy improves with more historical weeks.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={combinedVolume} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="count" stroke="#e8580a" strokeWidth={2.5}
                    dot={{ r: 3, fill: "#e8580a" }} connectNulls={false} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={2}
                    strokeDasharray="6 3" dot={{ r: 3, fill: "#f97316", strokeDasharray: "0" }}
                    connectNulls name="Forecast" />
                  <ReferenceLine x={data.weekly_volume[data.weekly_volume.length - 1]?.week}
                    stroke="#fff1e6" strokeDasharray="3 3" label={{ value: "Now", fontSize: 10, fill: "#8c897f" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Category momentum + sentiment trend */}
            <div className="grid lg:grid-cols-2 gap-5">
              <Card title="Category Momentum — Last 4 vs Previous 4 Weeks">
                <p className="font-sans font-light mb-3" style={{ fontSize: 12, color: "#8c897f" }}>
                  Percentage change in submission volume per category.
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={momentumChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }}
                      tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#111210", fontWeight: 600 }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}%`, "Change"]}
                      contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }}
                    />
                    <ReferenceLine x={0} stroke="#8c897f" />
                    <Bar dataKey="change" radius={[0, 4, 4, 0]}
                      fill="#e8580a" label={false}
                      isAnimationActive animationDuration={700} animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Sentiment Trend — Weekly Average">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.sentiment_trend} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: "#3a3a38", fontWeight: 500 }} tickFormatter={(v) => v.toFixed(1)} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [(v > 0 ? "+" : "") + v.toFixed(3), "Avg Sentiment"]} />
                    <ReferenceLine y={0} stroke="#fff1e6" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="avg_sentiment" stroke="#e8580a" strokeWidth={2}
                      dot={{ r: 3 }} name="Weekly Mean" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Stacked category by week */}
            {data.cat_weekly.length > 0 && (
              <Card title="Category Mix by Week — Stacked Area">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.cat_weekly} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e4db" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#8c897f" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#8c897f" }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e8e4db", borderRadius: 8, fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {data.categories.map((cat) => (
                      <Area key={cat} type="monotone" dataKey={cat} stackId="a"
                        stroke={CAT_COLORS[cat] ?? "#e8580a"}
                        fill={CAT_COLORS[cat] ?? "#e8580a"}
                        fillOpacity={0.75}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Statistical summary */}
            <Card title="Statistical Model Summary">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-sm" style={{ color: "#111210" }}>Regression Parameters</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Algorithm", value: "Ordinary Least Squares (OLS)" },
                      { label: "Feature", value: "Week index (integer)" },
                      { label: "Target", value: "Submissions per week" },
                      { label: "Slope β₁", value: `${data.slope} submissions/week` },
                      { label: "R² (goodness of fit)", value: data.r_squared },
                      { label: "Forecast horizon", value: "4 weeks ahead" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-1.5 border-b" style={{ borderColor: "#e8e4db" }}>
                        <span className="font-sans text-xs" style={{ color: "#8c897f" }}>{label}</span>
                        <span className="font-sans font-medium text-xs" style={{ color: "#111210" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-sm" style={{ color: "#111210" }}>Interpretation Guide</h4>
                  <div className="space-y-2.5 font-sans font-light text-sm" style={{ color: "#5a5c58", lineHeight: 1.7 }}>
                    <p><span className="font-medium" style={{ color: "#e8580a" }}>Slope &gt; 0</span> → Platform adoption growing. More students using Echo each week.</p>
                    <p><span className="font-medium" style={{ color: "#8c897f" }}>R² → 1.0</span> → Trend is consistent and predictable. R² near 0 = highly variable.</p>
                    <p><span className="font-medium" style={{ color: "#ef4444" }}>WoW &lt; 0</span> → This week had fewer submissions than last week. Check for events or burnout.</p>
                    <p>Forecast is a linear extrapolation — it assumes the current growth rate continues. Re-check monthly.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </>
  );
}
