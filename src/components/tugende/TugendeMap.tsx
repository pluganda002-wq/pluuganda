import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TugendeMap.css";

type Point = { lat: number; lng: number };

const DEFAULT_CENTER: Point = { lat: 0.3476, lng: 32.5825 };

function makeIcon(color: string) {
  return L.divIcon({
    className: "tugende-map-marker",
    html: `<span style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

type Props = {
  you: Point | null;
  destination?: Point | null;
  path?: Point[];
  size?: "default" | "large" | "fullscreen";
  pickMode?: boolean;
  followYou?: boolean;
  onPickDestination?: (point: Point) => void;
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
      zoomControl: true,
      attributionControl: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
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
        youMarkerRef.current = L.marker([you.lat, you.lng], { icon: makeIcon("#c9a227") }).addTo(map);
        youMarkerRef.current.bindTooltip("You", { permanent: true, direction: "top", offset: [0, -10] });
      } else {
        youMarkerRef.current.setLatLng([you.lat, you.lng]);
      }
      if (followYou && !pickMode) {
        map.setView([you.lat, you.lng], Math.max(map.getZoom(), 16), { animate: true });
      }
    }

    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: makeIcon("#1a5fb4") }).addTo(map);
        destMarkerRef.current.bindTooltip("Destination", { permanent: true, direction: "top", offset: [0, -10] });
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
        routeRef.current = L.polyline(latlngs, { color: "#1a5fb4", weight: 4, dashArray: "8 10" }).addTo(map);
      } else {
        routeRef.current.setLatLngs(latlngs);
      }
      const key = `${you.lat.toFixed(4)}:${destination.lat.toFixed(4)}:${destination.lng.toFixed(4)}`;
      if (lastBoundsKeyRef.current !== key) {
        lastBoundsKeyRef.current = key;
        map.fitBounds(L.latLngBounds(latlngs), { padding: [56, 56], maxZoom: 17 });
      }
    } else if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    if (path && path.length >= 2) {
      const latlngs = path.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      if (!pathRef.current) {
        pathRef.current = L.polyline(latlngs, { color: "#c9a227", weight: 5 }).addTo(map);
      } else {
        pathRef.current.setLatLngs(latlngs);
      }
      if (followYou && you) {
        map.setView([you.lat, you.lng], Math.max(map.getZoom(), 16), { animate: true });
      } else if (!followYou && latlngs.length >= 2) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 17 });
      }
    } else if (pathRef.current) {
      pathRef.current.remove();
      pathRef.current = null;
    }

    if (you && !destination && !path?.length && !pickMode) {
      map.setView([you.lat, you.lng], 16, { animate: true });
    }
  }, [you, destination, path, pickMode, followYou]);

  const sizeClass =
    size === "fullscreen" ? " tugende-map--fullscreen" : size === "large" ? " tugende-map--large" : "";
  const pickClass = pickMode ? " tugende-map--pick" : "";

  return (
    <div
      ref={hostRef}
      className={`tugende-map${sizeClass}${pickClass}${className ? ` ${className}` : ""}`}
      aria-label="Ride map"
    />
  );
}
