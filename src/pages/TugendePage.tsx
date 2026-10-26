import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SubPageBar } from "@/components/SubPageBar";
import { TUGENDE_RATE_UGX_PER_KM, fareFromKm, haversineKm } from "@/lib/tugende/geo";
import { TugendeMap } from "@/components/tugende/TugendeMap";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import {
  tugendeAcceptRide,
  tugendeCancelRide,
  tugendeCompleteRide,
  tugendeFetchActiveRide,
  tugendeFetchProfile,
  tugendeFetchWalletConfig,
  tugendeLogin,
  tugendePendingRides,
  tugendeRequestRide,
  tugendeStartRide,
  tugendeTopUp,
  tugendeUpdateLocation,
  tugendeWithdraw,
} from "@/lib/tugende/api";
import type { TugendeRide, TugendeRole, TugendeUser } from "@/lib/tugende/types";
import { useTelegram } from "@/hooks/useTelegram";
import "./TugendePage.css";

const LOGO = "/branding/tugende-safe-boda.png";

type Tab = "ride" | "wallet" | "drive";

const DEV_TELEGRAM_ID = 800_001;

export function TugendePage() {
  const { user: tgUser, displayName, haptic, showAlert } = useTelegram();
  const telegramId = tgUser?.id ?? (import.meta.env.DEV ? DEV_TELEGRAM_ID : 0);
  const telegramKey = String(telegramId);

  const [profile, setProfile] = useState<TugendeUser | null>(null);
  const [tab, setTab] = useState<Tab>("ride");
  const [ride, setRide] = useState<TugendeRide | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [momoEnabled, setMomoEnabled] = useState(false);
  const [pending, setPending] = useState<TugendeRide[]>([]);
  const [loading, setLoading] = useState(false);

  const [loginName, setLoginName] = useState(displayName);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginRole, setLoginRole] = useState<TugendeRole>("rider");

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
    setRide(r);
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
    if (!ride || !["pending", "accepted"].includes(ride.status)) return;
    const t = setInterval(refreshRide, 3000);
    return () => clearInterval(t);
  }, [ride, refreshRide]);

  useEffect(() => {
    if (profile?.role !== "driver" || tab !== "drive") return;
    const load = () => tugendePendingRides().then(setPending).catch(() => setPending([]));
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [profile?.role, tab]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    if (!telegramId) {
      showAlert("Open from Telegram to sign in securely.");
      return;
    }
    if (!loginPhone.trim()) {
      showAlert("Enter your mobile money number.");
      return;
    }
    setLoading(true);
    try {
      const p = await tugendeLogin(telegramId, loginName.trim(), loginPhone.trim(), loginRole);
      setProfile(p);
      haptic("medium");
      showAlert(`Welcome to Tugende Safe Boda, ${p.fullName}.`);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function setDemoDestination() {
    if (!pos) {
      showAlert("Waiting for GPS…");
      return;
    }
    const lat = pos.lat + 0.018;
    const lng = pos.lng + 0.012;
    const km = haversineKm(pos.lat, pos.lng, lat, lng);
    setDropoff({ lat, lng, label: `Destination (~${km.toFixed(1)} km)` });
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
      <main className="page tugende-page">
        <SubPageBar title="Tugende Safe Boda" backTo="/mobility" />
        <img src={LOGO} alt="" className="tugende-page__logo" width={120} height={120} />
        <p className="tugende-page__rate">UGX {TUGENDE_RATE_UGX_PER_KM.toLocaleString()} per km · live GPS meter</p>
        <p className="tugende-page__rate">After sign-in, tap <strong>Enable live location</strong> (use the Telegram app on your phone for GPS).</p>
        <form className="card" onSubmit={onLogin}>
          <h2 className="tugende-page__form-title">Sign in</h2>
          <label className="field">
            Full name
            <input value={loginName} onChange={(e) => setLoginName(e.target.value)} required />
          </label>
          <label className="field">
            Mobile money number
            <input
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              placeholder="07xx xxx xxx"
              required
            />
          </label>
          <p className="tugende-page__role-label">I am a</p>
          <div className="tugende-role-pick">
            <button
              type="button"
              className={`tugende-role-pick__btn${loginRole === "rider" ? " tugende-role-pick__btn--on" : ""}`}
              onClick={() => setLoginRole("rider")}
            >
              Rider
            </button>
            <button
              type="button"
              className={`tugende-role-pick__btn${loginRole === "driver" ? " tugende-role-pick__btn--on" : ""}`}
              onClick={() => setLoginRole("driver")}
            >
              Boda driver
            </button>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Continue
          </button>
        </form>
      </main>
    );
  }

  const estFare =
    pos && dropoff ? fareFromKm(haversineKm(pos.lat, pos.lng, dropoff.lat, dropoff.lng)) : null;

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
            {profile.role === "driver" ? "Driver" : "Rider"} · {profile.phone}
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
        <section className="card tugende-panel">
          <h2 className="tugende-panel__title">Live location & map</h2>
          <TugendeMap you={pos} destination={dropoff} />
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
                <button type="button" className="btn btn-secondary" onClick={setDemoDestination}>
                  Set destination (~2 km)
                </button>
                {dropoff ? <p className="tugende-drop">{dropoff.label}</p> : null}
                {estFare != null ? (
                  <p className="tugende-est">Estimated fare: UGX {estFare.toLocaleString()}</p>
                ) : null}
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
                You are online as a driver. Open the Drive tab to accept incoming requests.
              </p>
            )
          ) : (
            <div className="tugende-active">
              <p>
                Status: <strong>{ride.status.replace("_", " ")}</strong>
              </p>
              <p>Distance: {ride.distanceKm.toFixed(2)} km</p>
              <p>Fare: UGX {ride.fareUgx.toLocaleString()}</p>
              {canStartRide ? (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={startRideFlow}>
                  Start ride
                </button>
              ) : null}
              {canEndRide ? (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={endRideFlow}>
                  {profile.role === "driver" ? "End ride (charge rider)" : "End ride & pay"}
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
        <p className="institutional-page__lead">Switch to boda driver at sign-in to accept rides.</p>
      ) : null}

      <Link to="/mobility" className="tugende-back-link">
        Back to mobility hub
      </Link>
    </main>
  );
}
