type Stat = { label: string; value: string | number };

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div key={s.label} className="stat-pill">
          <strong>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
