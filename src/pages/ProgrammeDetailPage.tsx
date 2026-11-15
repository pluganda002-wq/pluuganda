import { Link, Navigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PROGRAMMES, type ProgrammeSlug } from "@/data/plu";

const ACCOUNTABILITY_SLUG: ProgrammeSlug = "anti-corruption";

export function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  if (slug !== ACCOUNTABILITY_SLUG) {
    return <Navigate to="/programmes" replace />;
  }

  const programme = PROGRAMMES[0];

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
      <Link to="/integrity" className="btn btn-primary" style={{ marginTop: 16 }}>
        Open national projects & corruption tracker
      </Link>
      <Link to="/integrity/report" className="btn btn-secondary" style={{ marginTop: 10 }}>
        File whistleblower report
      </Link>
      <p className="section-sub" style={{ marginTop: 12 }}>
        Search public projects, file red flags, submit field proof, and follow audit logs.
      </p>
      <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 8 }}>
        ← Back to programme hub
      </Link>
    </main>
  );
}
