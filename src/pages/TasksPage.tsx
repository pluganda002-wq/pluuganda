import { AccountabilityTasksPanel } from "@/components/accountability/AccountabilityTasksPanel";
import { Link } from "react-router-dom";

export function TasksPage() {
  return (
    <main className="page prog-dash__tasks-page">
      <header className="prog-dash__head" style={{ padding: "0 18px", marginTop: 8 }}>
        <p className="prog-dash__tag">Earn points</p>
        <h1 className="prog-dash__title">Accountability tasks</h1>
      </header>
      <div style={{ padding: "0 18px 24px" }}>
        <AccountabilityTasksPanel />
        <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 16, width: "100%" }}>
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}