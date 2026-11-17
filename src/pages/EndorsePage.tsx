import { PublicEndorsementForm } from "@/components/endorsement/PublicEndorsementForm";
import { useUser } from "@/context/UserContext";
import { ENDORSEMENT_CAMPAIGN } from "@/data/endorsementCampaign";
import { PLU_STATS } from "@/data/plu";
import "@/pages/EndorsePage.css";

export function EndorsePage() {
  const { endorsed } = useUser();

  return (
    <main className="page page--endorse">
      <section className="endorse-hero card" aria-labelledby="endorse-campaign-headline">
        <p className="endorse-hero__eyebrow">{ENDORSEMENT_CAMPAIGN.eyebrow}</p>
        <h1 id="endorse-campaign-headline" className="endorse-hero__headline">
          {ENDORSEMENT_CAMPAIGN.headline}
        </h1>
        <p className="endorse-hero__lead">{ENDORSEMENT_CAMPAIGN.lead}</p>
      </section>

      <dl className="endorse-stats" aria-label="Endorsement campaign totals">
        <div className="endorse-stats__item">
          <dt className="endorse-stats__value">
            {(PLU_STATS.endorsements + (endorsed ? 1 : 0)).toLocaleString()}
          </dt>
          <dd className="endorse-stats__label">Recorded</dd>
        </div>
        <div className="endorse-stats__item">
          <dt className="endorse-stats__value">{PLU_STATS.districts.toLocaleString()}</dt>
          <dd className="endorse-stats__label">Districts</dd>
        </div>
        <div className="endorse-stats__item">
          <dt className="endorse-stats__value">2031</dt>
          <dd className="endorse-stats__label">Campaign</dd>
        </div>
      </dl>

      <p className="endorse-meta-line">{ENDORSEMENT_CAMPAIGN.onePerId}</p>

      <PublicEndorsementForm />
    </main>
  );
}