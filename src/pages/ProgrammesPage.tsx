import { Link } from "react-router-dom";
import {
  ACCOUNTABILITY_ACTIONS,
  ACCOUNTABILITY_DASHBOARD,
  TRACKER_DASHBOARD,
} from "@/data/accountabilityProgramme";
import { ACCOUNTABILITY_STATS } from "@/data/accountability";
import { CASE_TRACKER } from "@/data/plu";
import { AccountabilityTasksPanel } from "@/components/accountability/AccountabilityTasksPanel";
import { useTelegram } from "@/hooks/useTelegram";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import "./ProgrammesPage.css";

export function ProgrammesPage() {
  const { haptic, showAlert } = useTelegram();

  function onSync() {
    haptic("medium");
    showAlert(navigator.onLine ? "Vault synced." : "Offline — queue held until uplink.");
  }

  return (
    <main className="institutional-page prog-dash">
      <div className="institutional-page__body prog-dash__body">
        <header className="prog-dash__head">
          <p className="prog-dash__tag">{ACCOUNTABILITY_DASHBOARD.tag}</p>
          <h1 className="prog-dash__title">{ACCOUNTABILITY_DASHBOARD.title}</h1>
        </header>

        <div className="prog-dash__kpis">
          <div>
            <strong>{ACCOUNTABILITY_STATS.redFlags}</strong>
            <span>Red flags</span>
          </div>
          <div>
            <strong>{CASE_TRACKER.length}</strong>
            <span>Open cases</span>
          </div>
          <div>
            <strong>{ACCOUNTABILITY_STATS.reportsLogged.toLocaleString()}</strong>
            <span>Reports</span>
          </div>
        </div>

        <Link
          to={TRACKER_DASHBOARD.path}
          className="prog-dash__tracker card"
          onClick={() => haptic("light")}
        >
          <span className="prog-dash__tracker-icon">
            <LayoutDashboard size={22} aria-hidden />
          </span>
          <h2>{TRACKER_DASHBOARD.title}</h2>
          <div className="prog-dash__tracker-stats">
            <span>
              <b>{ACCOUNTABILITY_STATS.projectsTracked.toLocaleString()}</b> projects
            </span>
            <span>
              <b>{ACCOUNTABILITY_STATS.redFlags}</b> flags
            </span>
            <span>Search · filter · act</span>
          </div>
          <span className="prog-dash__tracker-go">
            Open dashboard <ChevronRight size={18} />
          </span>
        </Link>

        <h2 className="prog-dash__section">Actions</h2>
        <div className="prog-dash__grid">
          {ACCOUNTABILITY_ACTIONS.map((action) => {
            const Icon = action.icon;
            if (action.id === "sync") {
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`prog-dash__tile prog-dash__tile--${action.accent ?? "neutral"}`}
                  onClick={() => {
                    haptic("light");
                    onSync();
                  }}
                >
                  <Icon size={20} />
                  <span className="prog-dash__tile-label">{action.label}</span>
                  {action.meta ? <em>{action.meta}</em> : null}
                </button>
              );
            }
            return (
              <Link
                key={action.id}
                to={action.to}
                className={`prog-dash__tile prog-dash__tile--${action.accent ?? "neutral"}`}
                onClick={() => haptic("light")}
              >
                <Icon size={20} />
                <span className="prog-dash__tile-label">{action.label}</span>
                {action.meta ? <em>{action.meta}</em> : null}
              </Link>
            );
          })}
        </div>

        <AccountabilityTasksPanel compact tasksLink="/programmes/tasks" />
      </div>
    </main>
  );
}