import { clsx } from "clsx";

interface CardProps {
  title?: string;
  eyebrow?: string;
  accent?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Card({ title, eyebrow, accent, className, children }: CardProps) {
  return (
    <div
      className={clsx("rounded-2xl p-6", className)}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        borderLeft: accent ? "3px solid #e8580a" : undefined,
      }}
    >
      {eyebrow && (
        <div
          className="font-sans font-medium uppercase mb-1"
          style={{ fontSize: 9, letterSpacing: "0.28em", color: "#5a5c58" }}
        >
          {eyebrow}
        </div>
      )}
      {title && (
        <div
          className="font-sans font-semibold uppercase mb-5"
          style={{ fontSize: 11, letterSpacing: "0.14em", color: "#3a3a38" }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
