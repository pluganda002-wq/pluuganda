import type { LatLng } from "./geo";

export type TugendeRole = "rider" | "driver";

export type TugendeUser = {
  telegramId: string;
  fullName: string;
  phone: string;
  role: TugendeRole;
  walletBalanceUgx: number;
  location?: { lat: number; lng: number; updatedAt?: string } | null;
};

export type RideStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export type TugendeRide = {
  rideId: string;
  status: RideStatus;
  riderId: string;
  driverId: string | null;
  pickup: LatLng;
  dropoff: LatLng;
  distanceKm: number;
  fareUgx: number;
  path?: { lat: number; lng: number }[];
  estimatedKm?: number;
};
