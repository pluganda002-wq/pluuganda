import { DutyVerificationDesk } from "@/components/accountability/DutyVerificationDesk";
import { DUTY_VERIFICATION_DESK_TITLE } from "@/data/dutyVerification";
import { Link } from "react-router-dom";
import { ACCOUNTABILITY_DASHBOARD } from "@/data/accountabilityProgramme";

export function TasksPage() {
  return (
    <main className="page prog-dash__tasks-page">
      <header className="prog-dash__head" style={{ padding: "0 18px", marginTop: 8 }}>
        <p className="prog-dash__tag">Earn points</p>
        <h1 className="prog-dash__title">{DUTY_VERIFICATION_DESK_TITLE}</h1>
      </header>
      <div style={{ padding: "0 18px 24px" }}>
        <DutyVerificationDesk />
        <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 16, width: "100%" }}>
          ← {ACCOUNTABILITY_DASHBOARD.title}
        </Link>
      </div>
    </main>
  );
}