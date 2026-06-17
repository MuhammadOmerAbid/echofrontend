"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Lightbulb, BarChart3, TrendingUp,
  List, Settings, LogOut, Download,
} from "lucide-react";
import { removeToken, getToken } from "@/lib/auth";
import { getExportUrl } from "@/lib/api";

const NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",   Icon: LayoutDashboard },
  { href: "/admin/insights",    label: "ML Insights", Icon: Lightbulb       },
  { href: "/admin/analytics",   label: "Analytics",   Icon: BarChart3       },
  { href: "/admin/trends",      label: "Trends",      Icon: TrendingUp      },
  { href: "/admin/submissions", label: "Submissions", Icon: List            },
];

interface Props { institution?: string; }

export default function AdminSidebar({ institution }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = () => { removeToken(); router.push("/admin/login"); };

  const handleExport = () => {
    const token = getToken();
    if (!token) return;
    fetch(getExportUrl(), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "echo-export.csv";
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <aside style={s.sidebar}>
      {/* ── Logo + Institution ── */}
      <div style={s.header}>
        <Link href="/" style={s.logoRow}>
          <div style={s.logoIcon}>
            <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 15, color: "#e8580a" }}>E</span>
          </div>
          <span style={s.logoText}>
            <span style={{ color: "#e8580a" }}>Ec</span>ho
          </span>
        </Link>

        {institution ? (
          <div style={s.instCard}>
            <div style={s.instAvatar}>{institution.slice(0, 1).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={s.instName}>{institution}</div>
              <div style={s.instBadge}>ADMIN PANEL</div>
            </div>
          </div>
        ) : (
          <div style={{ height: 42, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} className="animate-pulse" />
        )}
      </div>

      {/* ── Menu ── */}
      <p style={s.section}>MENU</p>
      <nav style={s.nav}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <div key={href} style={{ position: "relative" }}>
              {active && <div style={s.activeBar} />}
              <Link
                href={href}
                style={{ ...s.item, background: active ? "rgba(232,88,10,0.08)" : "transparent" }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ ...s.iconBox, background: active ? "rgba(232,88,10,0.13)" : "rgba(0,0,0,0.05)" }}>
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.7} color={active ? "#e8580a" : "#8c897f"} />
                </div>
                <span style={{ ...s.label, color: active ? "#111210" : "#5a5c58", fontWeight: active ? 600 : 500 }}>
                  {label}
                </span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* ── General ── */}
      <p style={s.section}>GENERAL</p>
      <nav style={{ ...s.nav, paddingBottom: 16 }}>
        {([
          { label: "Settings",   Icon: Settings, action: () => router.push("/admin/settings"), isSettings: true },
          { label: "Export CSV", Icon: Download, action: handleExport },
          { label: "Log Out",    Icon: LogOut,   action: logout, danger: true },
        ] as { label: string; Icon: any; action: () => void; isSettings?: boolean; danger?: boolean }[])
          .map(({ label, Icon, action, isSettings, danger }) => {
            const active = isSettings && pathname === "/admin/settings";
            return (
              <div key={label} style={{ position: "relative" }}>
                {active && <div style={s.activeBar} />}
                <button
                  onClick={action}
                  style={{ ...s.item, border: "none", cursor: "pointer", background: active ? "rgba(232,88,10,0.08)" : "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.06)" : "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active ? "rgba(232,88,10,0.08)" : "transparent"; }}
                >
                  <div style={{ ...s.iconBox, background: danger ? "rgba(239,68,68,0.08)" : active ? "rgba(232,88,10,0.13)" : "rgba(0,0,0,0.05)" }}>
                    <Icon size={15} strokeWidth={1.7} color={danger ? "rgba(220,38,38,0.65)" : active ? "#e8580a" : "#8c897f"} />
                  </div>
                  <span style={{ ...s.label, color: danger ? "#dc2626" : active ? "#111210" : "#5a5c58", fontWeight: 500 }}>
                    {label}
                  </span>
                </button>
              </div>
            );
          })}
      </nav>
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    position: "fixed", left: 16, top: 16, bottom: 16, width: 220,
    borderRadius: 20, background: "#ffffff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)",
    display: "flex", flexDirection: "column", zIndex: 60,
    overflowY: "hidden", overflowX: "hidden",
  },
  header: {
    padding: "16px 12px 12px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex", flexDirection: "column", gap: 10,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "rgba(232,88,10,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoText: { fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 19, color: "#111210" },
  instCard: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "7px 10px", borderRadius: 11,
    background: "#faf9f5", border: "1px solid rgba(0,0,0,0.07)",
  },
  instAvatar: {
    width: 26, height: 26, borderRadius: 8,
    background: "rgba(232,88,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "#e8580a", flexShrink: 0,
  },
  instName:  { fontSize: 11, fontWeight: 600, color: "#111210", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  instBadge: { fontSize: 9, fontWeight: 500, color: "#8c897f", letterSpacing: "0.13em" },
  section: {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
    color: "rgba(0,0,0,0.26)", padding: "12px 18px 4px", margin: 0,
  },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "4px 8px" },
  item: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 10px", borderRadius: 11, textDecoration: "none",
    transition: "background 0.13s", width: "100%", textAlign: "left",
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  label: { fontSize: 13 },
  activeBar: {
    position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
    width: 3, height: 22, background: "#e8580a",
    borderRadius: "0 3px 3px 0", boxShadow: "0 2px 6px rgba(232,88,10,0.35)",
  },
};
