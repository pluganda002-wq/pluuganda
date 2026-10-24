import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useTelegram } from "@/hooks/useTelegram";

export function CsrPage() {
  const { showAlert } = useTelegram();
  const [org, setOrg] = useState("");
  const [proposal, setProposal] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    showAlert("CSR partnership request saved locally (demo). Secretariat will contact you.");
  }

  return (
    <main className="page">
      <PageHeader
        title="Corporate social responsibility"
        subtitle="Partner with PLU on national development, community projects and accountable service."
      />
      <form className="card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="org">Organisation</label>
          <input id="org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Company / institution" />
        </div>
        <div className="field">
          <label htmlFor="proposal">Partnership proposal</label>
          <textarea
            id="proposal"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Describe focus area, districts and expected community impact..."
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit partnership interest
        </button>
      </form>
    </main>
  );
}
