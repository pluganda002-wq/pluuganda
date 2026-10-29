/** UGX charged per kilometre (SafeBoda-style meter). */
export const TUGENDE_RATE_UGX_PER_KM = 1000;

const R = 6371; // Earth radius km

export function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function pathDistanceKm(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return total;
}

export function vehiclePlateFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const L = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const prefix = `U${L[h % 26]}${L[(h >> 4) % 26]}${L[(h >> 8) % 26]}`;
  const num = 100 + (h % 900);
  const suffix = L[(h >> 12) % 26];
  return `${prefix} ${num}${suffix}`;
}

export function fareFromKm(km) {
  const billable = Math.max(km, 0.5); // minimum 500m billed
  return Math.round(billable * TUGENDE_RATE_UGX_PER_KM);
}
