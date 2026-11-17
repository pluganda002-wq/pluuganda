import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { readReturnTo } from "@/lib/dutyNavigation";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { FieldVerificationCapture } from "@/components/accountability/FieldVerificationCapture";
import "./FieldDutyPage.css";

export function FieldDutyPage() {
  const { dutyId } = useParams<{ dutyId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dutyTasks = useDutyTasks();
  const { completeTask, completedTasks } = useUser();
  const { haptic, showAlert } = useTelegram();

  const task = dutyTasks.find((t) => t.id === dutyId && t.kind === "field");
  const returnTo = readReturnTo(state) ?? "/programmes/tasks?tab=field";
  const done = task ? completedTasks.includes(task.id) : false;

  if (!task) {
    return (
      <main className="page field-duty-page">
        <p>Field duty not found.</p>
        <Link to={returnTo} className="btn btn-ghost">
          Back to desk
        </Link>
      </main>
    );
  }

  function submitForApproval() {
    if (!task || done) return;
    haptic("medium");
    showAlert("Field duty submitted for approval. Points apply once verified.");
    completeTask(task.id);
    navigate(returnTo);
  }

  return (
    <main className="page field-duty-page">
      <FieldVerificationCapture task={task} onSubmit={submitForApproval} />
    </main>
  );
}