import AdminSidebar from "./AdminSidebar";

const MAIN: React.CSSProperties = {
  marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16,
  minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#fafaf8",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)",
  overflowY: "auto",
};

const box = (w: number | string, h: number, r = 8): React.CSSProperties => ({
  width: w, height: h, borderRadius: r, background: "rgba(0,0,0,0.07)",
});

export default function AdminPageSkeleton() {
  return (
    <>
      <AdminSidebar />
      <main style={MAIN} className="animate-pulse">
        {/* top bar */}
        <div style={{ padding: "22px 32px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={box(72, 9, 5)} />
          <div style={box(200, 24, 8)} />
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* metric row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ borderRadius: 16, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", padding: 18, height: 90, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={box(56, 9, 5)} />
                <div style={box(72, 28, 8)} />
              </div>
            ))}
          </div>

          {/* chart row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[0,1].map((i) => (
              <div key={i} style={{ borderRadius: 16, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", padding: 20, height: 240 }}>
                <div style={{ ...box(100, 10, 5), marginBottom: 14 }} />
                <div style={{ height: 185, borderRadius: 10, background: "rgba(0,0,0,0.05)" }} />
              </div>
            ))}
          </div>

          {/* chart row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[0,1].map((i) => (
              <div key={i} style={{ borderRadius: 16, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", padding: 20, height: 200 }}>
                <div style={{ ...box(80, 10, 5), marginBottom: 14 }} />
                <div style={{ height: 150, borderRadius: 10, background: "rgba(0,0,0,0.05)" }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
