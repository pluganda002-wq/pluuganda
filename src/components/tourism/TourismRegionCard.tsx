import { Link } from "react-router-dom";
import type { TourismRegionEntry } from "@/types/serviceContent";

type Props = {
  region: TourismRegionEntry;
};

export function TourismRegionCard({ region }: Props) {
  return (
    <Link to={`/tourism/region/${region.id}`} className="card tourism-region-card">
      <div className="tourism-region-card__media">
        <img src={region.coverImage} alt="" loading="lazy" />
      </div>
      <div className="tourism-region-card__body">
        <strong>{region.name}</strong>
        <p className="tourism-region__highlights">{region.highlights}</p>
        <p className="tourism-region__tip">{region.tip}</p>
        <span className="tourism-region-card__cta">View photos →</span>
      </div>
    </Link>
  );
}