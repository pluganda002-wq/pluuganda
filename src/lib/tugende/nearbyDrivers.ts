import { demoNearbyDrivers } from "./geo";
import { tugendeLocal } from "./localStore";
import type { TugendeNearbyDriver } from "./types";
import { isApiUnavailableError } from "@/lib/api";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

function useLocalOnly(): boolean {
  if (API_BASE) return false;
  if (import.meta.env.VITE_TUGENDE_USE_API === "true") return false;
  return import.meta.env.DEV;
}

export async function tugendeNearbyDrivers(
  lat: number,
  lng: number,
  assignedDriverId?: string | null
): Promise<TugendeNearbyDriver[]> {
  if (useLocalOnly()) {
    return tugendeLocal.nearbyDrivers(lat, lng, assignedDriverId);
  }
  try {
    const q = new URLSearchParams({
      action: "nearbyDrivers",
      telegramId: "0",
      lat: String(lat),
      lng: String(lng),
    });
    if (assignedDriverId) q.set("assignedDriverId", assignedDriverId);
    const res = await fetch(`${API_BASE}/api/tugende?${q}`);
    if (!res.ok) throw new Error("nearbyDrivers failed");
    const data = (await res.json()) as { drivers: TugendeNearbyDriver[] };
    return data.drivers ?? [];
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.nearbyDrivers(lat, lng, assignedDriverId);
    return demoNearbyDrivers(lat, lng);
  }
}

export function mergeAssignedDriver(
  drivers: TugendeNearbyDriver[],
  assignedId: string | null | undefined,
  pickup: { lat: number; lng: number }
): TugendeNearbyDriver[] {
  if (!assignedId) return drivers.map((d) => ({ ...d, assigned: false }));
  const hit = drivers.find((d) => d.driverId === assignedId);
  if (hit) {
    return drivers.map((d) => ({ ...d, assigned: d.driverId === assignedId }));
  }
  const demo = demoNearbyDrivers(pickup.lat, pickup.lng, Number(assignedId.replace(/\D/g, "").slice(-3) || 0));
  const extra = demo[0];
  if (!extra) return drivers;
  return [{ ...extra, driverId: assignedId, fullName: "Your rider", assigned: true }, ...drivers].map((d) => ({
    ...d,
    assigned: d.driverId === assignedId,
  }));
}
