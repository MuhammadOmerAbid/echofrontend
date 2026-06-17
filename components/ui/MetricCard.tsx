interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export default function MetricCard({ label, value, sub, accent, className }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 ${className ?? ""}`}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        borderLeft: `3px solid ${accent ? "#e8580a" : "#fff1e6"}`,
      }}
    >
      <div
        className="font-sans font-medium uppercase mb-2.5"
        style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}
      >
        {label}
      </div>
      <div className="font-display font-bold" style={{ fontSize: 26, lineHeight: 1, color: "#111210", marginBottom: sub ? 4 : 0 }}>
        {value}
      </div>
      {sub && (
        <div className="font-sans font-light" style={{ fontSize: 11, color: "#8c897f" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
