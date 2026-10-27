import { MapPin, Navigation, Search, X } from "lucide-react";
import type { PlaceResult } from "@/lib/tugende/geo";
import "./TugendeRouteSheet.css";

type Props = {
  pickupLabel: string;
  pickupLoading?: boolean;
  dropoffQuery: string;
  dropoffLabel?: string | null;
  suggestions: PlaceResult[];
  searching?: boolean;
  onDropoffQueryChange: (value: string) => void;
  onSelectPlace: (place: PlaceResult) => void;
  onClearDropoff: () => void;
  onUseMapPick?: () => void;
  onRefreshPickup?: () => void;
};

function formatDistance(km?: number) {
  if (km == null) return "";
  if (km < 1) return "<1 km";
  return `${km.toFixed(1)} km`;
}

export function TugendeRouteSheet({
  pickupLabel,
  pickupLoading,
  dropoffQuery,
  dropoffLabel,
  suggestions,
  searching,
  onDropoffQueryChange,
  onSelectPlace,
  onClearDropoff,
  onUseMapPick,
  onRefreshPickup,
}: Props) {
  const showSuggestions = dropoffQuery.trim().length >= 2 && !dropoffLabel;

  return (
    <div className="tugende-route">
      <div className="tugende-route__header">
        <h2 className="tugende-route__title">Route</h2>
      </div>

      <div className="tugende-route__fields">
        <div className="tugende-route__rail" aria-hidden />
        <div className="tugende-route__row">
          <span className="tugende-route__dot tugende-route__dot--pickup" />
          <div className="tugende-route__input-wrap">
            <input
              className="tugende-route__input"
              readOnly
              value={pickupLoading ? "Finding your location…" : pickupLabel}
              aria-label="Pickup location"
            />
            {onRefreshPickup ? (
              <button type="button" className="tugende-route__icon-btn" onClick={onRefreshPickup} aria-label="Refresh pickup">
                <Navigation size={18} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="tugende-route__row">
          <span className="tugende-route__dot tugende-route__dot--drop" />
          <div className="tugende-route__input-wrap tugende-route__input-wrap--grow">
            <Search size={18} className="tugende-route__search-icon" aria-hidden />
            <input
              className="tugende-route__input tugende-route__input--drop"
              placeholder="Dropoff location"
              value={dropoffLabel ?? dropoffQuery}
              onChange={(e) => {
                if (dropoffLabel) onClearDropoff();
                onDropoffQueryChange(e.target.value);
              }}
              aria-label="Dropoff location"
            />
            {(dropoffLabel || dropoffQuery) ? (
              <button
                type="button"
                className="tugende-route__icon-btn"
                onClick={() => {
                  onClearDropoff();
                  onDropoffQueryChange("");
                }}
                aria-label="Clear dropoff"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {onUseMapPick ? (
        <button type="button" className="tugende-route__map-pick" onClick={onUseMapPick}>
          <MapPin size={18} aria-hidden />
          Choose on map
        </button>
      ) : null}

      {showSuggestions ? (
        <ul className="tugende-route__suggestions" aria-label="Place suggestions">
          {searching ? <li className="tugende-route__suggestion tugende-route__suggestion--wait">Searching…</li> : null}
          {!searching && suggestions.length === 0 ? (
            <li className="tugende-route__suggestion tugende-route__suggestion--wait">No places found — try map or another name.</li>
          ) : null}
          {suggestions.map((place) => (
            <li key={`${place.lat}:${place.lng}:${place.title}`}>
              <button type="button" className="tugende-route__suggestion" onClick={() => onSelectPlace(place)}>
                <MapPin size={18} className="tugende-route__pin" aria-hidden />
                <span className="tugende-route__suggestion-text">
                  <strong>{place.title}</strong>
                  <span>{place.subtitle}</span>
                </span>
                <span className="tugende-route__distance">{formatDistance(place.distanceKm)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
