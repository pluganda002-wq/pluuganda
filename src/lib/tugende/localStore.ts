import { fareFromKm, haversineKm, pathDistanceKm } from "./geo";
import type { TugendeRide, TugendeUser } from "./types";

const KEY = "plu-tugende-local-v1";

type Store = {
  user: TugendeUser | null;
  ride: TugendeRide | null;
};

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return { user: null, ride: null };
  }
}

function save(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export const tugendeLocal = {
  getProfile(telegramId: string): TugendeUser | null {
    const s = load();
    if (!s.user || s.user.telegramId !== telegramId) return null;
    return s.user;
  },

  login(telegramId: string, fullName: string, phone: string, role: TugendeUser["role"]): TugendeUser {
    const s = load();
    s.user = {
      telegramId,
      fullName,
      phone,
      role,
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
      const path = [...(s.ride.path ?? []), { lat, lng }];
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
    s.ride = { ...s.ride, status: "completed", distanceKm, fareUgx };
    save(s);
    return { ride: s.ride, walletBalanceUgx: s.user.walletBalanceUgx };
  },

  cancelRide(rideId: string) {
    const s = load();
    if (s.ride?.rideId === rideId) {
      s.ride = { ...s.ride, status: "cancelled" };
      save(s);
    }
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

  acceptRide(telegramId: string, rideId: string): TugendeRide | null {
    const s = load();
    if (!s.ride || s.ride.rideId !== rideId) return null;
    s.ride = { ...s.ride, status: "accepted", driverId: telegramId };
    save(s);
    return s.ride;
  },
};
