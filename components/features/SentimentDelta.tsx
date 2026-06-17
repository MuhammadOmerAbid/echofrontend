interface SentimentDeltaProps {
  data: Record<string, number>;
}

export default function SentimentDelta({ data }: SentimentDeltaProps) {
  if (!Object.keys(data).length) return null;

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([cat, delta]) => (
        <div
          key={cat}
          className="flex items-center justify-between py-2 border-b border-warm last:border-0"
        >
          <span className="text-sm text-ink font-light">{cat}</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                delta > 0 ? "text-sage" : delta < 0 ? "text-red-400" : "text-stone"
              }`}
            >
              {delta > 0 ? "↑" : delta < 0 ? "↓" : "—"} {Math.abs(delta).toFixed(3)}
            </span>
            <span className="text-[10px] text-stone">
              {delta > 0.05 ? "Improving" : delta < -0.05 ? "Declining" : "Stable"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
