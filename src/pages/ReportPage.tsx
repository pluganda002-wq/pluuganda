import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { WhistleblowerReportForm } from "@/components/accountability/WhistleblowerReportForm";
import { CIVIC_WATCH_FORM_TITLE, ACCOUNTABILITY_DASHBOARD } from "@/data/accountabilityProgramme";

export function ReportPage() {
  return (
    <main className="page">
      <PageHeader title={CIVIC_WATCH_FORM_TITLE} subtitle="Submit securely." />
      <WhistleblowerReportForm />
      <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 12 }}>
        ← {ACCOUNTABILITY_DASHBOARD.title}
      </Link>
    </main>
  );
}