"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Point {
  x: number;
  y: number;
  cluster: number;
  cluster_label: string;
  category: string;
  text: string;
}

interface Props {
  data: Point[];
  clusterLabels: Record<string, string>;
}

const CLUSTER_COLORS = [
  "#e8580a", "#f97316", "#fff1e6", "#8c897f", "#2a5a3a", "#a0c8a0",
];

export default function ClusterScatter({ data, clusterLabels }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-stone text-sm">
        Not enough data for clustering (need at least 6 submissions).
      </div>
    );
  }

  const clusters: Record<number, Point[]> = {};
  for (const p of data) {
    if (!clusters[p.cluster]) clusters[p.cluster] = [];
    clusters[p.cluster].push(p);
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload as Point;
      return (
        <div className="bg-ink2 border border-[#2a2c28] rounded-lg p-3 max-w-[220px]">
          <div className="text-[9px] uppercase tracking-widest text-sage2 mb-1">{d.category}</div>
          <p className="text-[11px] text-white leading-relaxed">{d.text}…</p>
          <div className="text-[9px] text-stone mt-1.5">Cluster: {clusterLabels[String(d.cluster)] ?? d.cluster}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2c28" />
        <XAxis type="number" dataKey="x" tick={{ fill: "#8c897f", fontSize: 10 }} axisLine={false} tickLine={false} name="PC1" />
        <YAxis type="number" dataKey="y" tick={{ fill: "#8c897f", fontSize: 10 }} axisLine={false} tickLine={false} name="PC2" />
        <ZAxis range={[28, 28]} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#e8580a" }} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#8c897f", fontSize: 10 }}>
              {clusterLabels[value] ? `C${value}: ${clusterLabels[value]}` : `Cluster ${value}`}
            </span>
          )}
        />
        {Object.entries(clusters).map(([cId, points]) => (
          <Scatter
            key={cId}
            name={cId}
            data={points}
            fill={CLUSTER_COLORS[Number(cId) % CLUSTER_COLORS.length]}
            fillOpacity={0.8}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
