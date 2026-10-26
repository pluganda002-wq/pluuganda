import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { MOBILITY_SERVICES } from "@/data/plu";

export function MobilityPage() {
  return (
    <main className="page">
      <PageHeader
        title="Mobility & transport hubs"
        subtitle="UGo Ride, Tugende and trucking coordination for PLU mobilisation."
      />
      {MOBILITY_SERVICES.map((s) => (
        <div key={s.id} id={s.id} className="card">
          {"logo" in s && s.logo ? (
            <img
              src={s.logo}
              alt=""
              width={120}
              height={120}
              style={{
                display: "block",
                width: "100%",
                maxWidth: 140,
                height: "auto",
                marginBottom: 12,
                borderRadius: 12,
              }}
            />
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
            <strong>{s.name}</strong>
            <span className="badge badge-blue">{s.status}</span>
          </div>
          <p style={{ margin: "10px 0", color: "var(--plu-muted)", fontSize: "0.88rem" }}>{s.desc}</p>
          {s.id === "tugende" ? (
            <Link to="/tugende" className="btn btn-primary">
              Open Tugende · request ride
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" disabled>
              {s.id === "ugo" ? "UGo — partner onboarding" : "Contact PLU logistics"}
            </button>
          )}
        </div>
      ))}
    </main>
  );
}
