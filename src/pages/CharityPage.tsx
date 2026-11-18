import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useCharityContent } from "@/context/ServiceContentContext";

export function CharityPage() {
  const { drives } = useCharityContent();

  return (
    <main className="page">
      <PageHeader
        title="Charity programmes"
        subtitle="Volunteer-led care initiatives aligned with PLU community service."
      />
      {drives.map((d) => (
        <Link key={d.id} to={`/charity/${d.id}`} className="card tourism-region-card">
          <div className="tourism-region-card__media">
            <img src={d.coverImage} alt="" loading="lazy" />
          </div>
          <div className="tourism-region-card__body">
            <strong>{d.name}</strong>
            <p style={{ margin: "8px 0", color: "var(--plu-gold)", fontSize: "0.9rem" }}>
              {d.raised} of {d.goal}
            </p>
            <span className="tourism-region-card__cta">View photos →</span>
          </div>
        </Link>
      ))}
    </main>
  );
}