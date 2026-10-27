import { FormEvent, useEffect, useState } from "react";
import { Mail, Phone, Hash, Chrome } from "lucide-react";
import { TugendeMap } from "@/components/tugende/TugendeMap";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import { TUGENDE_RATE_UGX_PER_KM } from "@/lib/tugende/geo";
import { tugendeLogin, tugendeVerifyPluNumber } from "@/lib/tugende/api";
import type { TugendeLoginMethod, TugendeRole, TugendeUser } from "@/lib/tugende/types";

const LOGO = "/branding/tugende-safe-boda.png";

type Step = "method" | "account" | "name" | "location";

const METHODS: { id: TugendeLoginMethod; label: string; hint: string; Icon: typeof Phone }[] = [
  { id: "phone", label: "Phone number", hint: "Mobile money / SMS", Icon: Phone },
  { id: "google", label: "Google", hint: "Gmail account", Icon: Chrome },
  { id: "email", label: "Email", hint: "Email address", Icon: Mail },
  { id: "plu", label: "PLU number", hint: "e.g. PLU-482910", Icon: Hash },
];

type Props = {
  telegramId: number;
  defaultName: string;
  suggestedPlu?: string;
  suggestedPhone?: string;
  onComplete: (user: TugendeUser) => void;
  onError: (message: string) => void;
  haptic: (type?: "light" | "medium" | "heavy") => void;
};

function normalizePlu(raw: string) {
  const t = raw.trim().toUpperCase();
  if (/^PLU-\d{6}$/.test(t)) return t;
  const digits = t.replace(/\D/g, "");
  if (digits.length === 6) return `PLU-${digits}`;
  return t;
}

