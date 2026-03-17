export default function MiniBarChart({ data = [], title = "History" }) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));

  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 900, color: "#083A57" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8, alignItems: "end", height: 160, marginTop: 12 }}>
        {data.map((d) => (
          <div key={d.month} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
            <div style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.04)", borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", height: `${Math.round(((d.value || 0) / max) * 100)}%`, background: "rgba(0,59,92,0.85)" }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>{d.month.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}