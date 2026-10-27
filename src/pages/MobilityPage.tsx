import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { MOBILITY_SERVICES } from "@/data/plu";
import "./MobilityPage.css";

const UGO = MOBILITY_SERVICES.find((s) => s.id === "ugo");
const TUGENDE = MOBILITY_SERVICES.find((s) => s.id === "tugende");
const HUBS = MOBILITY_SERVICES.find((s) => s.id === "hubs");

export function MobilityPage() {
  return (
    <main className="page">
      <PageHeader
        title="Mobility"
        subtitle="Each app opens on its own — choose UGo Ride or Tugende."
      />
      <div className="mobility-launcher" aria-label="Mobility apps">
        <Link to="/ugo" className="mobility-launcher__tile">
          {"logo" in (UGO ?? {}) && UGO?.logo ? (
            <img src={UGO.logo} alt="" width={88} height={88} loading="lazy" />
          ) : null}
          <span className="mobility-launcher__name">UGo Ride</span>
          <span className="mobility-launcher__tag">{UGO?.status ?? "App"}</span>
        </Link>
        <Link to="/tugende" className="mobility-launcher__tile">
          {"logo" in (TUGENDE ?? {}) && TUGENDE?.logo ? (
            <img src={TUGENDE.logo} alt="" width={88} height={88} loading="lazy" />
          ) : null}
          <span className="mobility-launcher__name">Tugende</span>
          <span className="mobility-launcher__tag">{TUGENDE?.status ?? "App"}</span>
        </Link>
      </div>
      {HUBS ? (
        <div className="card">
          <strong>{HUBS.name}</strong>
          <span className="badge badge-blue" style={{ marginLeft: 8 }}>
            {HUBS.status}
          </span>
          <p style={{ margin: "10px 0 0", color: "var(--plu-muted)", fontSize: "0.88rem" }}>{HUBS.desc}</p>
        </div>
      ) : null}
    </main>
  );
}
