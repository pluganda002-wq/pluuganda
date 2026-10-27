import { useEffect, useRef } from "react";
import { Crosshair } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TugendeMap.css";

type Point = { lat: number; lng: number };

const DEFAULT_CENTER: Point = { lat: 0.3476, lng: 32.5825 };
const FOLLOW_ZOOM = 15;

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

function makeYouIcon() {
  return L.divIcon({
    className: "tugende-map-you",
    html: '<span class="tugende-map-you__pulse"></span><span class="tugende-map-you__dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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
  onPickDestination?: (point: Point) => void;
  onRecenter?: () => void;
  className?: string;
};

export function TugendeMap({
  you,
  destination,
  path,
  size = "default",
  pickMode = false,
  followYou = false,
  onPickDestination,
  onRecenter,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const youMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const lastBoundsKeyRef = useRef("");

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);

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
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, [size]);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (you) {
      if (!youMarkerRef.current) {
        youMarkerRef.current = L.marker([you.lat, you.lng], { icon: makeYouIcon(), zIndexOffset: 1000 }).addTo(map);
      } else {
        youMarkerRef.current.setLatLng([you.lat, you.lng]);
      }
      if (followYou || pickMode) {
        map.setView([you.lat, you.lng], FOLLOW_ZOOM, { animate: true });
      }
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
        map.fitBounds(L.latLngBounds(latlngs), { padding: [72, 72], maxZoom: 15 });
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
      if (followYou && you) {
        map.setView([you.lat, you.lng], FOLLOW_ZOOM, { animate: true });
      } else if (!followYou && latlngs.length >= 2) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [56, 56], maxZoom: 15 });
      }
    } else if (pathRef.current) {
      pathRef.current.remove();
      pathRef.current = null;
    }

    if (you && !destination && !path?.length) {
      map.setView([you.lat, you.lng], FOLLOW_ZOOM, { animate: true });
    }
  }, [you, destination, path, pickMode, followYou]);

  function recenter() {
    const map = mapRef.current;
    if (!map || !you) return;
    map.setView([you.lat, you.lng], FOLLOW_ZOOM, { animate: true });
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
