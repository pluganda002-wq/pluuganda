import { Link } from "react-router-dom";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PROGRAMMES } from "@/data/plu";
import { useMemo, useState } from "react";

const TABS = [
  { id: "all", label: "All" },
  { id: "engage", label: "Engage" },
  { id: "service", label: "Service" },
  { id: "account", label: "Accountability" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function programmeTab(slug: string): TabId {
  if (slug === "anti-corruption") return "account";
  if (slug === "community-service" || slug === "sports") return "service";
  return "engage";
}

export function ProgrammesPage() {
  const [tab, setTab] = useState<TabId>("all");

  const list = useMemo(
    () => (tab === "all" ? PROGRAMMES : PROGRAMMES.filter((p) => programmeTab(p.slug) === tab)),
    [tab]
  );

  return (
    <main className="institutional-page">
      <div className="institutional-page__body" style={{ paddingTop: 8 }}>
        <p className="institutional-page__lead">
          Seven programme areas from plu.org.ug — listen locally, mobilise responsibly, act together.
        </p>

        <CategoryTabs tabs={[...TABS]} active={tab} onChange={setTab} ariaLabel="Programme areas" />

        <div className="inst-panel">
          <h2 className="inst-panel__title">Programme directory</h2>
          <div className="module-list">
            {list.map((p) => (
              <Link key={p.slug} to={`/programmes/${p.slug}`} className="card programme-card">
                <strong>{p.title}</strong>
                <p>{p.summary}</p>
                <span className="programme-card__link">Open programme →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
