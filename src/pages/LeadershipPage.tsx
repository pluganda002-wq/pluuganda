import { PageHeader } from "@/components/PageHeader";
import { LEADERSHIP_RANKINGS } from "@/data/plu";

export function LeadershipPage() {
  return (
    <main className="page">
      <PageHeader
        title="Leadership rankings"
        subtitle="Recognition based on service, mobilisation and community impact (demo leaderboard)."
      />
      <div className="card">
        {LEADERSHIP_RANKINGS.map((row) => (
          <div key={row.rank} className="list-item">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--plu-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "var(--plu-gold)",
              }}
            >
              {row.rank}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "0.92rem" }}>{row.name}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--plu-muted)" }}>
                {row.score.toLocaleString()} service points · {row.badge}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
