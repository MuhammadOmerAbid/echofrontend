export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0ede8",
        backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,88,10,0.06), transparent)",
      }}
    >
      {children}
    </div>
  );
}
