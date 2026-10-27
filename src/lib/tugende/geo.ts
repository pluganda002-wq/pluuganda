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

type NominatimAddress = {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
};

export type PlaceResult = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  distanceKm?: number;
};

function streetLineFromAddress(addr: NominatimAddress): string {
  const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
  if (street) return street;
  return addr.neighbourhood || addr.suburb || addr.city || addr.town || addr.village || "Your location";
}

function subtitleFromAddress(addr: NominatimAddress): string {
  const city = addr.city || addr.town || addr.village || addr.suburb;
  const country = addr.country || "Uganda";
  return [city, country].filter(Boolean).join(", ");
}

export async function reverseGeocodeLabel(lat: number, lng: number): Promise<string> {
  try {
    const q = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      addressdetails: "1",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("geocode failed");
    const data = (await res.json()) as { display_name?: string; address?: NominatimAddress };
    if (data.address) {
      const title = streetLineFromAddress(data.address);
      const sub = subtitleFromAddress(data.address);
      return sub ? `${title}, ${sub}` : title;
    }
    if (data.display_name) {
      const parts = data.display_name.split(",").map((s) => s.trim());
      return parts.slice(0, 2).join(", ");
    }
  } catch {
    /* fallback below */
  }
  return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export async function searchPlaces(
  query: string,
  near?: { lat: number; lng: number }
): Promise<PlaceResult[]> {
  const term = query.trim();
  if (term.length < 2) return [];
  try {
    const q = new URLSearchParams({
      q: term,
      format: "json",
      limit: "8",
      addressdetails: "1",
      countrycodes: "ug",
    });
    if (near) {
      q.set("lat", String(near.lat));
      q.set("lon", String(near.lng));
    }
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name?: string;
      address?: NominatimAddress;
    }>;
    return rows.map((row) => {
      const lat = Number(row.lat);
      const lng = Number(row.lon);
      const title = row.address
        ? streetLineFromAddress(row.address)
        : row.display_name?.split(",")[0]?.trim() || term;
      const subtitle = row.address
        ? subtitleFromAddress(row.address)
        : row.display_name?.split(",").slice(1, 3).join(", ").trim() || "Uganda";
      const distanceKm = near ? haversineKm(near.lat, near.lng, lat, lng) : undefined;
      return { lat, lng, title, subtitle, distanceKm };
    });
  } catch {
    return [];
  }
}
