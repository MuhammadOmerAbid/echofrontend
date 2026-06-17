"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { positive: number; neutral: number; negative: number };
}

const PALETTE: Record<string, { fill: string; label: string }> = {
  positive: { fill: "#e8580a", label: "Positive" },
  neutral:  { fill: "#d4cfc8", label: "Neutral"  },
  negative: { fill: "#991b1b", label: "Negative" },
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const meta = PALETTE[item.name] ?? { fill: "#e8580a", label: item.name };
  const total = item.payload._total ?? 1;
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.fill, display: "inline-block" }} />
        <span style={{ fontSize: 11, color: "#8c897f", textTransform: "capitalize" }}>{meta.label}</span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#111210" }}>
        {item.value}
        <span style={{ fontSize: 11, fontWeight: 400, color: "#8c897f", marginLeft: 5 }}>
          ({Math.round((item.value / total) * 100)}%)
        </span>
      </p>
    </div>
  );
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

export default function SentimentPie({ data }: Props) {
  const total = data.positive + data.neutral + data.negative;
  const chartData = (Object.entries(data) as [string, number][])
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, _total: total }));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={52} outerRadius={82}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
            isAnimationActive animationDuration={800} animationEasing="ease-out"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={PALETTE[entry.name]?.fill ?? "#e8580a"}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 110 }}>
        {chartData.map((entry) => {
          const meta = PALETTE[entry.name] ?? { fill: "#e8580a", label: entry.name };
          return (
            <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 10, height: 10, borderRadius: 3,
                background: meta.fill, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 11, color: "#111210", fontWeight: 600, textTransform: "capitalize" }}>
                  {meta.label}
                </div>
                <div style={{ fontSize: 10, color: "#8c897f" }}>
                  {entry.value} · {Math.round((entry.value / total) * 100)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
