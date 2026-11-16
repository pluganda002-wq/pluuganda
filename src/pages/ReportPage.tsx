import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { WhistleblowerReportForm } from "@/components/accountability/WhistleblowerReportForm";

export function ReportPage() {
  return (
    <main className="page">
      <PageHeader title="Whistleblower report" subtitle="Submit securely." />
      <WhistleblowerReportForm />
      <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 12 }}>
        ← Accountability dashboard
      </Link>
    </main>
  );
}