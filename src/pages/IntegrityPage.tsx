import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { CASE_TRACKER } from "@/data/plu";

function statusBadge(status: string) {
  if (status === "Action taken") return "badge-green";
  if (status === "Under investigation") return "badge-red";
  return "badge-blue";
}

export function IntegrityPage() {
  return (
    <main className="page">
      <PageHeader
        title="Integrity desk"
        subtitle="Fight corruption. Protect Uganda. Report securely and follow public cases."
      />

      <Link to="/integrity/report" className="btn btn-primary">
        Submit secure report
      </Link>

      <h2 className="section-title" style={{ marginTop: 24 }}>
        Public case tracker
      </h2>
      <p className="section-sub">Sample cases for demo — production will sync with lawful institutions.</p>

      <div className="card">
        {CASE_TRACKER.map((c) => (
          <div key={c.id} className="list-item">
            <div>
              <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
              <p style={{ margin: "8px 0 4px", fontWeight: 600, fontSize: "0.9rem" }}>{c.title}</p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--plu-muted)" }}>
                {c.id} · Updated {c.updated}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
