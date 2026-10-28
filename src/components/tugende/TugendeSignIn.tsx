import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, Hash, Chrome } from "lucide-react";
import { TugendeMap } from "@/components/tugende/TugendeMap";
import { isTugendeLocationGranted, useLiveLocation } from "@/hooks/useLiveLocation";
import { tugendeLogin, tugendeVerifyPluNumber } from "@/lib/tugende/api";
import type { TugendeLoginMethod, TugendeRole, TugendeUser } from "@/lib/tugende/types";
import "./TugendeSignIn.css";

type Step = "phone" | "location" | "profile" | "alt-method" | "alt-account";

const ALT_METHODS: { id: TugendeLoginMethod; label: string; Icon: typeof Phone }[] = [
  { id: "google", label: "Google (Gmail)", Icon: Chrome },
  { id: "email", label: "Email", Icon: Mail },
  { id: "plu", label: "PLU number", Icon: Hash },
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

function normalizeUgPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("256")) return digits;
  if (digits.startsWith("0")) return `256${digits.slice(1)}`;
  return digits;
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
  const [step, setStep] = useState<Step>("phone");
  const [method, setMethod] = useState<TugendeLoginMethod>("phone");
  const [phoneLocal, setPhoneLocal] = useState(() => {
    const p = suggestedPhone?.replace(/\D/g, "") ?? "";
    if (p.startsWith("256")) return p.slice(3);
    if (p.startsWith("0")) return p.slice(1);
    return p;
  });
  const [accountValue, setAccountValue] = useState("");
  const [fullName, setFullName] = useState(defaultName);
  const [role, setRole] = useState<TugendeRole>("rider");
  const [walletPhone, setWalletPhone] = useState(suggestedPhone ?? "");
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [pluVerifiedName, setPluVerifiedName] = useState<string | null>(null);

  const { position, status: locStatus, platformHint, enableLocation, retryAfterSettings, locationGranted } =
    useLiveLocation(step === "location");
  const locAlreadyGranted = locationGranted || isTugendeLocationGranted();
  const pos = position ? { lat: position.lat, lng: position.lng } : null;

  useEffect(() => {
    setFullName(defaultName);
  }, [defaultName]);

  function clearError() {
    setInlineError(null);
  }

  function onPhoneContinue(e: FormEvent) {
    e.preventDefault();
    clearError();
    const normalized = normalizeUgPhone(phoneLocal);
    if (normalized.length < 11) {
      setInlineError("Enter a valid Uganda mobile number.");
      return;
    }
    setMethod("phone");
    setStep("location");
    haptic("light");
  }

  function pickAltMethod(id: TugendeLoginMethod) {
    clearError();
    setMethod(id);
    if (id === "plu" && suggestedPlu) setAccountValue(suggestedPlu);
    else setAccountValue("");
    setPluVerifiedName(null);
    setStep("alt-account");
    haptic("light");
  }

  async function onAltAccountContinue(e: FormEvent) {
    e.preventDefault();
    clearError();
    const v = accountValue.trim();
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setInlineError("Enter a valid email address.");
      return;
    }
    if (method === "google" && !/^[^\s@]+@(gmail|googlemail)\.com$/i.test(v)) {
      setInlineError("Enter your Gmail address.");
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
        /* optional */
      } finally {
        setLoading(false);
      }
    }
    setStep("location");
    haptic("light");
  }

  function onProfileContinue(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (!fullName.trim()) {
      setInlineError("Enter your full name.");
      return;
    }
    void finishSignIn();
  }

  async function finishSignIn() {
    clearError();
    if (!telegramId) {
      onError("Open PluPatriot from Telegram to sign in securely.");
      return;
    }
    if (locStatus !== "active" || !pos) {
      setInlineError("Allow precise location first — it sets your pickup automatically.");
      setStep("location");
      return;
    }

    const loginId =
      method === "phone"
        ? normalizeUgPhone(phoneLocal)
        : method === "plu"
          ? normalizePlu(accountValue)
          : accountValue.trim();

    const phoneForWallet =
      method === "phone" ? loginId.replace(/^256/, "0") : walletPhone.trim() || suggestedPhone || "";

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

  function goBack() {
    clearError();
    if (step === "location") setStep(method === "phone" ? "phone" : "alt-account");
    else if (step === "profile") setStep("location");
    else if (step === "alt-account") setStep("alt-method");
    else if (step === "alt-method") setStep("phone");
  }

  const mainStepIndex =
    step === "phone" || step === "alt-method" || step === "alt-account"
      ? 1
      : step === "location"
        ? 2
        : 3;

  return (
    <main className="tugende-onboard">
      <ol className="tugende-onboard__steps" aria-label="Sign-in progress">
        {["Phone", "Location", "Profile"].map((label, i) => (
          <li
            key={label}
            className={`tugende-onboard__step${mainStepIndex === i + 1 ? " tugende-onboard__step--on" : ""}${mainStepIndex > i + 1 ? " tugende-onboard__step--done" : ""}`}
          >
            {label}
          </li>
        ))}
      </ol>

      {inlineError ? (
        <p className="tugende-signin__error" role="alert">
          {inlineError}
        </p>
      ) : null}

      {step !== "phone" ? (
        <button type="button" className="tugende-onboard__back" onClick={goBack}>
          <ArrowLeft size={22} aria-hidden />
          Back
        </button>
      ) : null}

      {step === "phone" ? (
        <form className="tugende-onboard__panel" onSubmit={onPhoneContinue}>
          <h1 className="tugende-onboard__title">Enter your number</h1>
          <p className="tugende-onboard__lead">We&apos;ll use this for your Tugende wallet and ride receipts.</p>
          <div className="tugende-phone-row">
            <div className="tugende-phone-row__code">🇺🇬 +256</div>
            <input
              className="tugende-phone-row__input"
              value={phoneLocal}
              onChange={(e) => setPhoneLocal(e.target.value.replace(/[^\d\s]/g, ""))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="7xx xxx xxx"
              required
            />
          </div>
          <p className="tugende-onboard__fine">Tugende will not charge you without your consent.</p>
          <button type="submit" className="btn btn-primary tugende-onboard__continue">
            Continue
          </button>
          <button type="button" className="tugende-onboard__link" onClick={() => setStep("alt-method")}>
            Other sign-in options (email, Google, PLU)
          </button>
        </form>
      ) : null}

      {step === "alt-method" ? (
        <div className="tugende-onboard__panel">
          <h1 className="tugende-onboard__title">Other sign-in</h1>
          <div className="tugende-signin__methods">
            {ALT_METHODS.map(({ id, label, Icon }) => (
              <button key={id} type="button" className="tugende-signin__method" onClick={() => pickAltMethod(id)}>
                <Icon size={22} aria-hidden />
                <strong>{label}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === "alt-account" && method !== "phone" ? (
        <form className="tugende-onboard__panel" onSubmit={onAltAccountContinue}>
          <h1 className="tugende-onboard__title">
            {method === "email" ? "Your email" : method === "google" ? "Your Gmail" : "Your PLU number"}
          </h1>
          <label className="field">
            Account
            <input value={accountValue} onChange={(e) => setAccountValue(e.target.value)} required />
          </label>
          {pluVerifiedName ? <p className="tugende-signin__ok">PLU record: {pluVerifiedName}</p> : null}
          <button type="submit" className="btn btn-primary tugende-onboard__continue" disabled={loading}>
            Continue
          </button>
        </form>
      ) : null}

      {step === "location" ? (
        <div className="tugende-onboard__panel tugende-onboard__panel--location">
          <h1 className="tugende-onboard__title">Allow location access</h1>
          <p className="tugende-onboard__lead">
            Tugende needs <strong>precise</strong> location to set pickup, show the map clearly, and meter trips at UGX
            1,000/km. Use the Telegram app on your phone.
          </p>
          <TugendeMap you={pos} size="fullscreen" followYou={Boolean(pos)} onRecenter={() => {}} />
          {locStatus === "active" && pos ? (
            <p className="tugende-signin__ok">Precise location ready · pickup will use this point.</p>
          ) : (
            <>
              <p className="tugende-gps tugende-gps--wait">
                {locAlreadyGranted || locStatus === "starting"
                  ? "Reconnecting to GPS…"
                  : "Choose “While using the app” / Allow when asked."}
              </p>
              {platformHint ? <p className="tugende-loc-hint">{platformHint}</p> : null}
              <div className="tugende-loc-actions">
                {!locAlreadyGranted ? (
                  <button type="button" className="btn btn-primary" onClick={enableLocation}>
                    Allow location access
                  </button>
                ) : null}
                <button type="button" className="btn btn-secondary" onClick={retryAfterSettings}>
                  {locAlreadyGranted ? "Refresh GPS" : "Refresh after Allow"}
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            className="btn btn-primary tugende-onboard__continue"
            disabled={locStatus !== "active" || !pos}
            onClick={() => setStep("profile")}
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === "profile" ? (
        <form className="tugende-onboard__panel" onSubmit={onProfileContinue}>
          <h1 className="tugende-onboard__title">About you</h1>
          <label className="field">
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <p className="tugende-page__role-label">I am a</p>
          <div className="tugende-role-pick">
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
              Rider (driver)
            </button>
          </div>
          {method !== "phone" ? (
            <label className="field">
              Mobile money number
              <input value={walletPhone} onChange={(e) => setWalletPhone(e.target.value)} inputMode="tel" />
            </label>
          ) : null}
          <button type="submit" className="btn btn-primary tugende-onboard__continue" disabled={loading}>
            {loading ? "Starting Tugende…" : "Enter Tugende"}
          </button>
        </form>
      ) : null}
    </main>
  );
}