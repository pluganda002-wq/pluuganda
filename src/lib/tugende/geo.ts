export const TUGENDE_RATE_UGX_PER_KM = 1000;

const R = 6371;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function pathDistanceKm(points: { lat: number; lng: number }[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }
  return total;
}

export function fareFromKm(km: number): number {
  const billable = Math.max(km, 0.5);
  return Math.round(billable * TUGENDE_RATE_UGX_PER_KM);
}

export type LatLng = { lat: number; lng: number; label?: string };

export async function reverseGeocodeLabel(lat: number, lng: number): Promise<string> {
  try {
    const q = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("geocode failed");
    const data = (await res.json()) as { display_name?: string };
    if (data.display_name) {
      const parts = data.display_name.split(",").map((s) => s.trim());
      return parts.slice(0, 3).join(", ");
    }
  } catch {
    /* fallback below */
  }
  return `Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
