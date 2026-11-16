import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { dutyReturnPath, openDigitalDuty } from "@/lib/dutyNavigation";
import { useEffect, useMemo, useState } from "react";
import {
  DUTY_TABS,
  DUTY_VERIFICATION_DESK_TITLE,
  type DutyKind,
  type DutyTab,
  type DutyTask,
} from "@/data/dutyVerification";
import { useUser } from "@/context/UserContext";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { useTelegram } from "@/hooks/useTelegram";
import { FieldDutySheet } from "@/components/accountability/FieldDutySheet";
import { Layers, Lock, Shield, Wifi } from "lucide-react";
import "./DutyVerificationDesk.css";

type Props = {
  compact?: boolean;
  fullPageLink?: string;
  /** Full desk page: open Digital tab from ?tab=digital */
  initialTab?: DutyTab;
  syncTabToUrl?: boolean;
};

const ALL_SECTIONS: { kind: DutyKind; title: string }[] = [
  { kind: "field", title: "Field mobilisation" },
  { kind: "digital", title: "Digital" },
  { kind: "advanced", title: "Advanced" },
];

const TAB_ICONS = {
  all: Layers,
  field: Wifi,
  digital: Wifi,
  advanced: Shield,
} as const;

function tabCount(id: DutyTab, tasks: DutyTask[]) {
  if (id === "all") return tasks.length;
  return tasks.filter((t) => t.kind === id).length;
}

function filterByTab(tab: DutyTab, tasks: DutyTask[]) {
  if (tab === "all") return tasks;
  return tasks.filter((t) => t.kind === tab);
}

function isAdvancedLocked(task: DutyTask, userId?: number) {
  if (task.kind !== "advanced") return false;
  if (task.assigneeTelegramId == null) return true;
  return task.assigneeTelegramId !== userId;
}

