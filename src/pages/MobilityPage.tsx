import { PageHeader } from "@/components/PageHeader";
import { MOBILITY_SERVICES } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";

export function MobilityPage() {
  const { showAlert } = useTelegram();

  return (
    <main className="page">
      <PageHeader
        title="Mobility & transport hubs"
        subtitle="UGo Ride, Tugende safe boda and trucking coordination for PLU mobilisation."
      />
      {MOBILITY_SERVICES.map((s) => (
        <div key={s.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
            <strong>{s.name}</strong>
            <span className="badge badge-blue">{s.status}</span>
          </div>
          <p style={{ margin: "10px 0", color: "var(--plu-muted)", fontSize: "0.88rem" }}>{s.desc}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => showAlert(`${s.name} partner API will connect in the next release.`)}
          >
            Request ride / link account
          </button>
        </div>
      ))}
    </main>
  );
}
