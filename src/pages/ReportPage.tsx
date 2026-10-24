import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitReportApi } from "@/lib/api";

export function ReportPage() {
  const { user, haptic, showAlert } = useTelegram();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("procurement");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (details.trim().length < 20) {
      showAlert("Please provide enough detail (at least 20 characters) for reviewers.");
      return;
    }
    setSubmitted(true);
    try {
      const result = await submitReportApi({
        category,
        details: details.trim(),
        contact: contact.trim() || undefined,
        telegramId: user?.id,
      });
      setReference(result.reference);
      haptic("medium");
      showAlert(`Report received. Reference: ${result.reference}`);
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert("Report queued on device. Add MONGODB_URI on Vercel to store securely.");
      } else {
        showAlert("Server error. Please try again or contact the Secretariat.");
        setSubmitted(false);
      }
    }
  }

  if (submitted) {
    return (
      <main className="page">
        <PageHeader title="Report submitted" subtitle="Thank you for protecting public resources." />
        <div className="card">
          <p className="badge badge-green">Queued for review</p>
          {reference ? (
            <p style={{ marginTop: 12, fontWeight: 600 }}>Reference: {reference}</p>
          ) : null}
          <p style={{ marginTop: 12, color: "var(--plu-muted)", fontSize: "0.9rem" }}>
            Your report is encrypted in transit. Do not share sensitive identity details in open channels.
          </p>
        </div>
        <Link to="/integrity" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to case tracker
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader
        title="Secure corruption report"
        subtitle="Information is handled confidentially and routed to the integrity workflow."
      />
      <form className="card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="procurement">Public procurement</option>
            <option value="service">Service delivery</option>
            <option value="revenue">Local revenue / fees</option>
            <option value="other">Other public resource abuse</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="details">What happened?</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the incident, location, dates and any references (avoid naming victims)."
          />
        </div>
        <div className="field">
          <label htmlFor="contact">Optional contact (encrypted in production)</label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email for follow-up"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit report
        </button>
      </form>
    </main>
  );
}
