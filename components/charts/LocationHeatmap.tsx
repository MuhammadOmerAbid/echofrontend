"use client";

import { useState } from "react";

interface Cell { location_x: number; location_y: number; location: string; count: number; }
interface Props { data: Cell[]; }

export default function LocationHeatmap({ data }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-stone text-sm font-light">
        No location data yet.
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const GRID = 5;

  const grid: Record<string, Cell> = {};
  for (const cell of data) grid[`${cell.location_x}-${cell.location_y}`] = cell;

  function cellStyle(count: number): React.CSSProperties {
    const pct = count / maxCount;
    if (pct > 0.8) return { background: "#e8580a", border: "1px solid rgba(232,88,10,0.6)" };
    if (pct > 0.5) return { background: "rgba(232,88,10,0.55)", border: "1px solid rgba(232,88,10,0.35)" };
    if (pct > 0.2) return { background: "rgba(232,88,10,0.25)", border: "1px solid rgba(232,88,10,0.2)" };
    return             { background: "rgba(232,88,10,0.08)", border: "1px solid rgba(232,88,10,0.12)" };
  }

  function textColor(count: number): string {
    return count / maxCount > 0.5 ? "#ffffff" : "#e8580a";
  }

  const hoveredCell = hovered ? grid[hovered] : null;

  return (
    <div>
      {/* Tooltip bar */}
      <div style={{
        height: 28, marginBottom: 10, borderRadius: 8,
        background: hoveredCell ? "rgba(232,88,10,0.08)" : "transparent",
        border: hoveredCell ? "1px solid rgba(232,88,10,0.15)" : "1px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {hoveredCell ? (
          <span style={{ fontSize: 12, fontWeight: 500, color: "#e8580a" }}>
            {hoveredCell.location} — <strong>{hoveredCell.count}</strong> submission{hoveredCell.count !== 1 ? "s" : ""}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.25)" }}>Hover a cell to see location</span>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: GRID }, (_, y) => (
          <div key={y} style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: GRID }, (_, x) => {
              const key = `${x + 1}-${y + 1}`;
              const cell = grid[key];
              const isHov = hovered === key;
              return (
                <div
                  key={x}
                  onMouseEnter={() => cell && setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    flex: 1, height: 42, borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: cell ? "pointer" : "default",
                    transition: "transform 0.12s, box-shadow 0.12s",
                    transform: isHov ? "scale(1.08)" : "scale(1)",
                    boxShadow: isHov ? "0 4px 12px rgba(232,88,10,0.25)" : "none",
                    ...(cell ? cellStyle(cell.count) : {
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.07)",
                    }),
                  }}
                >
                  {cell && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: textColor(cell.count) }}>
                      {cell.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 10, color: "#8c897f" }}>Low</span>
        {[0.08, 0.25, 0.55, 1].map((o) => (
          <div key={o} style={{ width: 18, height: 11, borderRadius: 4, background: `rgba(232,88,10,${o})` }} />
        ))}
        <span style={{ fontSize: 10, color: "#8c897f" }}>High</span>
      </div>
    </div>
  );
}
