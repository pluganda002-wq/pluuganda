import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";

const TASKS = [
  {
    id: "t1",
    title: "Share official PLU update",
    desc: "Forward today's Secretariat message to 5 patriots in your district.",
    points: 50,
  },
  {
    id: "t2",
    title: "Baraza attendance",
    desc: "Register attendance at your next district baraza.",
    points: 120,
  },
  {
    id: "t3",
    title: "Integrity ambassador",
    desc: "Complete the civic module on protecting public resources.",
    points: 80,
  },
];

export function TasksPage() {
  const { completedTasks, completeTask } = useUser();
  const { haptic, showAlert } = useTelegram();

  return (
    <main className="page">
      <PageHeader
        title="Special tasks"
        subtitle="Patriotic missions that reward service, mobilisation and learning."
      />
      {TASKS.map((t) => {
        const done = completedTasks.includes(t.id);
        return (
          <div key={t.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{t.title}</strong>
              <span className="badge badge-gold">{t.points} pts</span>
            </div>
            <p style={{ margin: "8px 0", color: "var(--plu-muted)", fontSize: "0.88rem" }}>{t.desc}</p>
            <button
              type="button"
              className={done ? "btn btn-secondary" : "btn btn-primary"}
              disabled={done}
              onClick={() => {
                completeTask(t.id);
                haptic("medium");
                showAlert("Task marked complete. Thank you for serving Uganda.");
              }}
            >
              {done ? "Completed" : "Mark complete"}
            </button>
          </div>
        );
      })}
    </main>
  );
}
