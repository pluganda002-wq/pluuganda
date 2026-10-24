import { PageHeader } from "@/components/PageHeader";
import { EDUCATION_MODULES } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";

export function EducationPage() {
  const { showAlert } = useTelegram();

  return (
    <main className="page">
      <PageHeader
        title="Educational content"
        subtitle="Civic education aligned with PLU programmes — citizenship, unity and integrity."
      />
      {EDUCATION_MODULES.map((m) => (
        <div key={m.id} className="card">
          <strong>{m.title}</strong>
          <p style={{ margin: "6px 0 12px", color: "var(--plu-muted)", fontSize: "0.85rem" }}>
            {m.duration} read · PLU Civic Desk
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => showAlert(`${m.title} — video and PDF coming in v0.2.`)}>
            Start module
          </button>
        </div>
      ))}
    </main>
  );
}
