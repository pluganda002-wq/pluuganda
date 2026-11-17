import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { PublicEndorsementForm } from "@/components/endorsement/PublicEndorsementForm";
import { ENDORSEMENT_CAMPAIGN } from "@/data/endorsementCampaign";
import { PLU_STATS } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import "@/pages/EndorsePage.css";

export function EndorsePage() {
  const { endorsed } = useUser();

  return (
    <main className="page">
      <PageHeader title="Public endorsement" subtitle="Presidential endorsement campaign — aligned with plu.org.ug." />

      <section className="endorse-hero card" aria-labelledby="endorse-campaign-headline">
        <p className="endorse-hero__eyebrow">{ENDORSEMENT_CAMPAIGN.eyebrow}</p>
        <h1 id="endorse-campaign-headline" className="endorse-hero__headline">
          {ENDORSEMENT_CAMPAIGN.headline}
        </h1>
        <p className="endorse-hero__lead">{ENDORSEMENT_CAMPAIGN.lead}</p>
      </section>

      <StatGrid
        stats={[
          {
            label: "Recorded",
            value: PLU_STATS.endorsements + (endorsed ? 1 : 0),
          },
          { label: "Districts", value: PLU_STATS.districts },
          { label: "Campaign", value: "2031" },
        ]}
      />

      <p className="endorse-meta-line">{ENDORSEMENT_CAMPAIGN.onePerId}</p>

      <PublicEndorsementForm />
    </main>
  );
}