interface Priority {
  text_original: string;
  category: string;
  location: string;
  priority_score: number;
  sentiment_label: string;
}

interface PriorityCardProps {
  item: Priority;
  rank: number;
}

const SENT_COLORS: Record<string, string> = {
  positive: "#e8580a",
  negative: "#dc2626",
  neutral:  "#8c897f",
};

export default function PriorityCard({ item, rank }: PriorityCardProps) {
  const sentColor = SENT_COLORS[item.sentiment_label] ?? "#8c897f";

  return (
    <div
      className="flex gap-4 p-4 rounded-xl"
      style={{ background: "#f7f5ef", border: "1px solid #e8e4db" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold shrink-0 mt-0.5"
        style={{ fontSize: 11, background: "#e8580a" }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className="px-2.5 py-0.5 rounded-full font-medium"
            style={{ fontSize: 10, background: "rgba(232,88,10,0.1)", color: "#e8580a" }}
          >
            {item.category}
          </span>
          <span style={{ fontSize: 11, color: "#8c897f" }}>{item.location}</span>
          <span
            className="ml-auto font-medium capitalize"
            style={{ fontSize: 10, color: sentColor }}
          >
            {item.sentiment_label}
          </span>
        </div>
        <p className="font-sans font-light text-sm leading-relaxed" style={{ color: "#3a3a35" }}>
          {item.text_original}
        </p>
        <div className="font-sans mt-2" style={{ fontSize: 10, color: "#8c897f" }}>
          Priority score:{" "}
          <span style={{ color: "#e8580a", fontWeight: 500 }}>
            {(item.priority_score * 100).toFixed(0)}/100
          </span>
        </div>
      </div>
    </div>
  );
}
