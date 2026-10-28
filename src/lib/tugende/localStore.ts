import { demoNearbyDrivers, fareFromKm, haversineKm, pathDistanceKm } from "./geo";
import type { TugendeLoginMethod, TugendeNearbyDriver, TugendeRide, TugendeUser } from "./types";

const KEY = "plu-tugende-local-v1";

type Store = {
  user: TugendeUser | null;
  ride: TugendeRide | null;
  history?: TugendeRide[];
};

function load(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
    return { user: raw.user ?? null, ride: raw.ride ?? null, history: raw.history ?? [] };
  } catch {
    return { user: null, ride: null, history: [] };
  }
}

function archiveRide(s: Store, ride: TugendeRide) {
  const history = s.history ?? [];
  if (!history.some((r) => r.rideId === ride.rideId)) {
    history.unshift(ride);
  }
  s.history = history.slice(0, 40);
  s.ride = null;
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function migrateFinishedActiveRide(s: Store) {
  if (!s.ride || !["completed", "cancelled"].includes(s.ride.status)) return;
  archiveRide(s, s.ride);
  save(s);
}

function samePoint(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;
}

export const tugendeLocal = {
  getProfile(telegramId: string): TugendeUser | null {
    const s = load();
    if (!s.user || s.user.telegramId !== telegramId) return null;
    return s.user;
  },

  cacheProfile(user: TugendeUser) {
    const s = load();
    s.user = { ...s.user, ...user, telegramId: user.telegramId };
    save(s);
  },

  logout(telegramId: string) {
    const s = load();
    if (s.user?.telegramId === telegramId) {
      s.user = null;
      save(s);
    }
  },

  login(
    telegramId: string,
    fullName: string,
    phone: string,
    role: TugendeUser["role"],
    loginMethod?: TugendeLoginMethod,
    loginId?: string
  ): TugendeUser {
    const s = load();
    s.user = {
      telegramId,
      fullName,
      phone,
      role,
      loginMethod,
      loginId,
      walletBalanceUgx: s.user?.walletBalanceUgx ?? 10000,
      location: s.user?.location ?? null,
    };
    save(s);
    return s.user;
  },

  updateLocation(telegramId: string, lat: number, lng: number) {
    const s = load();
    if (!s.user || s.user.telegramId !== telegramId) return;
    s.user.location = { lat, lng, updatedAt: new Date().toISOString() };
    if (s.ride?.status === "in_progress") {
      const path = [...(s.ride.path ?? [])];
      const last = path[path.length - 1];
      if (!last || !samePoint(last, { lat, lng })) {
        path.push({ lat, lng });
      }
      const distanceKm = pathDistanceKm(path);
      s.ride = { ...s.ride, path, distanceKm, fareUgx: fareFromKm(distanceKm) };
    }
    save(s);
  },

  activeRide(telegramId: string): TugendeRide | null {
    const s = load();
    if (!s.ride) return null;
    if (s.ride.riderId !== telegramId && s.ride.driverId !== telegramId) return null;
    if (["completed", "cancelled"].includes(s.ride.status)) return null;
    return s.ride;
  },

  requestRide(telegramId: string, pickup: TugendeRide["pickup"], dropoff: TugendeRide["dropoff"]): TugendeRide {
    const s = load();
    const estKm = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const now = new Date().toISOString();
    const ride: TugendeRide = {
      rideId: `TG-L-${Date.now().toString(36).toUpperCase()}`,
      status: "pending",
      riderId: telegramId,
      driverId: null,
      pickup,
      dropoff,
      path: [{ lat: pickup.lat, lng: pickup.lng }],
      distanceKm: 0,
      fareUgx: fareFromKm(estKm),
      estimatedKm: estKm,
      createdAt: now,
    };
    s.ride = ride;
    save(s);
    return ride;
  },

  startRide(rideId: string): TugendeRide | null {
    const s = load();
    if (!s.ride || s.ride.rideId !== rideId) return null;
    s.ride = { ...s.ride, status: "in_progress" };
    save(s);
    return s.ride;
  },

  completeRide(rideId: string): { ride: TugendeRide; walletBalanceUgx: number } | null {
    const s = load();
    if (!s.ride || s.ride.rideId !== rideId || !s.user) return null;
    let distanceKm = pathDistanceKm(s.ride.path ?? []);
    if (distanceKm < 0.1) {
      distanceKm = haversineKm(s.ride.pickup.lat, s.ride.pickup.lng, s.ride.dropoff.lat, s.ride.dropoff.lng);
    }
    const fareUgx = fareFromKm(distanceKm);
    if (s.user.walletBalanceUgx < fareUgx) {
      throw new Error("Insufficient wallet balance. Top up to pay.");
    }
    s.user.walletBalanceUgx -= fareUgx;
    const finished: TugendeRide = {
      ...s.ride,
      status: "completed",
      distanceKm,
      fareUgx,
      endedAt: new Date().toISOString(),
    };
    archiveRide(s, finished);
    save(s);
    return { ride: finished, walletBalanceUgx: s.user.walletBalanceUgx };
  },

  cancelRide(rideId: string) {
    const s = load();
    if (s.ride?.rideId === rideId) {
      const finished: TugendeRide = {
        ...s.ride,
        status: "cancelled",
        endedAt: new Date().toISOString(),
      };
      archiveRide(s, finished);
      save(s);
    }
  },

  rideHistory(telegramId: string): TugendeRide[] {
    const s = load();
    migrateFinishedActiveRide(s);
    return (s.history ?? []).filter((r) => r.riderId === telegramId || r.driverId === telegramId);
  },

  topUp(telegramId: string, amountUgx: number): number {
    const s = load();
    if (!s.user || s.user.telegramId !== telegramId) return 0;
    s.user.walletBalanceUgx += amountUgx;
    save(s);
    return s.user.walletBalanceUgx;
  },

  withdraw(telegramId: string, amountUgx: number): number {
    const s = load();
    if (!s.user || s.user.telegramId !== telegramId) return 0;
    if (s.user.walletBalanceUgx < amountUgx) throw new Error("Insufficient balance");
    s.user.walletBalanceUgx -= amountUgx;
    save(s);
    return s.user.walletBalanceUgx;
  },

  pendingRides(): TugendeRide[] {
    const s = load();
    return s.ride?.status === "pending" ? [s.ride] : [];
  },

  nearbyDrivers(lat: number, lng: number, assignedDriverId?: string | null): TugendeNearbyDriver[] {
    const seed = Math.round(lat * 1000 + lng * 1000);
    const drivers = demoNearbyDrivers(lat, lng, seed).map((d) => ({
      ...d,
      assigned: assignedDriverId != null && d.driverId === assignedDriverId,
    }));
    if (assignedDriverId && !drivers.some((d) => d.driverId === assignedDriverId)) {
      const anchor = drivers[0];
      if (anchor) {
        drivers.unshift({
          ...anchor,
          driverId: assignedDriverId,
          fullName: "Your rider",
          distanceKm: haversineKm(lat, lng, anchor.lat, anchor.lng),
          assigned: true,
        });
      }
    }
    return drivers;
  },

  acceptRide(telegramId: string, rideId: string): TugendeRide | null {
    const s = load();
    if (!s.ride || s.ride.rideId !== rideId) return null;
    s.ride = { ...s.ride, status: "accepted", driverId: telegramId };
    save(s);
    return s.ride;
  },
};
