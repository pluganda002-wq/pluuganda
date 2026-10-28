import { isApiUnavailableError } from "@/lib/api";
import { tugendeLocal } from "./localStore";
import type { LatLng } from "./geo";
import type { TugendeLoginPayload, TugendeRide, TugendeUser } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** Dev without VITE_API_BASE: use localStorage only — avoids Vite proxy ECONNREFUSED noise. */
function useLocalTugendeOnly(): boolean {
  if (API_BASE) return false;
  if (import.meta.env.VITE_TUGENDE_USE_API === "true") return false;
  return import.meta.env.DEV;
}

async function tugendeRequest(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error("Failed to fetch");
  }
}

function throwIfApiDown(res: Response, msg: string) {
  if (res.status === 503 || res.status >= 500) {
    throw new Error(`503 ${msg || "API unavailable"}`);
  }
}

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await tugendeRequest(`${API_BASE}/api/tugende`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error || res.statusText;
    throwIfApiDown(res, msg);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

async function get<T>(params: Record<string, string>): Promise<T> {
  const q = new URLSearchParams(params).toString();
  const res = await tugendeRequest(`${API_BASE}/api/tugende?${q}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error || res.statusText;
    throwIfApiDown(res, msg);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function tugendeLogin(payload: TugendeLoginPayload): Promise<TugendeUser> {
  const id = String(payload.telegramId);
  if (useLocalTugendeOnly()) {
    return tugendeLocal.login(id, payload.fullName, payload.phone, payload.role, payload.loginMethod, payload.loginId);
  }
  try {
    const res = await post<{ user: TugendeUser }>({
      action: "login",
      telegramId: id,
      fullName: payload.fullName,
      phone: payload.phone,
      role: payload.role,
      loginMethod: payload.loginMethod,
      loginId: payload.loginId,
    });
    tugendeLocal.cacheProfile(res.user);
    return res.user;
  } catch (e) {
    if (isApiUnavailableError(e)) {
      return tugendeLocal.login(id, payload.fullName, payload.phone, payload.role, payload.loginMethod, payload.loginId);
    }
    throw e;
  }
}

export async function tugendeLogout(telegramId: number): Promise<void> {
  const id = String(telegramId);
  tugendeLocal.logout(id);
  if (useLocalTugendeOnly()) return;
  try {
    await post({ action: "logout", telegramId: id });
  } catch {
    /* session cleared locally */
  }
}

export async function tugendeVerifyPluNumber(memberId: string): Promise<{ fullName: string; memberId: string } | null> {
  if (useLocalTugendeOnly()) return null;
  try {
    const res = await get<{ member: { fullName: string; memberId: string } | null }>({
      action: "verifyPlu",
      telegramId: "0",
      memberId: memberId.trim().toUpperCase(),
    });
    return res.member;
  } catch (e) {
    if (isApiUnavailableError(e)) return null;
    throw e;
  }
}

export async function tugendeFetchProfile(telegramId: number): Promise<TugendeUser | null> {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) return tugendeLocal.getProfile(id);
  try {
    const res = await get<{ user: TugendeUser | null }>({ action: "profile", telegramId: id });
    if (res.user) {
      tugendeLocal.cacheProfile(res.user);
      return res.user;
    }
    return tugendeLocal.getProfile(id);
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.getProfile(id);
    throw e;
  }
}

export async function tugendeUpdateLocation(telegramId: number, lat: number, lng: number) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    tugendeLocal.updateLocation(id, lat, lng);
    return;
  }
  try {
    await post({ action: "updateLocation", telegramId: id, lat, lng });
    tugendeLocal.updateLocation(id, lat, lng);
  } catch (e) {
    if (isApiUnavailableError(e)) tugendeLocal.updateLocation(id, lat, lng);
    else throw e;
  }
}

export async function tugendeFetchActiveRide(telegramId: number): Promise<TugendeRide | null> {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) return tugendeLocal.activeRide(id);
  try {
    const res = await get<{ ride: TugendeRide | null }>({ action: "activeRide", telegramId: id });
    return res.ride;
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.activeRide(id);
    throw e;
  }
}

export async function tugendeRequestRide(
  telegramId: number,
  pickup: LatLng,
  dropoff: LatLng
): Promise<TugendeRide> {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) return tugendeLocal.requestRide(id, pickup, dropoff);
  try {
    const res = await post<{ ride: TugendeRide }>({
      action: "requestRide",
      telegramId: id,
      pickup,
      dropoff,
    });
    return res.ride;
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.requestRide(id, pickup, dropoff);
    throw e;
  }
}

export async function tugendeStartRide(telegramId: number, rideId: string) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    const ride = tugendeLocal.startRide(rideId);
    if (!ride) throw new Error("Cannot start ride");
    return ride;
  }
  try {
    const res = await post<{ ride: TugendeRide }>({ action: "startRide", telegramId: id, rideId });
    return res.ride;
  } catch (e) {
    if (isApiUnavailableError(e)) {
      const ride = tugendeLocal.startRide(rideId);
      if (!ride) throw new Error("Cannot start ride");
      return ride;
    }
    throw e;
  }
}

export async function tugendeCompleteRide(telegramId: number, rideId: string, path?: { lat: number; lng: number }[]) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    const res = tugendeLocal.completeRide(rideId);
    if (!res) throw new Error("Cannot complete ride");
    return res;
  }
  try {
    return await post<{ ride: TugendeRide; walletBalanceUgx: number }>({
      action: "completeRide",
      telegramId: id,
      rideId,
      path,
    });
  } catch (e) {
    if (isApiUnavailableError(e)) {
      const res = tugendeLocal.completeRide(rideId);
      if (!res) throw new Error("Cannot complete ride");
      return res;
    }
    throw e;
  }
}

export async function tugendeCancelRide(telegramId: number, rideId: string) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    tugendeLocal.cancelRide(rideId);
    return;
  }
  try {
    await post({ action: "cancelRide", telegramId: id, rideId });
  } catch (e) {
    if (isApiUnavailableError(e)) tugendeLocal.cancelRide(rideId);
    else throw e;
  }
}

export type TugendeTopUpResult = {
  walletBalanceUgx: number;
  payment?: { mode: string; status: string; reference?: string };
};

export async function tugendeFetchWalletConfig(): Promise<{ momoEnabled: boolean }> {
  if (useLocalTugendeOnly()) return { momoEnabled: false };
  try {
    return await get<{ momoEnabled: boolean }>({ action: "walletConfig", telegramId: "0" });
  } catch (e) {
    if (isApiUnavailableError(e)) return { momoEnabled: false };
    throw e;
  }
}

export async function tugendeTopUp(telegramId: number, amountUgx: number, phone?: string): Promise<TugendeTopUpResult> {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    return { walletBalanceUgx: tugendeLocal.topUp(id, amountUgx), payment: { mode: "demo", status: "completed" } };
  }
  try {
    const res = await post<TugendeTopUpResult>({ action: "topUp", telegramId: id, amountUgx, phone });
    return res;
  } catch (e) {
    if (isApiUnavailableError(e)) {
      return { walletBalanceUgx: tugendeLocal.topUp(id, amountUgx), payment: { mode: "demo", status: "completed" } };
    }
    throw e;
  }
}

export async function tugendeWithdraw(telegramId: number, amountUgx: number, phone: string) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) return tugendeLocal.withdraw(id, amountUgx);
  try {
    const res = await post<{ walletBalanceUgx: number }>({
      action: "withdraw",
      telegramId: id,
      amountUgx,
      phone,
    });
    return res.walletBalanceUgx;
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.withdraw(id, amountUgx);
    throw e;
  }
}

export async function tugendePendingRides(): Promise<TugendeRide[]> {
  if (useLocalTugendeOnly()) return tugendeLocal.pendingRides();
  try {
    const res = await get<{ rides: TugendeRide[] }>({ action: "pendingRides", telegramId: "0" });
    return res.rides;
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.pendingRides();
    throw e;
  }
}

export async function tugendeFetchRideHistory(telegramId: number, limit = 30): Promise<TugendeRide[]> {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) return tugendeLocal.rideHistory(id);
  try {
    const res = await get<{ rides: TugendeRide[] }>({
      action: "rideHistory",
      telegramId: id,
      limit: String(limit),
    });
    return res.rides;
  } catch (e) {
    if (isApiUnavailableError(e)) return tugendeLocal.rideHistory(id);
    throw e;
  }
}

export async function tugendeAcceptRide(telegramId: number, rideId: string) {
  const id = String(telegramId);
  if (useLocalTugendeOnly()) {
    const ride = tugendeLocal.acceptRide(id, rideId);
    if (!ride) throw new Error("Ride unavailable");
    return ride;
  }
  try {
    const res = await post<{ ride: TugendeRide }>({ action: "acceptRide", telegramId: id, rideId });
    return res.ride;
  } catch (e) {
    if (isApiUnavailableError(e)) {
      const ride = tugendeLocal.acceptRide(id, rideId);
      if (!ride) throw new Error("Ride unavailable");
      return ride;
    }
    throw e;
  }
}
