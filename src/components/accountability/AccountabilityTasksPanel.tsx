import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ACCOUNTABILITY_TASKS, type TaskChannel } from "@/data/accountabilityTasks";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import "./AccountabilityTasksPanel.css";

type Props = {
  compact?: boolean;
  tasksLink?: string;
};

const TABS: { id: TaskChannel; label: string }[] = [
  { id: "physical", label: "Physical" },
  { id: "digital", label: "Digital" },
];

export function AccountabilityTasksPanel({ compact = false, tasksLink = "/programmes/tasks" }: Props) {
  const [channel, setChannel] = useState<TaskChannel>("physical");
  const { completedTasks, completeTask } = useUser();
  const { haptic, showAlert } = useTelegram();
  const navigate = useNavigate();

  const tasks = ACCOUNTABILITY_TASKS.filter((t) => t.channel === channel);
  const visible = compact ? tasks.slice(0, 3) : tasks;

  function onTaskAction(id: string, actionTo?: string) {
    if (actionTo) {
      haptic("light");
      navigate(actionTo);
      return;
    }
    completeTask(id);
    haptic("medium");
    showAlert("Task logged. Points apply when verified.");
  }

  return (
    <section className="acc-tasks" aria-labelledby="acc-tasks-title">
      <div className="acc-tasks__head">
        <h2 id="acc-tasks-title">Tasks</h2>
        {compact ? (
          <Link to={tasksLink} className="acc-tasks__all">
            All
          </Link>
        ) : null}
      </div>
      <div className="acc-tasks__tabs" role="tablist" aria-label="Task type">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={channel === tab.id}
            className={`acc-tasks__tab${channel === tab.id ? " acc-tasks__tab--on" : ""}`}
            onClick={() => {
              setChannel(tab.id);
              haptic("light");
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ul className="acc-tasks__list">
        {visible.map((t) => {
          const done = !t.actionTo && completedTasks.includes(t.id);
          return (
            <li key={t.id} className="acc-tasks__row">
              <div className="acc-tasks__copy">
                <strong>{t.title}</strong>
                <span className="acc-tasks__pts">{t.points} pts</span>
              </div>
              <button
                type="button"
                className={`acc-tasks__cta${done ? " acc-tasks__cta--done" : ""}`}
                disabled={done}
                onClick={() => onTaskAction(t.id, t.actionTo)}
              >
                {done ? "Done" : t.cta}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}