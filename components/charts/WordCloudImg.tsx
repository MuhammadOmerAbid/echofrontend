"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function WordCloudImg() {
  const [src, setSrc]     = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let blobUrl: string | null = null;
    const token = getToken();
    if (!token) { setError(true); return; }
    fetch(`${BASE}/admin/wordcloud`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (!res.ok) throw new Error("failed"); return res.blob(); })
      .then((blob) => { blobUrl = URL.createObjectURL(blob); setSrc(blobUrl); })
      .catch(() => setError(true));
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, []);

  if (error) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(232,88,10,0.04)", borderRadius: 12, border: "1px dashed rgba(232,88,10,0.2)" }}>
      <span style={{ fontSize: 13, color: "#8c897f", fontWeight: 300 }}>
        Submit more suggestions to generate a word cloud.
      </span>
    </div>
  );

  if (!src) return (
    <div style={{ height: 200, borderRadius: 12, background: "rgba(0,0,0,0.04)" }} className="animate-pulse" />
  );

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
      <img src={src} alt="Top keywords" style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "cover" }} />
    </div>
  );
}
