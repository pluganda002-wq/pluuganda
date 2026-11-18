import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { readReturnTo } from "@/lib/dutyNavigation";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import "./DigitalDutyPage.css";

export function DigitalDutyPage() {
  const { dutyId } = useParams<{ dutyId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { completeTask, completedTasks } = useUser();
  const { haptic, showAlert, webApp } = useTelegram();

  const dutyTasks = useDutyTasks();
  const task = dutyTasks.find((t) => t.id === dutyId && t.kind === "digital");
  const returnTo = readReturnTo(state) ?? "/programmes/tasks?tab=digital";
  const done = task ? completedTasks.includes(task.id) : false;

  if (!task) {
    return (
      <main className="page digital-duty">
        <p>Duty not found.</p>
        <Link to={returnTo} className="btn btn-ghost">
          Back to desk
        </Link>
      </main>
    );
  }

  function onPrimary() {
    if (!task || done) return;
    haptic("light");
    if (task.externalUrl) {
      try {
        webApp.openLink(task.externalUrl);
      } catch {
        window.open(task.externalUrl, "_blank", "noopener,noreferrer");
      }
      completeTask(task.id);
      showAlert("Channel link opened. Points apply once verified.");
      return;
    }
    if (task.actionTo) {
      navigate(task.actionTo, { state: { returnTo } });
      return;
    }
    completeTask(task.id);
    showAlert("Activity logged. Points apply when verified.");
  }

  return (
    <main className="page digital-duty">
      <div className="digital-duty__card">
        <p className="digital-duty__tag">{task.subtitle}</p>
        <h1 className="digital-duty__title">{task.title}</h1>
        <p className="digital-duty__pts">{task.points} pts</p>
        {task.instructions ? <p className="digital-duty__body">{task.instructions}</p> : null}
        <button
          type="button"
          className={`digital-duty__cta duty-desk__action${done ? " digital-duty__cta--done duty-desk__action--done" : ""}`}
          disabled={done}
          onClick={onPrimary}
        >
          <span className="duty-desk__action-text">{done ? "Completed" : task.cta}</span>
        </button>
      </div>
    </main>
  );
}