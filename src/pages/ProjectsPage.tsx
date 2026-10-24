import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";

const PROJECTS = [
  { id: "p1", name: "Naguru access road maintenance", district: "Kampala", status: "In progress" },
  { id: "p2", name: "Youth skills centre — phase 1", district: "Mbale", status: "Citizen review open" },
  { id: "p3", name: "Market sanitation upgrade", district: "Jinja", status: "Completed" },
];

export function ProjectsPage() {
  const { showAlert, haptic } = useTelegram();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  function rate(id: string, stars: number) {
    setRatings((r) => ({ ...r, [id]: stars }));
    haptic("light");
    showAlert("Thank you for your citizen review (demo).");
  }

  return (
    <main className="page">
      <PageHeader
        title="Citizen project reviews"
        subtitle="Inspect community projects and share structured feedback for accountability."
      />
      {PROJECTS.map((p) => (
        <div key={p.id} className="card">
          <span className="badge badge-blue">{p.status}</span>
          <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{p.name}</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--plu-muted)" }}>{p.district}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => rate(p.id, n)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  background: (ratings[p.id] ?? 0) >= n ? "var(--plu-gold)" : "var(--plu-surface)",
                  color: (ratings[p.id] ?? 0) >= n ? "var(--plu-black)" : "var(--plu-muted)",
                  fontWeight: 600,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
