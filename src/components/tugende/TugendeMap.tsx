import { useEffect, useRef } from "react";
import { Crosshair } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TugendeMap.css";

type Point = { lat: number; lng: number };

const DEFAULT_CENTER: Point = { lat: 0.3476, lng: 32.5825 };
/** Wider neighborhood view on home; closer follow during active trip. */
const DEFAULT_ZOOM = 14;
const TRIP_FOLLOW_ZOOM = 16;
const MIN_MOVE_KM_FOR_PAN = 0.08;
const RIDER_BODA_IMG = "/branding/tugende-safe-boda.png";

export type MapNearbyRider = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  assigned?: boolean;
};

/** CARTO Voyager needs a Basemaps key. Use VITE_CARTO_RASTER_URL (from email) or VITE_CARTO_API_KEY. */
function resolveMapTiles(): { url: string; attribution: string; maxZoom: number } {
  const cartoAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

  const rasterFromEmail = (import.meta.env.VITE_CARTO_RASTER_URL ?? "").trim();
  if (rasterFromEmail && rasterFromEmail.includes("{z}") && rasterFromEmail.includes("{x}")) {
    return { url: rasterFromEmail, attribution: cartoAttribution, maxZoom: 20 };
  }

  const cartoKey = (import.meta.env.VITE_CARTO_API_KEY ?? "").trim();
  if (cartoKey) {
    return {
      url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoKey)}`,
      attribution: cartoAttribution,
      maxZoom: 20,
    };
  }
  return {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  };
}

function haversineKm(a: Point, b: Point): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function makeYouIcon() {
  return L.divIcon({
    className: "tugende-map-you",
    html: `<span class="tugende-map-you__beam"></span><span class="tugende-map-you__pulse"></span><span class="tugende-map-you__dot"></span>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function makeRiderIcon(assigned: boolean) {
  const cls = assigned ? " tugende-map-rider--assigned" : "";
  return L.divIcon({
    className: `tugende-map-rider${cls}`,
    html: `<img src="${RIDER_BODA_IMG}" alt="" width="36" height="36" />`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function makeDestIcon() {
  return L.divIcon({
    className: "tugende-map-marker",
    html: '<span style="background:#111"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

type Props = {
  you: Point | null;
  destination?: Point | null;
  path?: Point[];
  size?: "default" | "large" | "fullscreen" | "hero";
  pickMode?: boolean;
  followYou?: boolean;
  /** When true, map stays put while GPS updates (marker moves, no bounce). */
  stableCamera?: boolean;
  onPickDestination?: (point: Point) => void;
  onRecenter?: () => void;
  nearbyRiders?: MapNearbyRider[];
  className?: string;
};

export function TugendeMap({
  you,
  destination,
  path,
  size = "default",
  pickMode = false,
  followYou = false,
  stableCamera = true,
  onPickDestination,
  onRecenter,
  nearbyRiders,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const youMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const lastBoundsKeyRef = useRef("");
  const didInitialCenterRef = useRef(false);
  const lastPanPointRef = useRef<Point | null>(null);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tiles = resolveMapTiles();
    L.tileLayer(tiles.url, {
      maxZoom: tiles.maxZoom,
      attribution: tiles.attribution,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      didInitialCenterRef.current = false;
      lastPanPointRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = setTimeout(() => {
      map.invalidateSize({ animate: false });
      if (!you) return;
      const zoom = stableCamera ? DEFAULT_ZOOM : TRIP_FOLLOW_ZOOM;
      if (followYou || pickMode) {
        map.setView([you.lat, you.lng], zoom, { animate: false });
        lastPanPointRef.current = you;
        didInitialCenterRef.current = true;
      }
    }, 120);
    return () => clearTimeout(t);
  }, [size, you, followYou, pickMode, stableCamera]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onPickDestination) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onPickDestination({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onPickDestination]);

  function panToYou(point: Point, zoom: number, animate: boolean) {
    const map = mapRef.current;
    if (!map) return;
    map.setView([point.lat, point.lng], zoom, { animate });
    lastPanPointRef.current = point;
  }

  function maybeFollowYou(point: Point) {
    if (!followYou) return;
    const zoom = stableCamera ? DEFAULT_ZOOM : TRIP_FOLLOW_ZOOM;
    if (stableCamera) {
      if (!didInitialCenterRef.current) {
        panToYou(point, zoom, false);
        didInitialCenterRef.current = true;
      }
      return;
    }
    const last = lastPanPointRef.current;
    if (!last || haversineKm(last, point) >= MIN_MOVE_KM_FOR_PAN) {
      panToYou(point, zoom, true);
    }
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (you) {
      if (!youMarkerRef.current) {
        youMarkerRef.current = L.marker([you.lat, you.lng], { icon: makeYouIcon(), zIndexOffset: 1000 }).addTo(map);
      } else {
        youMarkerRef.current.setLatLng([you.lat, you.lng]);
      }
      maybeFollowYou(you);
    }

    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: makeDestIcon() }).addTo(map);
        destMarkerRef.current.bindTooltip("Dropoff", { direction: "top", offset: [0, -8] });
      } else {
        destMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (you && destination && !path?.length) {
      const latlngs: L.LatLngExpression[] = [
        [you.lat, you.lng],
        [destination.lat, destination.lng],
      ];
      if (!routeRef.current) {
        routeRef.current = L.polyline(latlngs, { color: "#8b6914", weight: 4, dashArray: "10 12", opacity: 0.9 }).addTo(map);
      } else {
        routeRef.current.setLatLngs(latlngs);
      }
      const key = `${you.lat.toFixed(4)}:${destination.lat.toFixed(4)}:${destination.lng.toFixed(4)}`;
      if (lastBoundsKeyRef.current !== key) {
        lastBoundsKeyRef.current = key;
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: DEFAULT_ZOOM });
      }
    } else if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    if (path && path.length >= 2) {
      const latlngs = path.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      if (!pathRef.current) {
        pathRef.current = L.polyline(latlngs, { color: "#c9a227", weight: 5, opacity: 0.95 }).addTo(map);
      } else {
        pathRef.current.setLatLngs(latlngs);
      }
      if (followYou && you && !stableCamera) {
        maybeFollowYou(you);
      } else if (!followYou && latlngs.length >= 2) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: DEFAULT_ZOOM });
      }
    } else if (pathRef.current) {
      pathRef.current.remove();
      pathRef.current = null;
    }

    if (you && !destination && !path?.length && pickMode && !didInitialCenterRef.current) {
      panToYou(you, DEFAULT_ZOOM, false);
      didInitialCenterRef.current = true;
    }
  }, [you, destination, path, pickMode, followYou, stableCamera]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const nextIds = new Set((nearbyRiders ?? []).map((r) => r.id));
    for (const [id, marker] of riderMarkersRef.current) {
      if (!nextIds.has(id)) {
        marker.remove();
        riderMarkersRef.current.delete(id);
      }
    }
    for (const rider of nearbyRiders ?? []) {
      let marker = riderMarkersRef.current.get(rider.id);
      if (!marker) {
        marker = L.marker([rider.lat, rider.lng], {
          icon: makeRiderIcon(Boolean(rider.assigned)),
          zIndexOffset: rider.assigned ? 900 : 400,
        }).addTo(map);
        if (rider.label) {
          marker.bindTooltip(rider.label, { direction: "top", offset: [0, -14] });
        }
        riderMarkersRef.current.set(rider.id, marker);
      } else {
        marker.setLatLng([rider.lat, rider.lng]);
        marker.setIcon(makeRiderIcon(Boolean(rider.assigned)));
      }
    }
  }, [nearbyRiders]);

  function recenter() {
    if (!you) return;
    panToYou(you, DEFAULT_ZOOM, true);
    didInitialCenterRef.current = true;
    onRecenter?.();
  }

  const sizeClass =
    size === "hero"
      ? " tugende-map--hero"
      : size === "fullscreen"
        ? " tugende-map--fullscreen"
        : size === "large"
          ? " tugende-map--large"
          : "";
  const pickClass = pickMode ? " tugende-map--pick" : "";

  return (
    <div className={`tugende-map-shell${sizeClass}${pickClass}${className ? ` ${className}` : ""}`}>
      <div ref={hostRef} className="tugende-map" aria-label="Ride map" />
      {you && onRecenter !== undefined ? (
        <button type="button" className="tugende-map__recenter" onClick={recenter} aria-label="Center on my location">
          <Crosshair size={20} />
        </button>
      ) : null}
    </div>
  );
}
