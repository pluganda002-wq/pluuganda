import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronRight, Coins, Lock, MapPin, Shield } from "lucide-react";
import { dutyReturnPath, openDigitalDuty } from "@/lib/dutyNavigation";
import {
  isTaskLocked,
  openActionCount,
  visibleTabs,
  visibleTasksForTab,
} from "@/lib/dutyAccess";
import { useEffect, useMemo, useState } from "react";
import {
  DUTY_VERIFICATION_DESK_TITLE,
  type DutyTab,
  type DutyTask,
} from "@/data/dutyVerification";
import { useUser } from "@/context/UserContext";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { useTelegram } from "@/hooks/useTelegram";
import { FieldDutySheet } from "@/components/accountability/FieldDutySheet";
import { DutyPlatformIcon } from "@/components/accountability/DutyPlatformIcon";
import "./DutyVerificationDesk.css";

type Props = {
  compact?: boolean;
  fullPage?: boolean;
  fullPageLink?: string;
  initialTab?: DutyTab;
  syncTabToUrl?: boolean;
};

type Handlers = {
  completedTasks: string[];
  userId?: number;
  onField: (task: DutyTask) => void;
  openDigital: (task: DutyTask) => void;
  onRestricted: (task: DutyTask) => void;
};

function StatusStrip({ done }: { done: boolean }) {
  if (done) {
    return (
      <div className="duty-brief__status duty-brief__status--ok">
        <Check size={14} aria-hidden />
        Verified · points credited
      </div>
    );
  }
  return (
    <div className="duty-brief__status duty-brief__status--open">
      <span className="duty-brief__status-dot" aria-hidden />
      Status: Open
    </div>
  );
}

function DigitalRowCard({ task, handlers }: { task: DutyTask; handlers: Handlers }) {
  const done = handlers.completedTasks.includes(task.id);
  return (
    <li className="duty-row__item">
      <button
        type="button"
        className={`duty-row${done ? " duty-row--done" : ""}`}
        disabled={done}
        onClick={() => handlers.openDigital(task)}
      >
        <span className="duty-row__icon">
          <DutyPlatformIcon iconKey={task.iconKey} size={26} />
        </span>
        <span className="duty-row__title">{task.title}</span>
        <span className="duty-row__divider" aria-hidden />
        <span className="duty-row__reward">
          {done ? <Check size={14} strokeWidth={2.5} aria-hidden /> : <Coins size={14} aria-hidden />}
          +{task.points} pts
        </span>
        {!done ? <ChevronRight size={20} className="duty-row__chev" aria-hidden /> : null}
      </button>
    </li>
  );
}

function FieldDetailCard({ task, handlers }: { task: DutyTask; handlers: Handlers }) {
  const done = handlers.completedTasks.includes(task.id);
  const category = task.categoryLabel ?? "Field action";

  return (
    <li className="duty-brief">
      <article className={`duty-brief__card duty-brief__card--field${done ? " duty-brief__card--done" : ""}`}>
        <header className="duty-brief__top">
          <span className="duty-brief__tag">
            <span className="duty-brief__dot" aria-hidden />
            {category}
          </span>
          <span className="duty-brief__pts">+{task.points} pts</span>
        </header>
        <h3 className="duty-brief__title">{task.title}</h3>
        {task.location ? (
          <p className="duty-brief__loc">
            <MapPin size={13} aria-hidden />
            {task.location}
          </p>
        ) : task.subtitle ? (
          <p className="duty-brief__loc">{task.subtitle}</p>
        ) : null}
        {task.description ? <p className="duty-brief__desc">{task.description}</p> : null}
        <StatusStrip done={done} />
        <button
          type="button"
          className={`duty-brief__cta${done ? " duty-brief__cta--done" : ""}`}
          disabled={done}
          onClick={() => handlers.onField(task)}
        >
          {done ? "Verified · points credited" : task.cta}
        </button>
      </article>
    </li>
  );
}

function RestrictedCard({
  task,
  handlers,
  restricted,
}: {
  task: DutyTask;
  handlers: Handlers;
  restricted: "advanced" | "classified";
}) {
  const done = handlers.completedTasks.includes(task.id);
  const locked = isTaskLocked(task, handlers.userId);
  const category = task.categoryLabel ?? (restricted === "classified" ? "Classified" : "Advanced");

  return (
    <li className="duty-brief">
      <article
        className={`duty-brief__card duty-brief__card--${restricted}${locked ? " duty-brief__card--locked" : ""}`}
      >
        <header className="duty-brief__top">
          <span className="duty-brief__tag">
            {locked ? <Lock size={12} aria-hidden /> : <Shield size={12} aria-hidden />}
            {category}
          </span>
          <span className="duty-brief__pts">+{task.points} pts</span>
        </header>
        <h3 className="duty-brief__title">{task.title}</h3>
        {task.subtitle ? <p className="duty-brief__loc">{task.subtitle}</p> : null}
        {task.description ? <p className="duty-brief__desc">{task.description}</p> : null}
        {task.assigneeLabel ? <p className="duty-brief__assignee">{task.assigneeLabel}</p> : null}
        {restricted === "classified" ? (
          <p className="duty-brief__classified-note">Secretariat-assigned · do not share</p>
        ) : null}
        <StatusStrip done={done} />
        <button
          type="button"
          className={`duty-brief__cta${done ? " duty-brief__cta--done" : ""}${locked ? " duty-brief__cta--locked" : ""}`}
          disabled={done || locked}
          onClick={() => handlers.onRestricted(task)}
        >
          {done ? "Completed" : locked ? "Restricted" : task.cta}
        </button>
      </article>
    </li>
  );
}

