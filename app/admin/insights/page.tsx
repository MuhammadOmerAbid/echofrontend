"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getInsights, getAdminMe, type InsightsData } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";
import AnomalyBanner from "@/components/features/AnomalyBanner";
import PriorityCard from "@/components/features/PriorityCard";
import SentimentDelta from "@/components/features/SentimentDelta";
import ClusterScatter from "@/components/charts/ClusterScatter";

export default function InsightsPage() {
  const router = useRouter();
  const [data, setData]       = useState<InsightsData | null>(null);
  const [institution, setIns] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getInsights(), getAdminMe()])
      .then(([ins, me]) => { setData(ins); setIns(me.institution); })
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

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#ffffff", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        {/* Top bar */}
        <div
          className="flex items-start justify-between px-8 py-5"
          style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <div
              className="font-sans font-medium uppercase mb-1"
              style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}
            >
              ML Insights
            </div>
            <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
              Pattern <span style={{ color: "#e8580a" }}>Analysis</span>
            </h1>
            <p className="font-sans font-light mt-1" style={{ fontSize: 12, color: "#8c897f" }}>
              K-Means clustering · TF-IDF keywords · Priority scoring · Sentiment trends
            </p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {data.active_anomaly && <AnomalyBanner week={data.active_anomaly} />}

              {/* Top priorities */}
              {data.top_priorities.length > 0 && (
                <Card title="Top Priority Issues">
                  <div className="space-y-3">
                    {data.top_priorities.map((p, i) => (
                      <PriorityCard key={i} item={p} rank={i + 1} />
                    ))}
                  </div>
                </Card>
              )}

              {/* Cluster scatter */}
              <Card title="Topic Clusters — K-Means + PCA Projection">
                <p className="font-sans font-light mb-4" style={{ fontSize: 12, color: "#8c897f", lineHeight: 1.6 }}>
                  Each dot is one suggestion. Colours indicate thematic clusters discovered automatically — no labels were provided.
                </p>
                <ClusterScatter data={data.scatter} clusterLabels={data.cluster_labels} />
                {Object.keys(data.cluster_labels).length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {Object.entries(data.cluster_labels).map(([id, label]) => (
                      <div
                        key={id}
                        className="font-sans font-light px-3 py-2 rounded-xl"
                        style={{ fontSize: 11, color: "#6a6a65", background: "#f0ede7" }}
                      >
                        <span style={{ color: "#e8580a", fontWeight: 500 }}>Cluster {id}:</span> {label}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Sentiment delta */}
              {Object.keys(data.sentiment_delta).length > 0 && (
                <Card title="Sentiment Shift — This Week vs Last Week">
                  <SentimentDelta data={data.sentiment_delta} />
                </Card>
              )}

              {/* Summary metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Processed"  value={data.total} accent />
                <MetricCard label="Top Category"     value={data.top_category} />
                <MetricCard label="Hottest Location" value={data.top_location} />
                <MetricCard label="Clusters Found"   value={Object.keys(data.cluster_labels).length} />
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
