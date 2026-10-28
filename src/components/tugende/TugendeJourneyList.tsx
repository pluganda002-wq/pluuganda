import { MapPin, RefreshCw, Route } from "lucide-react";
import type { LatLng } from "@/lib/tugende/geo";
import type { TugendeRide, TugendeRole } from "@/lib/tugende/types";
import "./TugendeJourneyList.css";

function placeLabel(p: LatLng) {
  if (p.label?.trim()) return p.label.trim();
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
}

function formatWhen(iso?: string) {
  if (!iso) return "Earlier trip";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Earlier trip";
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  rides: TugendeRide[];
  viewerId: string;
  viewerRole: TugendeRole;
  loading?: boolean;
  onRefresh?: () => void;
  /** Hide list header (e.g. when embedded under another section title). */
  compact?: boolean;
};

export function TugendeJourneyList({ rides, viewerId, viewerRole, loading, onRefresh, compact }: Props) {
  if (loading && rides.length === 0) {
    return (
      <div className="tugende-journeys tugende-journeys--loading">
        <p>Loading your trips…</p>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="tugende-journeys tugende-journeys--empty">
        <div className="tugende-journeys__empty-icon" aria-hidden>
          <Route size={28} strokeWidth={1.75} />
        </div>
        <p className="tugende-journeys__empty-title">No past trips yet</p>
        <p className="tugende-journeys__empty-lead">
          {viewerRole === "driver"
            ? "Completed and cancelled rides you drove will appear here."
            : "Your finished and cancelled journeys will show up here."}
        </p>
        {onRefresh ? (
          <button type="button" className="btn btn-secondary tugende-journeys__refresh" onClick={onRefresh}>
            <RefreshCw size={16} /> Refresh
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="tugende-journeys">
      {!compact ? (
        <div className="tugende-journeys__head">
          <h2 className="tugende-journeys__title">Past trips</h2>
          {onRefresh ? (
            <button type="button" className="tugende-journeys__refresh-btn" onClick={onRefresh} aria-label="Refresh trips">
              <RefreshCw size={18} className={loading ? "tugende-journeys__spin" : undefined} />
            </button>
          ) : null}
        </div>
      ) : null}
      <ul className="tugende-journeys__list">
        {rides.map((ride) => {
          const asPassenger = ride.riderId === viewerId;
          const asDriver = ride.driverId === viewerId;
          const roleTag =
            viewerRole === "driver" && asDriver
              ? "You drove"
              : asPassenger
                ? "You rode"
                : asDriver
                  ? "You drove"
                  : "Trip";
          const completed = ride.status === "completed";
          return (
            <li key={ride.rideId} className="tugende-journey-card">
              <div className="tugende-journey-card__top">
                <span className={`tugende-journey-card__status tugende-journey-card__status--${ride.status}`}>
                  {completed ? "Completed" : "Cancelled"}
                </span>
                <span className="tugende-journey-card__role">{roleTag}</span>
              </div>
              <time className="tugende-journey-card__when">{formatWhen(ride.endedAt ?? ride.createdAt)}</time>
              <div className="tugende-journey-card__route">
                <div className="tugende-journey-card__point">
                  <span className="tugende-journey-card__dot tugende-journey-card__dot--pick" />
                  <span className="tugende-journey-card__place">{placeLabel(ride.pickup)}</span>
                </div>
                <div className="tugende-journey-card__line" aria-hidden />
                <div className="tugende-journey-card__point">
                  <span className="tugende-journey-card__dot tugende-journey-card__dot--drop" />
                  <span className="tugende-journey-card__place">{placeLabel(ride.dropoff)}</span>
                </div>
              </div>
              <div className="tugende-journey-card__foot">
                <span className="tugende-journey-card__meta">
                  <MapPin size={14} aria-hidden />
                  {(ride.distanceKm > 0 ? ride.distanceKm : ride.estimatedKm ?? 0).toFixed(2)} km
                </span>
                {completed ? (
                  <strong className="tugende-journey-card__fare">
                    {asDriver && viewerRole === "driver" ? "+" : ""}UGX {ride.fareUgx.toLocaleString()}
                  </strong>
                ) : (
                  <span className="tugende-journey-card__fare-muted">—</span>
                )}
              </div>
              <p className="tugende-journey-card__id">{ride.rideId}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
