import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PROGRAMMES, type ProgrammeSlug } from "@/data/plu";

export function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: ProgrammeSlug }>();
  const programme = PROGRAMMES.find((p) => p.slug === slug);

  if (!programme) {
    return (
      <main className="page">
        <PageHeader title="Programme not found" />
        <Link to="/programmes" className="btn btn-secondary">
          Back to programmes
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader title={programme.title} subtitle={programme.summary} />
      <div className="card">
        <h3 className="section-title">Listen</h3>
        <p className="section-sub">{programme.listen}</p>
        <h3 className="section-title">Organise</h3>
        <p className="section-sub">{programme.organise}</p>
        <h3 className="section-title">Act & account</h3>
        <p className="section-sub">{programme.act}</p>
      </div>
      {programme.slug === "anti-corruption" ? (
        <Link to="/integrity" className="btn btn-primary" style={{ marginTop: 16 }}>
          Open integrity desk
        </Link>
      ) : null}
      {programme.slug === "youth" ? (
        <Link to="/youth" className="btn btn-primary" style={{ marginTop: 16 }}>
          Youth league hub
        </Link>
      ) : null}
    </main>
  );
}
