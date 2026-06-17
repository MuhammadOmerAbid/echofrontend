interface AnomalyBannerProps {
  week: string;
}

export default function AnomalyBanner({ week }: AnomalyBannerProps) {
  return (
    <div
      className="flex items-start gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(232,88,10,0.08)",
        border: "1px solid rgba(232,88,10,0.2)",
      }}
    >
      <span style={{ fontSize: 18, marginTop: 1 }}>⚠</span>
      <div>
        <div className="font-sans font-medium text-sm mb-1" style={{ color: "#111210" }}>
          Anomaly Detected
        </div>
        <div className="font-sans font-light text-sm" style={{ color: "#6a6a65", lineHeight: 1.6 }}>
          Week{" "}
          <strong style={{ color: "#e8580a" }}>{week}</strong> shows a statistically
          significant spike in submission volume (Z-score &gt; 2σ). Review recent
          submissions for emerging issues.
        </div>
      </div>
    </div>
  );
}
