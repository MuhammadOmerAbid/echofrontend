import { clsx } from "clsx";

const COLORS: Record<string, string> = {
  Facilities:    "bg-sage/20 text-sage",
  Academic:      "bg-sage2/20 text-sage2",
  "Campus Life": "bg-leaf/30 text-stone",
  Open:          "bg-warm text-stone",
  positive:      "bg-sage/20 text-sage",
  negative:      "bg-red-900/20 text-red-400",
  neutral:       "bg-[#2a2c28] text-stone",
};

interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-block text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded",
        COLORS[label] ?? "bg-[#2a2c28] text-stone",
        className
      )}
    >
      {label}
    </span>
  );
}
