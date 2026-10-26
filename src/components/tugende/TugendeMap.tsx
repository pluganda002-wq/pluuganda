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
  className?: string;
};

export function TugendeMap({ you, destination, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const youMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 12);

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

    if (you) {
      if (!youMarkerRef.current) {
        youMarkerRef.current = L.marker([you.lat, you.lng], { icon: makeIcon("#c9a227") }).addTo(map);
        youMarkerRef.current.bindTooltip("You", { permanent: true, direction: "top", offset: [0, -8] });
      } else {
        youMarkerRef.current.setLatLng([you.lat, you.lng]);
      }
      map.panTo([you.lat, you.lng], { animate: true });
    }

    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: makeIcon("#1a5fb4") }).addTo(
          map
        );
        destMarkerRef.current.bindTooltip("Destination", { permanent: true, direction: "top", offset: [0, -8] });
      } else {
        destMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (you && destination) {
      const latlngs: L.LatLngExpression[] = [
        [you.lat, you.lng],
        [destination.lat, destination.lng],
      ];
      if (!lineRef.current) {
        lineRef.current = L.polyline(latlngs, { color: "#c9a227", weight: 3, dashArray: "6 8" }).addTo(map);
      } else {
        lineRef.current.setLatLngs(latlngs);
      }
      map.fitBounds(L.latLngBounds(latlngs), { padding: [36, 36], maxZoom: 16 });
    } else if (lineRef.current) {
      lineRef.current.remove();
      lineRef.current = null;
    }
  }, [you, destination]);

  return <div ref={hostRef} className={`tugende-map${className ? ` ${className}` : ""}`} aria-label="Ride map" />;
}
