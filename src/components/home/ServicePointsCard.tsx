import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  POINT_CATEGORIES,
  rankFromPoints,
  type PointCategoryId,
} from "@/data/servicePoints";
import { useTelegram } from "@/hooks/useTelegram";
import "./ServicePointsCard.css";

const SERVICE_ICON = "/branding/plu-service-points-icon.png";

type Props = {
  total: number;
  breakdown: Record<PointCategoryId, number>;
};

export function ServicePointsCard({ total, breakdown }: Props) {
  const { displayName } = useTelegram();
  const { tier, index, nextAt } = rankFromPoints(total);
  const tierLabel = `${tier} · ${index + 1} / ${7}`;

  return (
    <section className="sp-card" aria-label="Service points">
      <div className="sp-card__head">
        <h2 className="sp-card__title">Service points</h2>
        <p className="sp-card__user">Karibu, {displayName}</p>
      </div>

      <div className="sp-card__hero">
        <img src={SERVICE_ICON} alt="" className="sp-card__badge" width={56} height={56} />
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
        {POINT_CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <Link to="/tasks" className={`sp-row sp-row--${cat.tone}`}>
              <span className="sp-row__shield" aria-hidden />
              <span className="sp-row__text">
                <strong>{cat.label}</strong>
                <span>{cat.subtitle}</span>
              </span>
              <span className="sp-row__pts">{breakdown[cat.id].toLocaleString()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
