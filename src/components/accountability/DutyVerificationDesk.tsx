import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  DUTY_TABS,
  DUTY_TASKS,
  DUTY_VERIFICATION_DESK_TITLE,
  type DutyKind,
  type DutyTab,
  type DutyTask,
} from "@/data/dutyVerification";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { FieldDutySheet } from "@/components/accountability/FieldDutySheet";
import { Layers, Lock, Shield, Wifi } from "lucide-react";
import "./DutyVerificationDesk.css";

type Props = {
  compact?: boolean;
  fullPageLink?: string;
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

function tabCount(id: DutyTab) {
  if (id === "all") return DUTY_TASKS.length;
  return DUTY_TASKS.filter((t) => t.kind === id).length;
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
  onDigital: (task: DutyTask) => void;
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
        onDigital={() => handlers.onDigital(task)}
        onAdvanced={() => handlers.onAdvanced(task)}
      />
    </li>
  );
}

export function DutyVerificationDesk({
  compact = false,
  fullPageLink = "/programmes/tasks",
}: Props) {
  const [tab, setTab] = useState<DutyTab>("all");
  const [fieldTask, setFieldTask] = useState<DutyTask | null>(null);
  const { completedTasks, completeTask } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const navigate = useNavigate();

  const filtered = useMemo(() => filterByTab(tab, DUTY_TASKS), [tab]);
  const flatList = useMemo(() => {
    if (tab === "all") return filtered;
    return compact ? filtered.slice(0, 3) : filtered;
  }, [tab, filtered, compact]);

  const handlers: RowHandlers = useMemo(
    () => ({
      completedTasks,
      userId: user?.id,
      onField: (task: DutyTask) => {
        if (completedTasks.includes(task.id)) return;
        haptic("light");
        setFieldTask(task);
      },
      onDigital: (task: DutyTask) => {
        haptic("light");
        if (task.actionTo) {
          navigate(task.actionTo);
          return;
        }
        completeTask(task.id);
        showAlert("Activity logged. Points apply when verified.");
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
    [completedTasks, user?.id, haptic, navigate, completeTask, showAlert]
  );

  function onFieldSubmitted() {
    if (fieldTask) completeTask(fieldTask.id);
    setFieldTask(null);
  }

  const sectionsForAll = useMemo(() => {
    if (tab !== "all") return null;
    return ALL_SECTIONS.map((section) => ({
      ...section,
      tasks: DUTY_TASKS.filter((t) => t.kind === section.kind),
    })).filter((s) => s.tasks.length > 0);
  }, [tab]);

  const hideAdvancedOnCompact = compact && tab === "all";

  useEffect(() => {
    if (tab === "field" && !DUTY_TASKS.some((t) => t.kind === "field")) {
      setTab("all");
    }
  }, [tab]);

  return (
    <section className="duty-desk" aria-labelledby="duty-desk-title">
      <div className="duty-desk__head">
        <h2 id="duty-desk-title">{DUTY_VERIFICATION_DESK_TITLE}</h2>
        {compact && tab !== "all" ? (
          <Link to={fullPageLink} className="duty-desk__all">
            All
          </Link>
        ) : null}
      </div>

      <div
        className="duty-desk__tabs"
        role="tablist"
        aria-label="Duty categories"
        data-tab-count={DUTY_TABS.filter(
          (t) => t.id === "all" || DUTY_TASKS.some((task) => task.kind === t.id)
        ).length}
      >
        {DUTY_TABS.filter(
          (t) => t.id === "all" || DUTY_TASKS.some((task) => task.kind === t.id)
        ).map((t) => {
          const Icon = TAB_ICONS[t.id];
          const count = tabCount(t.id);
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`duty-desk__tab duty-desk__tab--${t.id}${tab === t.id ? " duty-desk__tab--on" : ""}`}
              onClick={() => {
                setTab(t.id);
                haptic("light");
              }}
            >
              <span className="duty-desk__tab-icon" aria-hidden>
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <span className="duty-desk__tab-label">{t.label}</span>
              <span className="duty-desk__tab-count">{count}</span>
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
