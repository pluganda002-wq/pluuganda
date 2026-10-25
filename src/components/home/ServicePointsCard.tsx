import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PLU_STATS } from "@/data/plu";
import { rankFromPoints } from "@/data/servicePoints";
import { StatGrid } from "@/components/StatGrid";
import "./ServicePointsCard.css";

const SERVICE_POINTS_ICON = "/branding/plu-service-points-icon.png";

type Props = {
  total: number;
};

export function ServicePointsCard({ total }: Props) {
  const { tier, index, nextAt } = rankFromPoints(total);
  const tierLabel = `${tier} · ${index + 1} / ${7}`;

  return (
    <section className="sp-card" aria-label="Service points">
      <div className="sp-card__head">
        <h2 className="sp-card__title">Service points</h2>
      </div>

      <div className="sp-card__hero">
        <img src={SERVICE_POINTS_ICON} alt="" className="sp-card__badge" width={56} height={56} />
        <div className="sp-card__total-wrap">
          <span className="sp-card__total">{total.toLocaleString()}</span>
          <Link to="/leadership" className="sp-card__rank">
            <span>{tierLabel}</span>
            <span className="sp-card__rank-hint">Tap for ranks</span>
            <ChevronRight size={14} aria-hidden />
          </Link>
          {nextAt != null ? (
            <p className="sp-card__next">{nextAt - total} pts to next rank</p>
          ) : null}
        </div>
      </div>

      <ul className="sp-card__list">
        <li className="sp-card__stats-block">
          <p className="sp-card__stats-title">Endorsement statistics</p>
          <StatGrid
            stats={[
              { value: PLU_STATS.endorsements, label: "Recorded" },
              { value: PLU_STATS.districts, label: "Districts" },
              { value: PLU_STATS.members, label: "Members" },
            ]}
          />
        </li>
      </ul>
    </section>
  );
}
