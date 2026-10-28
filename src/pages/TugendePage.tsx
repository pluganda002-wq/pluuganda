import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TugendeSignIn } from "@/components/tugende/TugendeSignIn";
import {
  fareFromKm,
  haversineKm,
  pathDistanceKm,
  reverseGeocodeLabel,
  searchPlaces,
  suggestDropoffNear,
  type PlaceResult,
} from "@/lib/tugende/geo";
import { TugendeMap } from "@/components/tugende/TugendeMap";
import { TugendeJourneyList } from "@/components/tugende/TugendeJourneyList";
import { TugendeRouteSheet } from "@/components/tugende/TugendeRouteSheet";
import { Bike, History, MapPinned, Wallet as WalletIcon } from "lucide-react";
import { clearLiveLocationCache, isTugendeLocationGranted, useLiveLocation } from "@/hooks/useLiveLocation";
import {
  tugendeAcceptRide,
  tugendeCancelRide,
  tugendeCompleteRide,
  tugendeFetchActiveRide,
  tugendeFetchProfile,
  tugendeFetchRideHistory,
  tugendeFetchWalletConfig,
  tugendeLogout,
  tugendePendingRides,
  tugendeRequestRide,
  tugendeStartRide,
  tugendeTopUp,
  tugendeUpdateLocation,
  tugendeWithdraw,
} from "@/lib/tugende/api";
import { tugendeLocal } from "@/lib/tugende/localStore";
import { tugendeNearbyDrivers } from "@/lib/tugende/nearbyDrivers";
import type { TugendeNearbyDriver, TugendeRide, TugendeUser } from "@/lib/tugende/types";
import type { MapNearbyRider } from "@/components/tugende/TugendeMap";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import "./TugendePage.css";

const LOGO = "/branding/tugende-safe-boda.png";

type Tab = "ride" | "trips" | "wallet" | "drive";

const DEV_TELEGRAM_ID = 800_001;

function mergeRideFromServer(prev: TugendeRide | null, next: TugendeRide): TugendeRide {
  if (!prev || prev.rideId !== next.rideId) return next;
  const prevDist = prev.distanceKm ?? 0;
  const nextDist = next.distanceKm ?? 0;
  const prevLen = prev.path?.length ?? 0;
  const nextLen = next.path?.length ?? 0;
  if (nextDist > prevDist + 0.0001 || nextLen > prevLen) return next;
  if (prevDist > nextDist + 0.0001 || prevLen > nextLen) {
    return { ...next, path: prev.path, distanceKm: prev.distanceKm, fareUgx: prev.fareUgx };
  }
  return next;
}

