import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PROGRAMMES } from "@/data/plu";

export function ProgrammesPage() {
  return (
    <main className="page">
      <PageHeader
        title="Programmes"
        subtitle="Seven ways PLU turns patriotism into participation — aligned with plu.org.ug."
      />
      <div className="module-list">
        {PROGRAMMES.map((p) => (
          <Link key={p.slug} to={`/programmes/${p.slug}`} className="card programme-card">
            <strong>{p.title}</strong>
            <p>{p.summary}</p>
            <span className="programme-card__link">View programme →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