export function TugendeSignIn({
  telegramId,
  defaultName,
  suggestedPlu,
  suggestedPhone,
  onComplete,
  onError,
  haptic,
}: Props) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<TugendeLoginMethod | null>(null);
  const [accountValue, setAccountValue] = useState("");
  const [fullName, setFullName] = useState(defaultName);
  const [role, setRole] = useState<TugendeRole>("rider");
  const [walletPhone, setWalletPhone] = useState(suggestedPhone ?? "");
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [pluVerifiedName, setPluVerifiedName] = useState<string | null>(null);

  const { position, status: locStatus, platformHint, enableLocation, retryAfterSettings } = useLiveLocation(
    step === "location"
  );
  const pos = position ? { lat: position.lat, lng: position.lng } : null;

  useEffect(() => {
    setFullName(defaultName);
  }, [defaultName]);

  function clearError() {
    setInlineError(null);
  }

  function pickMethod(id: TugendeLoginMethod) {
    clearError();
    setMethod(id);
    if (id === "plu" && suggestedPlu) setAccountValue(suggestedPlu);
    else if (id === "phone" && suggestedPhone) setAccountValue(suggestedPhone);
    else setAccountValue("");
    setPluVerifiedName(null);
    setStep("account");
    haptic("light");
  }

  async function onAccountContinue(e: FormEvent) {
    e.preventDefault();
    clearError();
    const v = accountValue.trim();
    if (!method) return;

    if (method === "phone" && v.replace(/\D/g, "").length < 9) {
      setInlineError("Enter a valid Uganda phone number (07… or 256…).");
      return;
    }
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setInlineError("Enter a valid email address.");
      return;
    }
    if (method === "google" && !/^[^\s@]+@(gmail|googlemail)\.com$/i.test(v)) {
      setInlineError("Enter your Gmail address (name@gmail.com).");
      return;
    }
    if (method === "plu") {
      const plu = normalizePlu(v);
      if (!/^PLU-\d{6}$/.test(plu)) {
        setInlineError("PLU number must look like PLU-482910.");
        return;
      }
      setAccountValue(plu);
      setLoading(true);
      try {
        const hit = await tugendeVerifyPluNumber(plu);
        if (hit?.fullName) {
          setPluVerifiedName(hit.fullName);
          setFullName(hit.fullName);
        }
      } catch {
        /* optional lookup */
      } finally {
        setLoading(false);
      }
    }

    setStep("name");
    haptic("light");
  }

  function onNameContinue(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (!fullName.trim()) {
      setInlineError("Enter your full name.");
      return;
    }
    setStep("location");
    haptic("light");
  }

  async function finishSignIn() {
    clearError();
    if (!method || !telegramId) {
      onError("Open PluPatriot from Telegram to sign in securely.");
      return;
    }
    if (locStatus !== "active" || !pos) {
      setInlineError("Allow location access first — Tugende needs GPS for fares and safety.");
      return;
    }

    const loginId =
      method === "plu" ? normalizePlu(accountValue) : method === "phone" ? accountValue.replace(/\s/g, "") : accountValue.trim();

    const phoneForWallet =
      method === "phone" ? loginId : walletPhone.trim() || suggestedPhone || "";

    setLoading(true);
    try {
      const user = await tugendeLogin({
        telegramId,
        fullName: fullName.trim(),
        phone: phoneForWallet,
        role,
        loginMethod: method,
        loginId,
      });
      haptic("medium");
      onComplete(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setInlineError(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = step === "method" ? 1 : step === "account" ? 2 : step === "name" ? 3 : 4;

  return (
    <main className="page tugende-page tugende-signin">
      <img src={LOGO} alt="" className="tugende-page__logo" width={120} height={120} />
      <p className="tugende-page__rate">UGX {TUGENDE_RATE_UGX_PER_KM.toLocaleString()} per km · live GPS meter</p>

      <ol className="tugende-signin__steps" aria-label="Sign-in progress">
        {["Login", "Account", "Name", "Location"].map((label, i) => (
          <li key={label} className={`tugende-signin__step${stepIndex === i + 1 ? " tugende-signin__step--on" : ""}${stepIndex > i + 1 ? " tugende-signin__step--done" : ""}`}>
            <span>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {inlineError ? (
        <p className="tugende-signin__error" role="alert">
          {inlineError}
        </p>
      ) : null}

      {step === "method" ? (
        <div className="card tugende-signin__panel">
          <h2 className="tugende-page__form-title">How do you want to sign in?</h2>
          <div className="tugende-signin__methods">
            {METHODS.map(({ id, label, hint, Icon }) => (
              <button key={id} type="button" className="tugende-signin__method" onClick={() => pickMethod(id)}>
                <Icon size={22} aria-hidden />
                <strong>{label}</strong>
                <span>{hint}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === "account" && method ? (
        <form className="card tugende-signin__panel" onSubmit={onAccountContinue}>
          <h2 className="tugende-page__form-title">
            {method === "phone" && "Your phone number"}
            {method === "google" && "Your Google (Gmail)"}
            {method === "email" && "Your email"}
            {method === "plu" && "Your PLU member number"}
          </h2>
          <label className="field">
            {method === "phone" && "Phone"}
            {method === "google" && "Gmail address"}
            {method === "email" && "Email"}
            {method === "plu" && "PLU number"}
            <input
              value={accountValue}
              onChange={(e) => setAccountValue(e.target.value)}
              placeholder={
                method === "phone"
                  ? "07xx xxx xxx"
                  : method === "plu"
                    ? "PLU-482910"
                    : method === "google"
                      ? "you@gmail.com"
                      : "you@example.com"
              }
              inputMode={method === "phone" ? "tel" : method === "email" || method === "google" ? "email" : "text"}
              autoComplete={
                method === "phone" ? "tel" : method === "email" || method === "google" ? "email" : "off"
              }
              required
            />
          </label>
          {pluVerifiedName ? <p className="tugende-signin__ok">PLU record found: {pluVerifiedName}</p> : null}
          {method === "google" ? (
            <p className="tugende-signin__hint">We link your Gmail as your Tugende ID. Full Google OAuth is coming soon.</p>
          ) : null}
          <div className="tugende-signin__nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep("method")}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Continue
            </button>
          </div>
        </form>
      ) : null}

      {step === "name" ? (
        <form className="card tugende-signin__panel" onSubmit={onNameContinue}>
          <h2 className="tugende-page__form-title">Your name</h2>
          <label className="field">
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <p className="tugende-page__role-label">I am a</p>
          <div className="tugende-role-pick tugende-role-pick--triple">
            <button
              type="button"
              className={`tugende-role-pick__btn${role === "rider" ? " tugende-role-pick__btn--on" : ""}`}
              onClick={() => setRole("rider")}
            >
              Passenger
            </button>
            <button
              type="button"
              className={`tugende-role-pick__btn${role === "driver" ? " tugende-role-pick__btn--on" : ""}`}
              onClick={() => setRole("driver")}
            >
              Rider
            </button>
          </div>
          <p className="tugende-signin__hint">Passengers request rides; Riders accept trips and earn per km.</p>
          {method !== "phone" ? (
            <label className="field">
              Mobile money number (wallet & payouts)
              <input
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                placeholder="07xx xxx xxx"
                inputMode="tel"
              />
            </label>
          ) : null}
          <div className="tugende-signin__nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep("account")}>
              Back
            </button>
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </div>
        </form>
      ) : null}

      {step === "location" ? (
        <div className="card tugende-signin__panel">
          <h2 className="tugende-page__form-title">Allow location access</h2>
          <p className="tugende-signin__hint">
            Tugende needs your live GPS to match rides, meter distance at UGX 1,000/km, and keep riders and drivers safe.
            Use the <strong>Telegram app on your phone</strong> for best results.
          </p>
          <TugendeMap you={pos} size="fullscreen" followYou={Boolean(pos)} />
          {locStatus === "active" && pos ? (
            <p className="tugende-gps tugende-signin__ok">
              Your location · {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              {position?.accuracyM ? ` (±${Math.round(position.accuracyM)} m)` : ""}
            </p>
          ) : (
            <>
              <p className="tugende-gps tugende-gps--wait">
                {locStatus === "starting"
                  ? "Connecting to GPS… allow if your phone asks."
                  : "Waiting for GPS — tap Allow location access below."}
              </p>
              {platformHint ? <p className="tugende-loc-hint">{platformHint}</p> : null}
              <div className="tugende-loc-actions">
                <button type="button" className="btn btn-primary" onClick={enableLocation}>
                  Allow location access
                </button>
                <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                  Refresh after Allow
                </button>
              </div>
            </>
          )}
          <div className="tugende-signin__nav">
            <button type="button" className="btn btn-secondary" onClick={() => setStep("name")}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading || locStatus !== "active" || !pos}
              onClick={() => void finishSignIn()}
            >
              {loading ? "Signing in…" : "Enter Tugende"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
