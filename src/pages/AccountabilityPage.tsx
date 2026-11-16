import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACCOUNTABILITY_FILTERS,
  ACCOUNTABILITY_STATS,
  FIELD_TESTIMONIES,
  TRACKED_PROJECTS,
  formatReconciled,
  formatUgxBillions,
  type ProjectFilter,
  type TrackedProject,
} from "@/data/accountability";
import { useTelegram } from "@/hooks/useTelegram";
import "./AccountabilityPage.css";
import { Camera, Heart, Lock, Megaphone, MessageCircle, Search, ShieldCheck } from "lucide-react";

function deficitGap(p: TrackedProject) {
  return Math.max(0, p.disbursedPct - p.physicalPct);
}

function ProjectCard({ project, onProof, onBribery }: {
  project: TrackedProject;
  onProof: () => void;
  onBribery: () => void;
}) {
  const gap = deficitGap(project);
  return (
    <article className="acct-project card">
      <div className="acct-project__tags">
        <span className="acct-tag acct-tag--danger">
          Red flag investigation
          {project.metro ? ` · ${project.metro}` : ` · ${project.district}`}
        </span>
        {project.overdueMonths ? (
          <span className="acct-tag acct-tag--overdue">Overdue {project.overdueMonths} mos</span>
        ) : null}
      </div>
      <h3 className="acct-project__title">{project.name}</h3>
      <dl className="acct-project__meta">
        <div>
          <dt>Allocated budget</dt>
          <dd>{formatUgxBillions(project.budgetUgx)}</dd>
        </div>
        <div>
          <dt>Contractor</dt>
          <dd>{project.contractor}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{project.targetLabel}</dd>
        </div>
      </dl>
      <div className="acct-meter">
        <div className="acct-meter__row">
          <span>Physical execution ({project.physicalPct}%)</span>
          <ProgressBar pct={project.physicalPct} variant="physical" />
        </div>
        <div className="acct-meter__row">
          <span>Disbursed funds ({project.disbursedPct}%)</span>
          <ProgressBar pct={project.disbursedPct} variant="funds" />
        </div>
      </div>
      {gap >= 20 ? (
        <p className="acct-variance">
          Deficit variance: <strong>{gap}% gap</strong> — <span className="acct-variance__flag">Critical fiscal red flag</span>
        </p>
      ) : null}
      <blockquote className="acct-field-note">{project.fieldNote}</blockquote>
      <p className="acct-evidence-count">
        {project.photoCount} photo & {project.videoCount} video proofs
      </p>
      <div className="acct-evidence-grid">
        {project.evidence.map((e) => (
          <EvidenceTile key={e.label} label={e.label} meta={e.meta} />
        ))}
      </div>
      <div className="acct-project__actions">
        <button type="button" className="btn btn-primary acct-btn-proof" onClick={onProof}>
          <Camera size={18} /> Submit proof (+30 pts)
        </button>
        <Link to="/integrity/report" className="btn btn-secondary acct-btn-bribery" onClick={onBribery}>
          <Megaphone size={18} className="acct-btn-bribery__icon" /> Report bribery
        </Link>
      </div>
    </article>
  );
}

function ProgressBar({ pct, variant }: { pct: number; variant: "physical" | "funds" }) {
  return (
    <div className="acct-bar">
      <div
        className={`acct-bar__fill acct-bar__fill--${variant}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function EvidenceTile({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="acct-evidence-tile">
      <span className="acct-evidence-tile__label">{label}</span>
      {meta ? <span className="acct-evidence-tile__meta">{meta}</span> : null}
    </div>
  );
}

export function AccountabilityPage() {
  const { haptic, showAlert } = useTelegram();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("red-flag");

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRACKED_PROJECTS.filter((p) => {
      const matchFilter = filter === "all" || p.status === filter;
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const projectsToShow = visibleProjects.length > 0 ? visibleProjects : TRACKED_PROJECTS.slice(0, 1);

  function onProof() {
    haptic("light");
    showAlert("Proof upload opens in the next release. For now, file a full report with photos.");
  }

  function onBribery() {
    haptic("light");
    showAlert("Use the secure report form — choose bribery / public resource abuse.");
  }

  return (
    <main className="page acct-page">
      <header className="acct-hero acct-hero--dash">
        <p className="acct-kicker">Dashboard</p>
        <h1 className="acct-title">National projects & corruption tracker</h1>
        <p className="acct-status">
          {ACCOUNTABILITY_STATS.reportsLogged.toLocaleString()} reports · audit desk live
        </p>
      </header>

      <div className="acct-stats">
        <div>
          <strong>{ACCOUNTABILITY_STATS.projectsTracked.toLocaleString()}</strong>
          <span>Projects tracked</span>
        </div>
        <div className="acct-stats__red">
          <strong>{ACCOUNTABILITY_STATS.redFlags}</strong>
          <span>Red flags filed</span>
        </div>
        <div className="acct-stats__gold">
          <strong>{formatReconciled(ACCOUNTABILITY_STATS.fundsReconciledUgx)}</strong>
          <span>Funds reconciled</span>
        </div>
      </div>

      <label className="acct-search">
        <Search size={18} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search project name, district, or contractor"
        />
      </label>

      <div className="acct-filters" role="tablist" aria-label="Project filters">
        {ACCOUNTABILITY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`acct-filter${filter === f.id ? " acct-filter--on" : ""}`}
            onClick={() => {
              setFilter(f.id);
              haptic("light");
            }}
          >
            {f.id === "stalled" ? "⚠ " : ""}
            {f.label}
            {f.count != null ? ` (${f.count >= 1000 ? `${(f.count / 1000).toFixed(1)}k` : f.count})` : ""}
          </button>
        ))}
      </div>

      {projectsToShow.map((p) => (
        <ProjectCard key={p.id} project={p} onProof={onProof} onBribery={onBribery} />
      ))}

      <section className="acct-feed">
        <div className="acct-feed__head">
          <h2>Field testimonies & audit logs</h2>
          <span>{ACCOUNTABILITY_STATS.testimonies} entries</span>
        </div>
        <ul className="acct-feed__list">
          {FIELD_TESTIMONIES.map((t) => (
            <li key={t.id} className="acct-post card">
              <div className="acct-post__head">
                <div>
                  <strong>{t.author}</strong>
                  <span className="acct-post__role">{t.role}</span>
                  <span className="acct-post__ago">{t.ago}</span>
                </div>
                <span className="acct-post__badge">{t.badge}</span>
              </div>
              <p className="acct-post__body">{t.body}</p>
              <div className="acct-post__tags">
                {t.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="acct-post__foot">
                <span>
                  <Heart size={14} /> {t.likes}
                </span>
                <span>
                  <MessageCircle size={14} /> {t.replies}
                </span>
                {t.status ? (
                  <span className={`acct-post__status acct-post__status--${t.statusVariant ?? "flagged"}`}>
                    {t.status}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="acct-whistle card">
        <div className="acct-whistle__title">
          <ShieldCheck size={22} />
          <h2>Know of a ghost project in your parish?</h2>
        </div>
        <ul className="acct-whistle__list">
          <li>100% anonymous encryption in transit</li>
          <li>Geo-fenced photo / video verification</li>
          <li>Direct escalation to PLU Secretariat & IGG liaison</li>
        </ul>
        <Link to="/integrity/report" className="btn btn-primary acct-whistle__cta" onClick={() => haptic("medium")}>
          <Lock size={18} /> File whistleblower audit report (+50 pts)
        </Link>
      </section>
    </main>
  );
}