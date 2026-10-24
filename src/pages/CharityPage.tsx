import { PageHeader } from "@/components/PageHeader";

const DRIVES = [
  { name: "Medical outreach — rural clinics", raised: "UGX 12.4M", goal: "UGX 20M" },
  { name: "School supplies — term three", raised: "UGX 8.1M", goal: "UGX 15M" },
  { name: "Clean water — community boreholes", raised: "UGX 22M", goal: "UGX 30M" },
];

export function CharityPage() {
  return (
    <main className="page">
      <PageHeader
        title="Charity programmes"
        subtitle="Volunteer-led care initiatives aligned with PLU community service."
      />
      {DRIVES.map((d) => (
        <div key={d.name} className="card">
          <strong>{d.name}</strong>
          <p style={{ margin: "8px 0", color: "var(--plu-gold)", fontSize: "0.9rem" }}>
            {d.raised} of {d.goal}
          </p>
          <button type="button" className="btn btn-primary">
            Contribute (coming soon)
          </button>
        </div>
      ))}
    </main>
  );
}