function ClassifiedEmpty() {
  return (
    <div className="duty-desk__empty duty-desk__empty--classified">
      <Shield size={28} strokeWidth={1.75} aria-hidden />
      <h3>No assigned directives</h3>
      <p>
        Classified duties are issued by the secretariat. When you are selected, your directive will
        appear here.
      </p>
    </div>
  );
}

function TaskList({ tab, tasks, handlers }: { tab: DutyTab; tasks: DutyTask[]; handlers: Handlers }) {
  if (tab === "classified" && tasks.length === 0) {
    return <ClassifiedEmpty />;
  }
  if (tab === "digital") {
    return (
      <ul className="duty-row__list">
        {tasks.map((task) => (
          <DigitalRowCard key={task.id} task={task} handlers={handlers} />
        ))}
      </ul>
    );
  }
  if (tab === "field") {
    return (
      <ul className="duty-brief__list">
        {tasks.map((task) => (
          <FieldDetailCard key={task.id} task={task} handlers={handlers} />
        ))}
      </ul>
    );
  }
  return (
    <ul className="duty-brief__list">
      {tasks.map((task) => (
        <RestrictedCard
          key={task.id}
          task={task}
          handlers={handlers}
          restricted={tab === "classified" ? "classified" : "advanced"}
        />
      ))}
    </ul>
  );
}

export function DutyVerificationDesk({
  compact = false,
  fullPage = false,
  fullPageLink = "/programmes/tasks",
  initialTab = "digital",
  syncTabToUrl = false,
}: Props) {
  const [tab, setTab] = useState<DutyTab>(initialTab);
  const [, setSearchParams] = useSearchParams();
  const [fieldTask, setFieldTask] = useState<DutyTask | null>(null);
  const dutyTasks = useDutyTasks();
  const { completedTasks, completeTask } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const navigate = useNavigate();

  const userId = user?.id;
  const tabs = useMemo(() => visibleTabs(dutyTasks, userId), [dutyTasks, userId]);
  const list = useMemo(() => {
    const items = visibleTasksForTab(tab, dutyTasks, userId);
    return compact ? items.slice(0, 3) : items;
  }, [tab, dutyTasks, userId, compact]);

  const openCount = useMemo(
    () => openActionCount(dutyTasks, completedTasks, userId),
    [dutyTasks, completedTasks, userId]
  );

  const returnTo = useMemo(() => dutyReturnPath(compact, tab), [compact, tab]);

  const handlers: Handlers = useMemo(
    () => ({
      completedTasks,
      userId,
      onField: (task: DutyTask) => {
        if (completedTasks.includes(task.id)) return;
        haptic("light");
        setFieldTask(task);
      },
      openDigital: (task: DutyTask) => {
        if (completedTasks.includes(task.id)) return;
        haptic("light");
        openDigitalDuty(navigate, task, returnTo);
      },
      onRestricted: (task: DutyTask) => {
        if (isTaskLocked(task, userId)) {
          haptic("light");
          showAlert(
            task.kind === "classified"
              ? "Classified duties are visible only to patriots selected by the secretariat."
              : "This advanced duty is assigned to another coordinator."
          );
          return;
        }
        if (task.actionTo) {
          haptic("light");
          navigate(task.actionTo, { state: { returnTo: dutyReturnPath(compact, tab) } });
          return;
        }
        completeTask(task.id);
        haptic("medium");
        showAlert("Duty opened. Follow coordinator instructions.");
      },
    }),
    [completedTasks, userId, haptic, navigate, returnTo, compact, tab, completeTask, showAlert]
  );

  function onFieldSubmitted() {
    if (fieldTask) completeTask(fieldTask.id);
    setFieldTask(null);
  }

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!tabs.some((t) => t.id === tab) && tabs[0]) {
      setTab(tabs[0].id);
    }
  }, [tab, tabs]);

  useEffect(() => {
    if (!syncTabToUrl) return;
    setSearchParams({ tab }, { replace: true });
  }, [tab, syncTabToUrl, setSearchParams]);

  return (
    <section
      className={`duty-desk${fullPage ? " duty-desk--full" : ""}${compact ? " duty-desk--compact" : ""}`}
      aria-label={DUTY_VERIFICATION_DESK_TITLE}
    >
      <div className="duty-desk__head">
        {!fullPage ? <h2 className="duty-desk__title">{DUTY_VERIFICATION_DESK_TITLE}</h2> : null}
        <div className="duty-desk__head-badges">
          <span className="duty-desk__open-badge">{openCount} Open</span>
          {compact && fullPageLink ? (
            <Link to={fullPageLink} className="duty-desk__all">
              Full Desk
            </Link>
          ) : null}
        </div>
      </div>

      <div className="duty-desk__tabs" role="tablist" aria-label="Duty categories">
        {tabs.map((t) => {
          const count = visibleTasksForTab(t.id, dutyTasks, userId).length;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`duty-desk__tab${isActive ? " duty-desk__tab--active" : ""}`}
              onClick={() => {
                setTab(t.id);
                haptic("light");
              }}
            >
              <span className="duty-desk__tab-label">{t.label}</span>
              <span className="duty-desk__tab-count">({count})</span>
            </button>
          );
        })}
      </div>

      <TaskList tab={tab} tasks={list} handlers={handlers} />

      {fullPage ? (
        <footer className="duty-desk__standard">
          <Shield size={16} aria-hidden />
          <p>
            <strong>Verification standard</strong>
            Field tasks are cross-referenced with geo-coordinates and accredited by district captains.
          </p>
        </footer>
      ) : null}

      <FieldDutySheet
        taskTitle={fieldTask?.title ?? ""}
        open={Boolean(fieldTask)}
        onClose={() => setFieldTask(null)}
        onSubmitted={onFieldSubmitted}
      />
    </section>
  );
}