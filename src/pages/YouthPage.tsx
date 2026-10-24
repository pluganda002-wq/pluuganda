import { PageHeader } from "@/components/PageHeader";
import { Link } from "react-router-dom";

const EVENTS = [
  { title: "Youth civic forum — Kampala", date: "Nov 8, 2026", spots: 120 },
  { title: "Leadership mentorship circle", date: "Nov 15, 2026", spots: 40 },
  { title: "Community clean-up mobilisation", date: "Nov 22, 2026", spots: 200 },
];

export function YouthPage() {
  return (
    <main className="page">
      <PageHeader
        title="Youth leagues"
        subtitle="Forums, leadership development and service — turn patriotism into participation."
      />
      {EVENTS.map((ev) => (
        <div key={ev.title} className="card">
          <strong>{ev.title}</strong>
          <p style={{ margin: "6px 0", color: "var(--plu-muted)", fontSize: "0.85rem" }}>
            {ev.date} · {ev.spots} spots
          </p>
          <button type="button" className="btn btn-secondary">
            Register interest
          </button>
        </div>
      ))}
      <Link to="/programmes/youth" className="btn btn-ghost" style={{ marginTop: 8 }}>
        Read youth programme details
      </Link>
    </main>
  );
}
