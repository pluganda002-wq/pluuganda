import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ACCOUNTABILITY_DASHBOARD,
  ACCOUNTABILITY_DASHBOARD_METRICS,
} from "@/data/accountabilityProgramme";
import { ACCOUNTABILITY_STATS, formatReconciled } from "@/data/accountability";
import { AccountabilityTasksPanel } from "@/components/accountability/AccountabilityTasksPanel";
import { WhistleblowerReportForm } from "@/components/accountability/WhistleblowerReportForm";
import { useTelegram } from "@/hooks/useTelegram";
import { Search } from "lucide-react";
import "./ProgrammesPage.css";

function formatMetric(value: number) {
  return value.toLocaleString("en-US");
}

export function ProgrammesPage() {
  const { haptic } = useTelegram();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim();
    haptic("light");
    if (!q) {
      navigate("/integrity");
      return;
    }
    navigate(`/integrity?q=${encodeURIComponent(q)}`);
  }

  return (
    <main className="institutional-page prog-dash">
      <div className="institutional-page__body prog-dash__body">
        <section className="prog-dash__board card" aria-label="Active audit desk">
          <header className="prog-dash__board-top">
            <span className="prog-dash__live" aria-hidden>
              <span className="prog-dash__live-dot" />
              Live
            </span>
            <h1 className="prog-dash__title">{ACCOUNTABILITY_DASHBOARD.title}</h1>
          </header>

          <div className="prog-dash__metrics" role="list">
            {ACCOUNTABILITY_DASHBOARD_METRICS.map((m) => (
              <Link
                key={m.id}
                to={m.to}
                role="listitem"
                className={`prog-dash__metric prog-dash__metric--${m.tone}`}
                onClick={() => haptic("light")}
              >
                <strong>{formatMetric(m.value)}</strong>
                <span>{m.label}</span>
              </Link>
            ))}
          </div>

          <p className="prog-dash__funds">
            Funds reconciled <strong>{formatReconciled(ACCOUNTABILITY_STATS.fundsReconciledUgx)}</strong>
          </p>
        </section>

        <form className="prog-dash__search" onSubmit={onSearch}>
          <Search size={18} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project, district, contractor…"
            aria-label="Search projects"
          />
          <button type="submit" className="prog-dash__search-go">
            Go
          </button>
        </form>

        <WhistleblowerReportForm embedded />

        <AccountabilityTasksPanel compact tasksLink="/programmes/tasks" />
      </div>
    </main>
  );
}