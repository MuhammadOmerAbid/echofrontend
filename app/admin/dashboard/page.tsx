"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getDashboard, getAdminMe, type DashboardData } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";
import AnomalyBanner from "@/components/features/AnomalyBanner";
import CategoryBar from "@/components/charts/CategoryBar";
import TrendLine from "@/components/charts/TrendLine";
import SentimentPie from "@/components/charts/SentimentPie";
import LocationHeatmap from "@/components/charts/LocationHeatmap";
import WordCloudImg from "@/components/charts/WordCloudImg";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [institution, setIns] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getDashboard(), getAdminMe()])
      .then(([dash, me]) => { setData(dash); setIns(me.institution); })
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") router.replace("/admin/login");
        else setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <AdminPageSkeleton />
    );
  }

  const sentLabel =
    data && data.avg_sentiment > 0.1 ? "Mostly positive"
    : data && data.avg_sentiment < -0.1 ? "Needs attention"
    : "Neutral overall";

  return (
    <>
      <AdminSidebar institution={institution} />

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#ffffff", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <div
              className="font-sans font-medium uppercase mb-1"
              style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}
            >
              Admin Dashboard
            </div>
            <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
              {institution || "Echo"}{" "}
              <span style={{ color: "#e8580a" }}>Overview</span>
            </h1>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              {error}
            </div>
          )}

          {data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {data.active_anomaly && <AnomalyBanner week={data.active_anomaly} />}

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Submissions" value={data.total} accent />
                <MetricCard
                  label="Avg Sentiment"
                  value={(data.avg_sentiment > 0 ? "+" : "") + data.avg_sentiment}
                  sub={sentLabel}
                  accent
                />
                <MetricCard label="Top Category" value={data.top_category} />
                <MetricCard label="Top Location"  value={data.top_location} />
              </div>

              {/* Charts row 1 */}
              <div className="grid lg:grid-cols-2 gap-5">
                <Card title="Submissions by Category">
                  <CategoryBar data={data.category_counts} />
                </Card>
                <Card title="Weekly Volume Trend">
                  <TrendLine data={data.weekly_trend} anomalyWeeks={data.anomaly_weeks} />
                </Card>
              </div>

              {/* Charts row 2 */}
              <div className="grid lg:grid-cols-2 gap-5">
                <Card title="Sentiment Distribution">
                  <SentimentPie data={data.sentiment_counts} />
                </Card>
                <Card title="Campus Location Heatmap">
                  <LocationHeatmap data={data.heatmap} />
                </Card>
              </div>

              {/* Word cloud */}
              <Card title="Top Keywords This Period">
                <WordCloudImg />
              </Card>

              {/* Sentiment by category */}
              {Object.keys(data.avg_sentiment_by_category).length > 0 && (
                <Card title="Average Sentiment by Category">
                  <div className="space-y-4">
                    {Object.entries(data.avg_sentiment_by_category).map(([cat, score], i) => {
                      const pct = Math.min(100, Math.max(0, ((score + 1) / 2) * 100));
                      const color = score > 0.1 ? "#e8580a" : score < -0.1 ? "#dc2626" : "#8c897f";
                      return (
                        <motion.div
                          key={cat}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.07 }}
                        >
                          <div className="flex justify-between mb-1.5">
                            <span className="font-sans font-light text-sm" style={{ color: "#111210" }}>{cat}</span>
                            <span className="font-sans font-medium text-xs" style={{ color }}>
                              {score > 0 ? "+" : ""}{score.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8e4db" }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: i * 0.07 + 0.2, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
