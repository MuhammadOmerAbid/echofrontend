"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { label: string; count: number }[];
  anomalyWeeks: string[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const isAnomaly = payload[0]?.payload?._anomaly;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${isAnomaly ? "rgba(249,115,22,0.35)" : "rgba(0,0,0,0.08)"}`,
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
    }}>
      <p style={{ fontSize: 11, color: "#8c897f", marginBottom: 3 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isAnomaly && <span style={{ fontSize: 13 }}>⚠</span>}
        <p style={{ fontSize: 15, fontWeight: 700, color: isAnomaly ? "#f97316" : "#e8580a" }}>
          {payload[0].value} <span style={{ fontSize: 11, fontWeight: 400, color: "#8c897f" }}>submissions</span>
        </p>
      </div>
      {isAnomaly && <p style={{ fontSize: 10, color: "#f97316", marginTop: 2 }}>Anomaly detected</p>}
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload._anomaly) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="#f97316" fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={3.5} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
    </g>
  );
}

export default function TrendLine({ data, anomalyWeeks }: Props) {
  const enriched = data.map((d) => ({ ...d, _anomaly: anomalyWeeks.includes(d.label) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={enriched} margin={{ top: 10, right: 8, left: -20, bottom: 4 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e8580a" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#e8580a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#3a3a38", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-sans)" }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: "#3a3a38", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-sans)" }}
          axisLine={false} tickLine={false} allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(232,88,10,0.15)", strokeWidth: 1 }} />
        {anomalyWeeks.map((w) => (
          <ReferenceLine
            key={w} x={w}
            stroke="rgba(249,115,22,0.30)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />
        ))}
        <Area
          type="monotone" dataKey="count"
          stroke="#e8580a" strokeWidth={2.5}
          fill="url(#trendGrad)"
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: "#e8580a", stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive animationDuration={900} animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
