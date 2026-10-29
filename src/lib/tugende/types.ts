import type { LatLng } from "./geo";

export type TugendeRole = "rider" | "driver";

export type TugendeLoginMethod = "phone" | "google" | "email" | "plu";

export type TugendeUser = {
  telegramId: string;
  fullName: string;
  phone: string;
  role: TugendeRole;
  loginMethod?: TugendeLoginMethod;
  loginId?: string;
  walletBalanceUgx: number;
  location?: { lat: number; lng: number; updatedAt?: string } | null;
};

export type TugendeLoginPayload = {
  telegramId: number;
  fullName: string;
  phone: string;
  role: TugendeRole;
  loginMethod: TugendeLoginMethod;
  loginId: string;
};

export type RideStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export type TugendeNearbyDriver = {
  driverId: string;
  fullName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  vehiclePlate?: string;
  assigned?: boolean;
};

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
  createdAt?: string;
  endedAt?: string;
};