function DutyCta({
  task,
  done,
  locked,
  onField,
  onDigital,
  onAdvanced,
}: {
  task: DutyTask;
  done: boolean;
  locked: boolean;
  onField: () => void;
  onDigital: () => void;
  onAdvanced: () => void;
}) {
  const label = done ? "Done" : locked ? "Locked" : task.cta;

  function onClick() {
    if (done) return;
    if (task.kind === "field") onField();
    else if (task.kind === "digital") onDigital();
    else onAdvanced();
  }

  return (
    <button
      type="button"
      className={`duty-desk__cta${done ? " duty-desk__cta--done" : ""}${locked ? " duty-desk__cta--locked" : ""}`}
      disabled={done || (locked && task.kind === "advanced")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type RowHandlers = {
  onField: (task: DutyTask) => void;
  openDigital: (task: DutyTask) => void;
  onAdvanced: (task: DutyTask) => void;
  completedTasks: string[];
  userId?: number;
};

function DutyTaskRow({
  task,
  handlers,
}: {
  task: DutyTask;
  handlers: RowHandlers;
}) {
  const done = handlers.completedTasks.includes(task.id);
  const locked = isAdvancedLocked(task, handlers.userId);

  if (task.kind === "digital") {
    return (
      <li>
        <button
          type="button"
          className={`duty-desk__row duty-desk__row--digital duty-desk__row--tap${done ? " duty-desk__row--done" : ""}`}
          disabled={done}
          onClick={() => handlers.openDigital(task)}
        >
          <div className="duty-desk__copy">
            <strong>{task.title}</strong>
            {task.subtitle ? <span>{task.subtitle}</span> : null}
            <b className="duty-desk__pts">{task.points} pts</b>
          </div>
          <span className={`duty-desk__action${done ? " duty-desk__action--done" : ""}`}>
            <span className="duty-desk__action-text">{done ? "Done" : task.cta}</span>
            {!done ? <ChevronRight size={16} strokeWidth={2.5} aria-hidden /> : null}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className={`duty-desk__row duty-desk__row--${task.kind}`}>
      <div className="duty-desk__copy">
        <strong>
          {locked ? <Lock size={14} className="duty-desk__lock" aria-hidden /> : null}
          {task.title}
        </strong>
        {task.subtitle ? <span>{task.subtitle}</span> : null}
        {task.kind === "advanced" && task.assigneeLabel ? <em>{task.assigneeLabel}</em> : null}
        <b className="duty-desk__pts">{task.points} pts</b>
      </div>
      <DutyCta
        task={task}
        done={done}
        locked={locked}
        onField={() => handlers.onField(task)}
        onDigital={() => handlers.openDigital(task)}
        onAdvanced={() => handlers.onAdvanced(task)}
      />
    </li>
  );
}

export function DutyVerificationDesk({
  compact = false,
  fullPageLink = "/programmes/tasks",
  initialTab = "all",
  syncTabToUrl = false,
}: Props) {
  const [tab, setTab] = useState<DutyTab>(initialTab);
  const [, setSearchParams] = useSearchParams();
  const [fieldTask, setFieldTask] = useState<DutyTask | null>(null);
  const dutyTasks = useDutyTasks();
  const { completedTasks, completeTask } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const navigate = useNavigate();

  const filtered = useMemo(() => filterByTab(tab, dutyTasks), [tab, dutyTasks]);
  const flatList = useMemo(() => {
    if (tab === "all") return filtered;
    return compact ? filtered.slice(0, 3) : filtered;
  }, [tab, filtered, compact]);

  const returnTo = useMemo(() => dutyReturnPath(compact, tab), [compact, tab]);

  const handlers: RowHandlers = useMemo(
    () => ({
      completedTasks,
      userId: user?.id,
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
      onAdvanced: (task: DutyTask) => {
        if (isAdvancedLocked(task, user?.id)) {
          haptic("light");
          showAlert(
            task.assigneeLabel
              ? `Assigned duty: ${task.assigneeLabel}. Contact the integrity desk for access.`
              : "This duty is assigned to another patriot."
          );
          return;
        }
        completeTask(task.id);
        haptic("medium");
        showAlert("Advanced duty opened. Follow coordinator instructions.");
      },
    }),
    [completedTasks, user?.id, haptic, navigate, returnTo, completeTask, showAlert]
  );

  function onFieldSubmitted() {
    if (fieldTask) completeTask(fieldTask.id);
    setFieldTask(null);
  }

  const sectionsForAll = useMemo(() => {
    if (tab !== "all") return null;
    return ALL_SECTIONS.map((section) => ({
      ...section,
      tasks: dutyTasks.filter((t) => t.kind === section.kind),
    })).filter((s) => s.tasks.length > 0);
  }, [tab, dutyTasks]);

  const hideAdvancedOnCompact = compact && tab === "all";

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (tab === "field" && !dutyTasks.some((t) => t.kind === "field")) {
      setTab("all");
    }
  }, [tab, dutyTasks]);

  useEffect(() => {
    if (!syncTabToUrl) return;
    if (tab === "all") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  }, [tab, syncTabToUrl, setSearchParams]);

  return (
    <section className="duty-desk" aria-labelledby="duty-desk-title">
      <div className="duty-desk__head">
        <h2 id="duty-desk-title">{DUTY_VERIFICATION_DESK_TITLE}</h2>
        {compact && fullPageLink ? (
          <Link to={fullPageLink} className="duty-desk__all">
            Full desk
          </Link>
        ) : null}
      </div>

      <div className="duty-desk__tabs" role="tablist" aria-label="Duty categories">
        {DUTY_TABS.filter(
          (t) => t.id === "all" || dutyTasks.some((task) => task.kind === t.id)
        ).map((t) => {
          const Icon = TAB_ICONS[t.id];
          const count = tabCount(t.id, dutyTasks);
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`duty-desk__tab duty-desk__tab--${t.id}${isActive ? " duty-desk__tab--active" : ""}`}
              onClick={() => {
                setTab(t.id);
                haptic("light");
              }}
            >
              <span className="duty-desk__tab-icon" aria-hidden>
                <Icon size={15} strokeWidth={2.25} />
              </span>
              <span className="duty-desk__tab-label">
                {t.label}
                {isActive ? (
                  <span className="duty-desk__tab-count" aria-label={`${count} duties`}>
                    {count}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "all" && sectionsForAll ? (
        <AllSections sections={sectionsForAll} handlers={handlers} hideAdvanced={hideAdvancedOnCompact} />
      ) : (
        <ul className="duty-desk__list">
          {flatList.map((task) => (
            <DutyTaskRow key={task.id} task={task} handlers={handlers} />
          ))}
        </ul>
      )}

      <FieldDutySheet
        taskTitle={fieldTask?.title ?? ""}
        open={Boolean(fieldTask)}
        onClose={() => setFieldTask(null)}
        onSubmitted={onFieldSubmitted}
      />
    </section>
  );
}

function AllSections({
  sections,
  handlers,
  hideAdvanced,
}: {
  sections: { kind: DutyKind; title: string; tasks: DutyTask[] }[];
  handlers: RowHandlers;
  hideAdvanced: boolean;
}) {
  return (
    <div className="duty-desk__groups">
      {sections.map((section) => {
        if (hideAdvanced && section.kind === "advanced") return null;
        return (
          <div key={section.kind} className="duty-desk__group">
            <h3 className="duty-desk__group-title">{section.title}</h3>
            <ul className="duty-desk__list">
              {section.tasks.map((task) => (
                <DutyTaskRow key={task.id} task={task} handlers={handlers} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
