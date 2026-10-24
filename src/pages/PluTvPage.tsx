import { PageHeader } from "@/components/PageHeader";
import { useTelegram } from "@/hooks/useTelegram";

const STREAMS = [
  { title: "PLU Secretariat briefing", type: "Live replay", duration: "42 min" },
  { title: "District Baraza highlights", type: "Event", duration: "28 min" },
  { title: "Civic education — integrity", type: "Learning", duration: "15 min" },
];

export function PluTvPage() {
  const { showAlert } = useTelegram();

  return (
    <main className="page">
      <PageHeader title="PLU TV" subtitle="Official updates, baraza coverage and patriotic programming." />
      <div
        className="card"
        style={{
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--plu-surface)",
          color: "var(--plu-muted)",
          fontSize: "0.9rem",
        }}
      >
        Stream player — embed in v0.2
      </div>
      {STREAMS.map((s) => (
        <div key={s.title} className="card">
          <span className="badge badge-gold">{s.type}</span>
          <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{s.title}</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--plu-muted)" }}>{s.duration}</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => showAlert("Streaming CDN integration planned.")}>
            Watch
          </button>
        </div>
      ))}
    </main>
  );
}
