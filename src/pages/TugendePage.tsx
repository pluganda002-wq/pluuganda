import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SubPageBar } from "@/components/SubPageBar";
import { TugendeSignIn } from "@/components/tugende/TugendeSignIn";
import { fareFromKm, haversineKm, pathDistanceKm, reverseGeocodeLabel } from "@/lib/tugende/geo";
import { TugendeMap } from "@/components/tugende/TugendeMap";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import {
  tugendeAcceptRide,
  tugendeCancelRide,
  tugendeCompleteRide,
  tugendeFetchActiveRide,
  tugendeFetchProfile,
  tugendeFetchWalletConfig,
  tugendePendingRides,
  tugendeRequestRide,
  tugendeStartRide,
  tugendeTopUp,
  tugendeUpdateLocation,
  tugendeWithdraw,
} from "@/lib/tugende/api";
import type { TugendeRide, TugendeUser } from "@/lib/tugende/types";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import "./TugendePage.css";

const LOGO = "/branding/tugende-safe-boda.png";

type Tab = "ride" | "wallet" | "drive";

const DEV_TELEGRAM_ID = 800_001;

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
  const [pickingDestination, setPickingDestination] = useState(false);
  const [geocodingDest, setGeocodingDest] = useState(false);

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
      if (!prev || prev.rideId !== r.rideId) return r;
      if (prev.status === "in_progress" && (prev.path?.length ?? 0) > (r.path?.length ?? 0)) {
        return { ...r, path: prev.path, distanceKm: prev.distanceKm, fareUgx: prev.fareUgx };
      }
      return r;
    });
  }, [telegramId]);

  const { position, status: locStatus, platformHint, enableLocation, retryAfterSettings } = useLiveLocation(
    Boolean(profile)
  );
  const pos = position ? { lat: position.lat, lng: position.lng } : null;

  useEffect(() => {
    if (!telegramId) return;
    refreshProfile();
    refreshRide();
    tugendeFetchWalletConfig().then((c) => setMomoEnabled(c.momoEnabled)).catch(() => setMomoEnabled(false));
  }, [telegramId, refreshProfile, refreshRide]);

  useEffect(() => {
    if (!telegramId || !pos) return;
    tugendeUpdateLocation(telegramId, pos.lat, pos.lng).catch(() => {});
  }, [telegramId, pos?.lat, pos?.lng]);

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

  async function handlePickDestination(point: { lat: number; lng: number }) {
    if (!pos) return;
    setGeocodingDest(true);
    haptic("light");
    try {
      const label = await reverseGeocodeLabel(point.lat, point.lng);
      const km = haversineKm(pos.lat, pos.lng, point.lat, point.lng);
      setDropoff({ lat: point.lat, lng: point.lng, label });
      setPickingDestination(false);
      showAlert(`Destination set · ${km.toFixed(1)} km · UGX ${fareFromKm(km).toLocaleString()}`);
    } finally {
      setGeocodingDest(false);
    }
  }

  function startPickDestination() {
    if (!pos) {
      showAlert("Waiting for GPS…");
      return;
    }
    setPickingDestination(true);
    haptic("light");
  }

  async function requestRide() {
    if (!telegramId || !pos || !dropoff) return;
    setLoading(true);
    try {
      const r = await tugendeRequestRide(
        telegramId,
        { lat: pos.lat, lng: pos.lng, label: "Pickup (live GPS)" },
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
    return (
      <>
        <SubPageBar title="Tugende Safe Boda" backTo="/mobility" />
        {!canSignIn || !telegramId ? (
          <main className="page tugende-page">
            <p className="tugende-signin__error card">
              Open <strong>PluPatriot</strong> from the Telegram bot (Menu → Open app), then return to Tugende to sign in.
            </p>
          </main>
        ) : (
          <TugendeSignIn
            telegramId={telegramId}
            defaultName={displayName}
            suggestedPlu={member?.memberId}
            suggestedPhone={member?.phone}
            haptic={haptic}
            onError={showAlert}
            onComplete={(user) => {
              setProfile(user);
              showAlert(`Welcome to Tugende Safe Boda, ${user.fullName}.`);
            }}
          />
        )}
      </>
    );
  }

  const plannedKm =
    pos && dropoff ? haversineKm(pos.lat, pos.lng, dropoff.lat, dropoff.lng) : null;
  const plannedFare = plannedKm != null ? fareFromKm(plannedKm) : null;

  const mapDestination = ride ? { lat: ride.dropoff.lat, lng: ride.dropoff.lng } : dropoff;
  const mapSize =
    ride?.status === "in_progress" || pickingDestination || dropoff ? "fullscreen" : "large";
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

  return (
    <main className="page tugende-page">
      <SubPageBar title="Tugende Safe Boda" backTo="/mobility" />
      <header className="tugende-header card card--flat">
        <img src={LOGO} alt="" className="tugende-header__logo" width={56} height={56} />
        <div>
          <strong>{profile.fullName}</strong>
          <p className="tugende-header__meta">
            {profile.role === "driver" ? "Rider" : "Passenger"}
            {profile.loginMethod ? ` · ${profile.loginMethod}` : ""}
            {profile.phone ? ` · ${profile.phone}` : profile.loginId ? ` · ${profile.loginId}` : ""}
          </p>
          <p className="tugende-header__wallet">
            Wallet: <span>UGX {profile.walletBalanceUgx.toLocaleString()}</span>
          </p>
        </div>
      </header>

      <nav className="tugende-tabs" aria-label="Tugende sections">
        {(["ride", "wallet", "drive"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tugende-tabs__btn${tab === t ? " tugende-tabs__btn--on" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "ride" ? "Ride" : t === "wallet" ? "Wallet" : "Drive"}
          </button>
        ))}
      </nav>

      {tab === "ride" ? (
        <section className="card tugende-panel tugende-panel--map">
          <h2 className="tugende-panel__title">
            {ride?.status === "in_progress" ? "Live trip" : "Map & destination"}
          </h2>
          {pickingDestination ? (
            <p className="tugende-map-hint">Tap on the map where you want to go.</p>
          ) : null}
          <TugendeMap
            you={pos}
            destination={mapDestination}
            path={ride?.status === "in_progress" ? livePath : undefined}
            size={mapSize}
            pickMode={pickingDestination}
            followYou={ride?.status === "in_progress"}
            onPickDestination={pickingDestination ? handlePickDestination : undefined}
          />
          {locStatus === "active" && pos ? (
            <p className="tugende-gps">
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              {position?.accuracyM ? ` · ±${Math.round(position.accuracyM)} m` : ""}
            </p>
          ) : (
            <div className="tugende-loc-banner">
              <p className="tugende-gps tugende-gps--wait">
                {locStatus === "starting"
                  ? "Connecting to GPS…"
                  : "Location is off — enable it for live metered rides."}
              </p>
              {platformHint ? <p className="tugende-loc-hint">{platformHint}</p> : null}
              <div className="tugende-loc-actions">
                <button type="button" className="btn btn-primary" onClick={enableLocation}>
                  Enable live location
                </button>
                {locStatus === "denied" ? (
                  <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                    Refresh location
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {!ride ? (
            profile.role === "rider" ? (
              <>
                {plannedKm != null && plannedFare != null && dropoff ? (
                  <div className="tugende-fare-card">
                    <p className="tugende-fare-card__dest">{dropoff.label}</p>
                    <div className="tugende-fare-card__row">
                      <span>Distance</span>
                      <strong>{plannedKm.toFixed(2)} km</strong>
                    </div>
                    <div className="tugende-fare-card__row">
                      <span>You pay</span>
                      <strong className="tugende-fare-card__price">UGX {plannedFare.toLocaleString()}</strong>
                    </div>
                  </div>
                ) : null}
                <div className="tugende-dest-actions">
                  <button
                    type="button"
                    className={`btn ${pickingDestination ? "btn-primary" : "btn-secondary"}`}
                    disabled={!pos || geocodingDest}
                    onClick={startPickDestination}
                  >
                    {geocodingDest ? "Setting destination…" : pickingDestination ? "Tap map to set…" : "Choose destination on map"}
                  </button>
                  {dropoff ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setDropoff(null);
                        setPickingDestination(false);
                      }}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={loading || !pos || !dropoff}
                  onClick={requestRide}
                >
                  Request Safe Boda
                </button>
              </>
            ) : (
              <p className="tugende-empty">
                You are online as a Rider. Open the Drive tab to accept incoming requests.
              </p>
            )
          ) : (
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
          )}
        </section>
      ) : null}

      {tab === "wallet" ? (
        <section className="card tugende-panel">
          <h2 className="tugende-panel__title">Wallet</h2>
          <p className="tugende-momo-note">
            {momoEnabled
              ? "Top-ups use MTN MoMo STK push to your registered number."
              : "Demo wallet — set MOMO_* env on Vercel for real mobile money."}
          </p>
          <p className="tugende-balance">UGX {profile.walletBalanceUgx.toLocaleString()}</p>
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

      {tab === "drive" && profile.role === "driver" ? (
        <section className="card tugende-panel">
          <h2 className="tugende-panel__title">Open ride requests</h2>
          {pending.length === 0 ? (
            <p className="tugende-empty">No pending rides. Stay online with GPS on.</p>
          ) : (
            pending.map((r) => (
              <div key={r.rideId} className="tugende-pending">
                <strong>{r.rideId}</strong>
                <p>
                  Est. {r.estimatedKm?.toFixed(1) ?? "?"} km · UGX {r.fareUgx.toLocaleString()}
                </p>
                <button type="button" className="btn btn-primary" onClick={() => acceptPending(r.rideId)}>
                  Accept ride
                </button>
              </div>
            ))
          )}
        </section>
      ) : null}

      {tab === "drive" && profile.role !== "driver" ? (
        <p className="institutional-page__lead">Switch to Rider at sign-in to accept trips.</p>
      ) : null}

      <Link to="/mobility" className="tugende-back-link">
        Back to mobility hub
      </Link>
    </main>
  );
}
