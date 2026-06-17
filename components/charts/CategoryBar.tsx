"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props { data: Record<string, number> }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
    }}>
      <p style={{ fontSize: 11, color: "#8c897f", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#e8580a" }}>
        {payload[0].value} <span style={{ fontSize: 11, fontWeight: 400, color: "#8c897f" }}>submissions</span>
      </p>
    </div>
  );
}

export default function CategoryBar({ data }: Props) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const max = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
        barCategoryGap="28%">
        <defs>
          {chartData.map((_, i) => (
            <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e8580a" stopOpacity={1} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.75} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis
          dataKey="name" tick={{ fill: "#3a3a38", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-sans)" }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: "#3a3a38", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-sans)" }}
          axisLine={false} tickLine={false} allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232,88,10,0.05)", radius: 6 }} />
        <Bar
          dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}
          isAnimationActive animationDuration={700} animationEasing="ease-out"
        >
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={`url(#barGrad${i})`}
              opacity={0.55 + 0.45 * (entry.value / max)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
