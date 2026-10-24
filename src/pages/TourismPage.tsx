import { PageHeader } from "@/components/PageHeader";
import { TOURISM_PACKAGES, TOURISM_REGIONS } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function TourismPage() {
  const { showAlert } = useTelegram();

  return (
    <main className="page">
      <PageHeader
        title="Tourism"
        subtitle="Discover Uganda — the Pearl of Africa. Patriotic travel that supports local communities."
      />

      <div className="card">
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--plu-muted)" }}>
          PLU tourism connects members and visitors to safe, organised experiences across Uganda — aligned
          with national unity and responsible citizenship.
        </p>
      </div>

      <h2 className="section-title" style={{ marginTop: 20 }}>
        Explore by theme
      </h2>
      {TOURISM_REGIONS.map((r) => (
        <div key={r.id} className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <MapPin size={20} color="var(--plu-green)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>{r.name}</strong>
              <p style={{ margin: "6px 0", fontSize: "0.88rem", color: "var(--plu-text)" }}>
                {r.highlights}
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--plu-muted)" }}>{r.tip}</p>
            </div>
          </div>
        </div>
      ))}

      <h2 className="section-title" style={{ marginTop: 20 }}>
        PLU travel packages
      </h2>
      {TOURISM_PACKAGES.map((pkg) => (
        <div key={pkg.title} className="card">
          <span className="badge badge-blue">{pkg.status}</span>
          <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{pkg.title}</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--plu-muted)" }}>
            {pkg.region} · {pkg.duration}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => showAlert("Tour booking will connect to PLU Secretariat partners in the next release.")}
          >
            Register interest
          </button>
        </div>
      ))}

      <Link to="/buy-uganda" className="btn btn-secondary" style={{ marginTop: 16 }}>
        Buy Uganda, Build Uganda →
      </Link>
      <Link to="/mobility" className="btn btn-ghost" style={{ marginTop: 8 }}>
        Mobility for your trip
      </Link>
    </main>
  );
}
