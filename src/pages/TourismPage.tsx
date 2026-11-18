import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { TourismEnquiryForm } from "@/components/tourism/TourismEnquiryForm";
import { TourismPackageForm } from "@/components/tourism/TourismPackageForm";
import { TourismRegionCard } from "@/components/tourism/TourismRegionCard";
import { useTourismContent } from "@/context/ServiceContentContext";
import { countPackageBookings, loadTourismBookings } from "@/lib/tourismBookings";
import "./TourismPage.css";

type Panel = "explore" | "packages" | "register" | "enquiry" | "mine";

function packageBadgeClass(status: ReturnType<typeof useTourismContent>["packages"][number]["status"]): string {
  if (status === "open") return "badge badge-blue";
  if (status === "waitlist") return "badge badge-gold";
  return "badge";
}

export function TourismPage() {
  const { pillars, packages, regions } = useTourismContent();
  const [panel, setPanel] = useState<Panel>("explore");
  const [packageId, setPackageId] = useState<string | undefined>();
  const [bookings, setBookings] = useState(() => loadTourismBookings());

  const refreshBookings = useCallback(() => setBookings(loadTourismBookings()), []);

  return (
    <main className="page tourism-page">
      <PageHeader
        title="Tourism"
        subtitle="Discover Uganda — the Pearl of Africa. Patriotic travel that supports local communities."
      />

      <div className="tourism-page__pillars">
        {pillars.map((p) => (
          <article key={p.id} className="tourism-pillar">
            <strong>{p.title}</strong>
            <p>{p.body}</p>
          </article>
        ))}
      </div>

      <div className="tourism-page__tabs" role="tablist" aria-label="Tourism">
        {(
          [
            ["explore", "Explore"],
            ["packages", "Packages"],
            ["register", "Register"],
            ["enquiry", "Custom trip"],
            ["mine", `My bookings (${bookings.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={panel === id}
            className={`tourism-page__tab${panel === id ? " tourism-page__tab--active" : ""}`}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "explore" ? (
        <>
          {regions.map((r) => (
            <TourismRegionCard key={r.id} region={r} />
          ))}
          <button type="button" className="btn btn-primary" style={{ marginTop: 4 }} onClick={() => setPanel("enquiry")}>
            Plan a custom itinerary
          </button>
          <Link to="/mobility" className="btn btn-ghost" style={{ marginTop: 8 }}>
            Mobility for your trip
          </Link>
        </>
      ) : null}

      {panel === "packages" ? (
        <>
          {packages.map((pkg) => {
            const taken = countPackageBookings(pkg.id);
            const left =
              pkg.status === "open" ? Math.max(0, pkg.spots - taken) : null;
            return (
              <div key={pkg.id} className="card tourism-package">
                <span className={packageBadgeClass(pkg.status)}>{pkg.statusLabel}</span>
                <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{pkg.title}</p>
                <p className="tourism-package__meta">
                  {pkg.region} · {pkg.duration}
                  {pkg.departLabel ? ` · ${pkg.departLabel}` : ""}
                  {left !== null ? ` · ${left} spots left` : ""}
                </p>
                <p className="tourism-package__summary">{pkg.summary}</p>
                <div className="tourism-package__actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setPackageId(pkg.id);
                      setPanel("register");
                    }}
                  >
                    {pkg.status === "open" ? "Register interest" : "Join waitlist"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setPanel("enquiry")}>
                    Custom trip
                  </button>
                </div>
              </div>
            );
          })}
          <Link to="/buy-uganda" className="btn btn-secondary" style={{ marginTop: 8 }}>
            Buy Uganda, Build Uganda →
          </Link>
        </>
      ) : null}

      {panel === "register" ? (
        <TourismPackageForm
          key={packageId ?? "default-package"}
          initialPackageId={packageId}
          onSaved={refreshBookings}
        />
      ) : null}

      {panel === "enquiry" ? <TourismEnquiryForm onSaved={refreshBookings} /> : null}

      {panel === "mine" ? (
        <div className="card">
          {bookings.length === 0 ? (
            <p style={{ margin: 0, color: "var(--plu-muted)", fontSize: "0.84rem" }}>
              No bookings yet. Register for a package or send a custom enquiry.
            </p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="tourism-mine__item">
                <span className="tourism-mine__ref">{b.reference}</span>
                <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: "0.88rem" }}>{b.fullName}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--plu-muted)" }}>
                  {b.kind === "package"
                    ? `Package · ${b.packageTitle} · ${b.travellers} traveller${b.travellers > 1 ? "s" : ""}`
                    : `Enquiry · ${b.theme} · ${b.preferredDates}`}
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </main>
  );
}