export function TugendePage() {
  const { user: tgUser, displayName, haptic, showAlert, webApp } = useTelegram();
  const { member } = useUser();
  const telegramId = useMemo(() => {
    if (tgUser?.id) return tgUser.id;
    if (import.meta.env.DEV) return DEV_TELEGRAM_ID;
    return 0;
  }, [tgUser?.id]);
  const telegramKey = String(telegramId);
  const canSignIn = telegramId > 0 || (webApp.initData?.length ?? 0) > 0;

  const [profile, setProfile] = useState<TugendeUser | null>(null);
  const [tab, setTab] = useState<Tab>("ride");
  const [ride, setRide] = useState<TugendeRide | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [momoEnabled, setMomoEnabled] = useState(false);
  const [pending, setPending] = useState<TugendeRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapPickMode, setMapPickMode] = useState(false);
  const [geocodingDest, setGeocodingDest] = useState(false);
  const [pickupLabel, setPickupLabel] = useState("Finding your location…");
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const autoLocPromptedRef = useRef(false);
  const searchGenRef = useRef(0);
  const [dropoffFocused, setDropoffFocused] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<TugendeNearbyDriver[]>([]);
  const [journeyHistory, setJourneyHistory] = useState<TugendeRide[]>([]);
  const [journeysLoading, setJourneysLoading] = useState(false);
  const lastPickupGeocodeRef = useRef<{ lat: number; lng: number } | null>(null);

  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("10000");

  const refreshProfile = useCallback(async () => {
    if (!telegramId) return;
    const p = await tugendeFetchProfile(telegramId);
    if (p) setProfile(p);
  }, [telegramId]);

  const refreshRide = useCallback(async () => {
    if (!telegramId) return;
    const r = await tugendeFetchActiveRide(telegramId);
    setRide((prev) => {
      if (!r) return null;
      return mergeRideFromServer(prev, r);
    });
  }, [telegramId]);

  const refreshJourneys = useCallback(async () => {
    if (!telegramId) return;
    setJourneysLoading(true);
    try {
      const rides = await tugendeFetchRideHistory(telegramId);
      setJourneyHistory(rides);
    } catch {
      setJourneyHistory([]);
    } finally {
      setJourneysLoading(false);
    }
  }, [telegramId]);

  const gpsActive = Boolean(
    profile && (tab === "ride" || tab === "drive" || ride?.status === "in_progress")
  );

  const { position, status: locStatus, platformHint, enableLocation, retryAfterSettings, locationGranted } =
    useLiveLocation(gpsActive);
  const pos = position ? { lat: position.lat, lng: position.lng } : null;

  useEffect(() => {
    if (!telegramId) return;
    const cached = tugendeLocal.getProfile(telegramKey);
    if (cached) setProfile(cached);
    refreshProfile();
    refreshRide();
    tugendeFetchWalletConfig().then((c) => setMomoEnabled(c.momoEnabled)).catch(() => setMomoEnabled(false));
  }, [telegramId, telegramKey, refreshProfile, refreshRide]);

  useEffect(() => {
    if (!profile || tab !== "ride" || locStatus === "active") return;
    if (autoLocPromptedRef.current) return;
    autoLocPromptedRef.current = true;
    if (isTugendeLocationGranted() || locationGranted) {
      enableLocation();
      return;
    }
    if (locStatus === "denied") return;
    enableLocation();
  }, [profile, tab, locStatus, enableLocation]);

  useEffect(() => {
    if (!telegramId || !pos) return;
    tugendeUpdateLocation(telegramId, pos.lat, pos.lng)
      .then(() => {
        if (ride?.status === "in_progress") void refreshRide();
      })
      .catch(() => {});
  }, [telegramId, pos?.lat, pos?.lng, ride?.status, refreshRide]);

  useEffect(() => {
    if (!ride) return;
    const ms = ride.status === "in_progress" ? 2500 : ["pending", "accepted"].includes(ride.status) ? 3000 : 0;
    if (!ms) return;
    const t = setInterval(refreshRide, ms);
    return () => clearInterval(t);
  }, [ride, refreshRide]);

  useEffect(() => {
    if (!ride || ride.status !== "in_progress" || !pos) return;
    setRide((prev) => {
      if (!prev || prev.status !== "in_progress") return prev;
      const path = [...(prev.path ?? [])];
      const last = path[path.length - 1];
      if (last && Math.abs(last.lat - pos.lat) < 1e-6 && Math.abs(last.lng - pos.lng) < 1e-6) {
        return prev;
      }
      path.push({ lat: pos.lat, lng: pos.lng });
      const distanceKm = pathDistanceKm(path);
      return { ...prev, path, distanceKm, fareUgx: fareFromKm(distanceKm) };
    });
  }, [pos?.lat, pos?.lng, ride?.rideId, ride?.status]);

  useEffect(() => {
    if (profile?.role !== "driver" || tab !== "drive") return;
    const load = () => tugendePendingRides().then(setPending).catch(() => setPending([]));
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [profile?.role, tab]);

  useEffect(() => {
    if (!profile || (tab !== "trips" && tab !== "drive")) return;
    void refreshJourneys();
  }, [profile, tab, refreshJourneys]);

  async function handlePickDestination(point: { lat: number; lng: number }) {
    if (!pos) return;
    setGeocodingDest(true);
    haptic("light");
    try {
      const label = await reverseGeocodeLabel(point.lat, point.lng);
      const km = haversineKm(pos.lat, pos.lng, point.lat, point.lng);
      setDropoff({ lat: point.lat, lng: point.lng, label });
      setDropoffQuery("");
      setMapPickMode(false);
      showAlert(`Destination set · ${km.toFixed(1)} km · UGX ${fareFromKm(km).toLocaleString()}`);
    } finally {
      setGeocodingDest(false);
    }
  }

  useEffect(() => {
    if (!pos || profile?.role !== "rider") return;
    const last = lastPickupGeocodeRef.current;
    if (last && haversineKm(last.lat, last.lng, pos.lat, pos.lng) < 0.05) return;

    let cancelled = false;
    setPickupLoading(true);
    reverseGeocodeLabel(pos.lat, pos.lng)
      .then((label) => {
        if (!cancelled) {
          setPickupLabel(label);
          lastPickupGeocodeRef.current = { lat: pos.lat, lng: pos.lng };
        }
      })
      .finally(() => {
        if (!cancelled) setPickupLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pos?.lat, pos?.lng, profile?.role]);

  useEffect(() => {
    if (dropoff) {
      setPlaceSuggestions([]);
      return;
    }
    if (!dropoffFocused && dropoffQuery.trim().length < 2) {
      setPlaceSuggestions([]);
      return;
    }
    if (!pos) return;

    const gen = ++searchGenRef.current;
    const t = setTimeout(() => {
      setPlaceSearching(true);
      const task =
        dropoffQuery.trim().length >= 2
          ? searchPlaces(dropoffQuery, pos)
          : suggestDropoffNear(pos);
      task
        .then((rows) => {
          if (searchGenRef.current === gen) setPlaceSuggestions(rows);
        })
        .finally(() => {
          if (searchGenRef.current === gen) setPlaceSearching(false);
        });
    }, dropoffQuery.trim().length >= 2 ? 400 : 0);
    return () => clearTimeout(t);
  }, [dropoffQuery, dropoff, dropoffFocused, pos?.lat, pos?.lng]);

  function onDropoffFocus() {
    setDropoffFocused(true);
    haptic("light");
  }

  const showNearbyRiders =
    profile?.role === "rider" &&
    ride &&
    ["pending", "accepted"].includes(ride.status) &&
    Boolean(pos);

  useEffect(() => {
    if (!showNearbyRiders || !pos) {
      setNearbyDrivers([]);
      return;
    }
    const load = () =>
      tugendeNearbyDrivers(pos.lat, pos.lng, ride?.driverId ?? null).then(setNearbyDrivers);
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [showNearbyRiders, pos?.lat, pos?.lng, ride?.driverId, ride?.rideId]);

  const mapNearbyRiders: MapNearbyRider[] = useMemo(
    () =>
      nearbyDrivers.map((d) => ({
        id: d.driverId,
        lat: d.lat,
        lng: d.lng,
        label: d.assigned ? `${d.fullName} · your rider` : d.fullName,
        assigned: d.assigned,
      })),
    [nearbyDrivers]
  );

  function selectPlace(place: PlaceResult) {
    haptic("light");
    const label = place.subtitle ? `${place.title}, ${place.subtitle}` : place.title;
    setDropoff({ lat: place.lat, lng: place.lng, label });
    setDropoffQuery("");
    setPlaceSuggestions([]);
    setDropoffFocused(false);
  }

  function clearDropoff() {
    setDropoff(null);
    setDropoffQuery("");
    setPlaceSuggestions([]);
  }

  async function requestRide() {
    if (!telegramId || !pos || !dropoff) return;
    setLoading(true);
    try {
      const r = await tugendeRequestRide(
        telegramId,
        { lat: pos.lat, lng: pos.lng, label: pickupLabel || "Current location" },
        { lat: dropoff.lat, lng: dropoff.lng, label: dropoff.label }
      );
      setRide(r);
      haptic("medium");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Could not request ride");
    } finally {
      setLoading(false);
    }
  }

  async function startRideFlow() {
    if (!telegramId || !ride) return;
    setLoading(true);
    try {
      const r = await tugendeStartRide(telegramId, ride.rideId);
      setRide(r);
      haptic("light");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Start failed");
    } finally {
      setLoading(false);
    }
  }

  async function endRideFlow() {
    if (!telegramId || !ride) return;
    setLoading(true);
    try {
      const res = await tugendeCompleteRide(telegramId, ride.rideId, ride.path);
      setRide(null);
      setProfile((p) => (p ? { ...p, walletBalanceUgx: res.walletBalanceUgx } : p));
      haptic("heavy");
      showAlert(`Ride complete. Paid UGX ${res.ride.fareUgx.toLocaleString()} (${res.ride.distanceKm.toFixed(2)} km).`);
      void refreshJourneys();
      await refreshProfile();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Could not end ride");
    } finally {
      setLoading(false);
    }
  }

  async function cancelRideFlow() {
    if (!telegramId || !ride) return;
    await tugendeCancelRide(telegramId, ride.rideId);
    setRide(null);
    void refreshJourneys();
    haptic("light");
  }

  async function topUp(amount: number) {
    if (!telegramId) return;
    setLoading(true);
    try {
      const res = await tugendeTopUp(telegramId, amount, profile?.phone);
      setProfile((p) => (p ? { ...p, walletBalanceUgx: res.walletBalanceUgx } : p));
      const via =
        res.payment?.mode === "momo"
          ? "MTN MoMo payment received."
          : momoEnabled
            ? "Wallet credited."
            : "Demo top-up (connect MoMo on server for real STK push).";
      showAlert(`${via} UGX ${amount.toLocaleString()} added.`);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setLoading(false);
    }
  }

  async function onWithdraw(e: FormEvent) {
    e.preventDefault();
    if (!telegramId) return;
    const amount = Number(withdrawAmount);
    setLoading(true);
    try {
      const bal = await tugendeWithdraw(telegramId, amount, withdrawPhone.trim());
      setProfile((p) => (p ? { ...p, walletBalanceUgx: bal } : p));
      showAlert("Withdrawal submitted to mobile money (pending settlement).");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (!telegramId) return;
    const ok = window.confirm("Log out of Tugende on this device?");
    if (!ok) return;
    await tugendeLogout(telegramId);
    clearLiveLocationCache();
    setProfile(null);
    setRide(null);
    setDropoff(null);
    setDropoffQuery("");
    haptic("light");
  }

  async function acceptPending(rideId: string) {
    if (!telegramId) return;
    setLoading(true);
    try {
      const r = await tugendeAcceptRide(telegramId, rideId);
      setRide(r);
      setTab("ride");
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Accept failed");
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    if (!canSignIn || !telegramId) {
      return (
        <main className="page tugende-page">
          <p className="tugende-signin__error card">
            Open <strong>PluPatriot</strong> from the Telegram bot (Menu → Open app), then return to Tugende to sign in.
          </p>
        </main>
      );
    }
    return (
      <TugendeSignIn
        telegramId={telegramId}
        defaultName={displayName}
        suggestedPlu={member?.memberId}
        suggestedPhone={member?.phone}
        haptic={haptic}
        onError={showAlert}
        onComplete={(user) => {
          setProfile(user);
          showAlert(`Welcome to Tugende, ${user.fullName}.`);
        }}
      />
    );
  }

  const destinationReady = Boolean(
    dropoff && Number.isFinite(dropoff.lat) && Number.isFinite(dropoff.lng) && dropoff.label.trim()
  );
  const plannedKm =
    pos && destinationReady && dropoff
      ? haversineKm(pos.lat, pos.lng, dropoff.lat, dropoff.lng)
      : null;
  const plannedFare = plannedKm != null ? fareFromKm(plannedKm) : null;
  const canRequestRide = Boolean(destinationReady && pos && locStatus === "active" && !loading && !ride);

  const mapDestination = ride ? { lat: ride.dropoff.lat, lng: ride.dropoff.lng } : dropoff;
  const passengerBoltHome = tab === "ride" && profile.role === "rider" && !ride;
  const mapSize = passengerBoltHome || ride?.status === "in_progress" ? "hero" : "fullscreen";
  const livePath =
    ride && (ride.path?.length ?? 0) >= 2
      ? ride.path!.map((p) => ({ lat: p.lat, lng: p.lng }))
      : undefined;

  const isDriverOnRide = Boolean(ride && ride.driverId === telegramKey);
  const isRiderOnRide = Boolean(ride && ride.riderId === telegramKey);
  const canStartRide =
    ride?.status === "accepted" && (profile.role === "driver" ? isDriverOnRide : isRiderOnRide);
  const canEndRide =
    ride?.status === "in_progress" && (profile.role === "driver" ? isDriverOnRide : isRiderOnRide);

  const navTabs: { id: Tab; label: string; Icon: typeof MapPinned; driverOnly?: boolean }[] = [
    { id: "ride", label: "Ride", Icon: MapPinned },
    { id: "trips", label: "Trips", Icon: History },
    { id: "wallet", label: "Wallet", Icon: WalletIcon },
    { id: "drive", label: "Drive", Icon: Bike, driverOnly: true },
  ];

  return (
    <main className="page tugende-page">
      <header className="tugende-header">
        <img src={LOGO} alt="" className="tugende-header__logo" width={52} height={52} />
        <div className="tugende-header__body">
          <p className="tugende-header__brand">Tugende</p>
          <strong className="tugende-header__name">{profile.fullName}</strong>
          <p className="tugende-header__meta">
            {profile.role === "driver" ? "Rider (driver)" : "Passenger"}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </p>
        </div>
        <button type="button" className="btn btn-ghost tugende-header__logout" onClick={() => void logout()}>
          Log out
        </button>
      </header>

      <nav className="tugende-tabs" aria-label="Tugende sections">
        {navTabs
          .filter((t) => !t.driverOnly || profile.role === "driver")
          .map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`tugende-tabs__btn${tab === id ? " tugende-tabs__btn--on" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon size={17} strokeWidth={2.25} aria-hidden />
              {label}
            </button>
          ))}
      </nav>

      {tab === "ride" ? (
        <section
          className={`tugende-panel tugende-panel--map${passengerBoltHome ? " tugende-panel--bolt" : " card"}`}
        >
          {!passengerBoltHome && ride?.status === "in_progress" ? (
            <div className="tugende-live-meter" aria-live="polite">
              <div>
                <span className="tugende-live-meter__label">Distance</span>
                <strong>{ride.distanceKm.toFixed(2)} km</strong>
              </div>
              <div>
                <span className="tugende-live-meter__label">Meter</span>
                <strong className="tugende-live-meter__fare">UGX {ride.fareUgx.toLocaleString()}</strong>
              </div>
            </div>
          ) : null}
          {mapPickMode ? <p className="tugende-map-hint">Tap the map to set dropoff.</p> : null}
          {showNearbyRiders ? (
            <p className="tugende-map-hint tugende-map-hint--riders">
              {ride?.status === "accepted" ? "Your rider is nearby" : "Riders near you — matching a trip…"}
            </p>
          ) : null}
          <div className={passengerBoltHome ? "tugende-ride-shell" : undefined}>
            <TugendeMap
              you={pos}
              destination={mapDestination}
              path={ride?.status === "in_progress" ? livePath : undefined}
              size={mapSize}
              pickMode={mapPickMode && Boolean(pos) && !geocodingDest}
              followYou={ride?.status === "in_progress" ? true : Boolean(pos)}
              stableCamera={ride?.status !== "in_progress"}
              onPickDestination={mapPickMode && pos && !geocodingDest ? handlePickDestination : undefined}
              onRecenter={pos ? () => haptic("light") : undefined}
              nearbyRiders={showNearbyRiders ? mapNearbyRiders : undefined}
            />
            {passengerBoltHome ? (
              <div className="tugende-sheet">
                {locStatus !== "active" || !pos ? (
                  <div className="tugende-loc-banner tugende-loc-banner--sheet">
                    <p className="tugende-gps tugende-gps--wait">
                      {locationGranted || isTugendeLocationGranted()
                        ? "Reconnecting to GPS…"
                        : "Turn on precise location to set pickup."}
                    </p>
                    {!locationGranted && !isTugendeLocationGranted() ? (
                      <button type="button" className="btn btn-primary" onClick={enableLocation}>
                        Allow location
                      </button>
                    ) : (
                      <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                        Refresh GPS
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <TugendeRouteSheet
                      pickupLabel={pickupLabel}
                      pickupLoading={pickupLoading}
                      dropoffQuery={dropoffQuery}
                      dropoffLabel={dropoff?.label ?? null}
                      suggestions={placeSuggestions}
                      searching={placeSearching}
                      onDropoffQueryChange={setDropoffQuery}
                      onSelectPlace={selectPlace}
                      onClearDropoff={clearDropoff}
                      onUseMapPick={() => setMapPickMode(true)}
                      dropoffFocused={dropoffFocused}
                      onDropoffFocus={onDropoffFocus}
                      onDropoffBlur={() => setDropoffFocused(false)}
                      onRefreshPickup={() => {
                        if (pos) {
                          lastPickupGeocodeRef.current = null;
                          void reverseGeocodeLabel(pos.lat, pos.lng).then(setPickupLabel);
                        }
                      }}
                    />
                    {destinationReady ? (
                      <>
                        {plannedKm != null && plannedFare != null ? (
                          <div className="tugende-fare-card tugende-fare-card--sheet">
                            <p className="tugende-fare-card__dest">{dropoff!.label}</p>
                            <div className="tugende-fare-card__row">
                              <span>Trip</span>
                              <strong>{plannedKm.toFixed(2)} km</strong>
                            </div>
                            <div className="tugende-fare-card__row">
                              <span>You pay</span>
                              <strong className="tugende-fare-card__price">UGX {plannedFare.toLocaleString()}</strong>
                            </div>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn-primary tugende-request-btn"
                          disabled={!canRequestRide}
                          onClick={requestRide}
                        >
                          {!pos || locStatus !== "active"
                            ? "Waiting for GPS…"
                            : "Request Tugende"}
                        </button>
                      </>
                    ) : (
                      <p className="tugende-request-hint">Select a dropoff from search or the map to request a ride.</p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>

          {!passengerBoltHome && locStatus !== "active" && !pos ? (
            <div className="tugende-loc-banner">
              <p className="tugende-gps tugende-gps--wait">
                {locationGranted || isTugendeLocationGranted()
                  ? "Reconnecting to GPS…"
                  : locStatus === "starting"
                    ? "Connecting to GPS…"
                    : "Location is off — enable it for live rides."}
              </p>
              {platformHint ? <p className="tugende-loc-hint">{platformHint}</p> : null}
              <div className="tugende-loc-actions">
                {!locationGranted && !isTugendeLocationGranted() ? (
                  <button type="button" className="btn btn-primary" onClick={enableLocation}>
                    Enable live location
                  </button>
                ) : null}
                {(locationGranted || isTugendeLocationGranted() || locStatus === "denied") ? (
                  <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                    Refresh location
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {!ride && !passengerBoltHome ? (
            profile.role === "driver" ? (
              <p className="tugende-empty">
                You are online as a Rider. Open the Drive tab to accept incoming requests.
              </p>
            ) : null
          ) : !passengerBoltHome && ride ? (
            <div className="tugende-active">
              <div className="tugende-fare-card">
                <p>
                  Status: <strong>{ride.status.replace("_", " ")}</strong>
                </p>
                <div className="tugende-fare-card__row">
                  <span>{ride.status === "in_progress" ? "Trip distance" : "Est. distance"}</span>
                  <strong>{ride.distanceKm.toFixed(2)} km</strong>
                </div>
                <div className="tugende-fare-card__row">
                  <span>{ride.status === "in_progress" ? "Meter running" : "Est. fare"}</span>
                  <strong className="tugende-fare-card__price">UGX {ride.fareUgx.toLocaleString()}</strong>
                </div>
              </div>
              {canStartRide ? (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={startRideFlow}>
                  Start ride
                </button>
              ) : null}
              {canEndRide ? (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={endRideFlow}>
                  {profile.role === "driver" ? "End ride (charge passenger)" : "End ride & pay"}
                </button>
              ) : null}
              {ride.status === "pending" && isRiderOnRide ? (
                <button type="button" className="btn btn-secondary" onClick={cancelRideFlow}>
                  Cancel request
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "trips" ? (
        <section className="tugende-panel tugende-panel--trips card">
          <TugendeJourneyList
            rides={journeyHistory}
            viewerId={telegramKey}
            viewerRole={profile.role}
            loading={journeysLoading}
            onRefresh={() => void refreshJourneys()}
          />
        </section>
      ) : null}

      {tab === "wallet" ? (
        <section className="card tugende-panel tugende-panel--wallet">
          <div className="tugende-wallet-hero">
            <p className="tugende-wallet-hero__label">Available balance</p>
            <p className="tugende-wallet-hero__amount">UGX {profile.walletBalanceUgx.toLocaleString()}</p>
            <p className="tugende-momo-note tugende-wallet-hero__note">
              {momoEnabled
                ? "Top-ups use MTN MoMo STK push to your registered number."
                : "Demo wallet — set MOMO_* env on Vercel for live mobile money."}
            </p>
          </div>
          <h2 className="tugende-panel__title">Quick top-up</h2>
          <div className="tugende-topups">
            {[5000, 10000, 20000, 50000].map((amt) => (
              <button key={amt} type="button" className="btn btn-secondary" disabled={loading} onClick={() => topUp(amt)}>
                + {amt.toLocaleString()}
              </button>
            ))}
          </div>
          <form onSubmit={onWithdraw} className="tugende-withdraw">
            <h3>Payout / withdraw</h3>
            <label className="field">
              Mobile money number
              <input value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)} required />
            </label>
            <label className="field">
              Amount (UGX)
              <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Withdraw
            </button>
          </form>
        </section>
      ) : null}

      {tab === "drive" && profile.role === "driver" && ride?.status === "in_progress" ? (
        <section className="card tugende-panel">
          <h2 className="tugende-panel__title">Active trip (live meter)</h2>
          <div className="tugende-live-meter tugende-live-meter--compact">
            <div>
              <span className="tugende-live-meter__label">Distance</span>
              <strong>{ride.distanceKm.toFixed(2)} km</strong>
            </div>
            <div>
              <span className="tugende-live-meter__label">Earnings</span>
              <strong className="tugende-live-meter__fare">UGX {ride.fareUgx.toLocaleString()}</strong>
            </div>
          </div>
          <p className="tugende-signin__hint">GPS is on while you move. Open the Ride tab for the full map.</p>
          <button type="button" className="btn btn-primary" onClick={() => setTab("ride")}>
            Open live map
          </button>
        </section>
      ) : null}

      {tab === "drive" && profile.role === "driver" ? (
        <section className="card tugende-panel">
          <h2 className="tugende-panel__title">Open ride requests</h2>
          {locStatus !== "active" ? (
            <div className="tugende-loc-banner">
              <p className="tugende-gps tugende-gps--wait">
                {locationGranted || isTugendeLocationGranted()
                  ? "Reconnecting to GPS…"
                  : "Turn on location to accept rides and meter trips."}
              </p>
              {!locationGranted && !isTugendeLocationGranted() ? (
                <button type="button" className="btn btn-primary" onClick={enableLocation}>
                  Enable live location
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                  Refresh GPS
                </button>
              )}
            </div>
          ) : null}
          {pending.length === 0 ? (
            <p className="tugende-empty">No pending rides. Stay online with GPS on.</p>
          ) : (
            pending.map((r) => (
              <div key={r.rideId} className="tugende-pending tugende-pending--card">
                <div className="tugende-pending__route">
                  <span className="tugende-pending__dot tugende-pending__dot--pick" />
                  <span>{r.pickup.label ?? "Pickup"}</span>
                </div>
                <div className="tugende-pending__route">
                  <span className="tugende-pending__dot tugende-pending__dot--drop" />
                  <span>{r.dropoff.label ?? "Dropoff"}</span>
                </div>
                <p className="tugende-pending__meta">
                  Est. {r.estimatedKm?.toFixed(1) ?? "?"} km · UGX {r.fareUgx.toLocaleString()}
                </p>
                <button type="button" className="btn btn-primary" onClick={() => acceptPending(r.rideId)}>
                  Accept ride
                </button>
              </div>
            ))
          )}
          <div className="tugende-drive-history">
            <h3 className="tugende-drive-history__title">Your completed drives</h3>
            <TugendeJourneyList
              rides={journeyHistory.filter((r) => r.driverId === telegramKey)}
              viewerId={telegramKey}
              viewerRole="driver"
              loading={journeysLoading}
              compact
              onRefresh={() => void refreshJourneys()}
            />
          </div>
        </section>
      ) : null}

      {tab === "drive" && profile.role !== "driver" ? (
        <p className="institutional-page__lead">Switch to Rider at sign-in to accept trips.</p>
      ) : null}

      <Link to="/" className="tugende-back-link">
        Back to Home
      </Link>
    </main>
  );
}
