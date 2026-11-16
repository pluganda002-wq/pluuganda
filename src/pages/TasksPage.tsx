import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DutyVerificationDesk } from "@/components/accountability/DutyVerificationDesk";
import {
  DUTY_VERIFICATION_DESK_TITLE,
} from "@/data/dutyVerification";
import { parseDutyTab } from "@/lib/dutyNavigation";
import { ACCOUNTABILITY_DASHBOARD } from "@/data/accountabilityProgramme";
import { useUser } from "@/context/UserContext";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { openActionCount } from "@/lib/dutyAccess";
import { useTelegram } from "@/hooks/useTelegram";
import { Medal, Sparkles, Target } from "lucide-react";
import "./TasksPage.css";

export function TasksPage() {
  const [searchParams] = useSearchParams();
  const initialTab = parseDutyTab(searchParams.get("tab"));
  const { completedTasks } = useUser();
  const dutyTasks = useDutyTasks();
  const { user } = useTelegram();

  const stats = useMemo(() => {
    const userId = user?.id;
    const open = openActionCount(dutyTasks, completedTasks, userId);
    const done = completedTasks.length;
    const pointsEarned = dutyTasks
      .filter((t) => completedTasks.includes(t.id))
      .reduce((sum, t) => sum + t.points, 0);
    const pointsAvailable = dutyTasks.reduce((sum, t) => sum + t.points, 0);
    return { open, done, pointsEarned, pointsAvailable };
  }, [dutyTasks, completedTasks, user?.id]);

  return (
    <main className="institutional-page duty-full">
      <div className="institutional-page__body duty-full__body">
        <section className="duty-full__hero card" aria-labelledby="duty-full-title">
          <div className="duty-full__hero-top">
            <span className="duty-full__badge">
              <Sparkles size={14} aria-hidden />
              Earn points
            </span>
          </div>
          <h1 id="duty-full-title" className="duty-full__title">
            {DUTY_VERIFICATION_DESK_TITLE}
          </h1>
          <p className="duty-full__lead">
            Complete verified digital, field, and advanced duties. Points apply after secretariat
            verification.
          </p>

          <div className="duty-full__stats" role="list">
            <p className="duty-full__stat" role="listitem">
              <Target size={16} className="duty-full__stat-icon" aria-hidden />
              <strong>{stats.open}</strong>
              <span>Open</span>
            </p>
            <p className="duty-full__stat" role="listitem">
              <Medal size={16} className="duty-full__stat-icon" aria-hidden />
              <strong>{stats.done}</strong>
              <span>Completed</span>
            </p>
            <p className="duty-full__stat duty-full__stat--gold" role="listitem">
              <strong>{stats.pointsEarned}</strong>
              <span>
                Pts earned
                <em> / {stats.pointsAvailable}</em>
              </span>
            </p>
          </div>
        </section>

        <section className="duty-full__panel card" aria-label="Duty categories and tasks">
          <p className="duty-full__open-line">
            <strong>{stats.open}</strong> open actions
          </p>
          <DutyVerificationDesk fullPage initialTab={initialTab} syncTabToUrl />
        </section>

        <Link to="/programmes" className="duty-full__footer-link">
          ← Return to {ACCOUNTABILITY_DASHBOARD.title}
        </Link>
      </div>
    </main>
  );
}