import { FormEvent, useId, useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useUser } from "@/context/UserContext";
import { EndorsementPassCard } from "@/components/endorsement/EndorsementPassCard";
import {
  ENDORSEMENT_AGE_GROUPS,
  ENDORSEMENT_CAMPAIGN,
  ENDORSEMENT_GENDERS,
} from "@/data/endorsementCampaign";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import {
  createLocalEndorsementReference,
  isNationalIdSubmittedLocally,
  rememberSubmittedNationalId,
  type EndorsementReceipt,
} from "@/lib/endorsementPass";
import { checkEndorsementNationalIdApi, isApiUnavailableError, submitEndorsementApi } from "@/lib/api";
import "@/pages/EndorsePage.css";

function normalizeNationalId(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

type Props = {
  onRecorded?: () => void;
};

type Screen = "pass" | "nin-gate" | "form";
type FormMode = "self" | "assist";

export function PublicEndorsementForm({ onRecorded }: Props) {
  const uid = useId();
  const { user, haptic, showAlert } = useTelegram();
  const { endorsementReceipt, setEndorsementReceipt } = useUser();

  const [screen, setScreen] = useState<Screen>(() => (endorsementReceipt ? "pass" : "form"));
  const [mode, setMode] = useState<FormMode>("self");
  const [ninLocked, setNinLocked] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [checkingNin, setCheckingNin] = useState(false);
  const [sessionReceipt, setSessionReceipt] = useState<EndorsementReceipt | null>(null);
  const [viewingAssistedPass, setViewingAssistedPass] = useState(false);

  const [ninGateInput, setNinGateInput] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [publishMessage, setPublishMessage] = useState(false);

  const firstNameId = `${uid}-first-name`;
  const surnameId = `${uid}-surname`;
  const genderId = `${uid}-gender`;
  const nationalIdId = `${uid}-national-id`;
  const ninGateId = `${uid}-nin-gate`;
  const ageGroupId = `${uid}-age-group`;
  const districtId = `${uid}-district`;
  const subCountyId = `${uid}-sub-county`;
  const parishId = `${uid}-parish`;
  const villageId = `${uid}-village`;
  const messageId = `${uid}-message`;
  const consentId = `${uid}-consent`;
  const publishId = `${uid}-publish`;

  function resetFormFields() {
    setFirstName("");
    setSurname("");
    setGender("");
    setAgeGroup("");
    setDistrict("");
    setSubCounty("");
    setParish("");
    setVillage("");
    setMessage("");
    setConsent(false);
    setPublishMessage(false);
    setStep(1);
  }

  function startAssistFlow() {
    resetFormFields();
    setNationalId("");
    setNinGateInput("");
    setNinLocked(false);
    setMode("assist");
    setViewingAssistedPass(false);
    setScreen("nin-gate");
    haptic("light");
  }

  async function verifyNinAndContinue() {
    const nin = normalizeNationalId(ninGateInput);
    if (nin.length < 8) {
      showAlert("Enter a valid National Identification Number.");
      return;
    }
    if (isNationalIdSubmittedLocally(nin)) {
      showAlert("This National ID already has an endorsement on record.");
      return;
    }

    setCheckingNin(true);
    try {
      const result = await checkEndorsementNationalIdApi(nin);
      if (!result.available) {
        showAlert("This National ID already has an endorsement on record.");
        rememberSubmittedNationalId(nin);
        return;
      }
    } catch (err) {
      if (!isApiUnavailableError(err)) {
        showAlert("Could not verify this NIN. Try again.");
        setCheckingNin(false);
        return;
      }
    } finally {
      setCheckingNin(false);
    }

    setNationalId(nin);
    setNinLocked(true);
    setScreen("form");
    setStep(1);
    haptic("medium");
  }

  function validateStep1(): boolean {
    const first = firstName.trim();
    const last = surname.trim();
    const nin = normalizeNationalId(nationalId);
    if (!first || !last) {
      showAlert("Enter first name and surname.");
      return false;
    }
    if (!ninLocked) {
      if (nin.length < 8) {
        showAlert("Enter a valid National Identification Number.");
        return false;
      }
    } else if (nin.length < 8) {
      showAlert("National ID missing. Start again from the NIN check.");
      setScreen("nin-gate");
      return false;
    }
    if (!ageGroup) {
      showAlert("Select an age group.");
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateStep1()) return;
    setStep(2);
    haptic("light");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!district) {
      showAlert("Select a district.");
      return;
    }
    if (!consent) {
      showAlert("Confirm consent before submitting.");
      return;
    }

    const first = firstName.trim();
    const last = surname.trim();
    const nin = normalizeNationalId(nationalId);

    const payload = {
      firstName: first,
      surname: last,
      gender: gender || undefined,
      nationalId: nin,
      ageGroup,
      district,
      subCounty: subCounty.trim() || undefined,
      parish: parish.trim() || undefined,
      village: village.trim() || undefined,
      message: message.trim() || undefined,
      publishMessagePublic: publishMessage && Boolean(message.trim()),
      consent: true,
      telegramId: user?.id,
      telegramUsername: user?.username,
    };

    const recordedAt = new Date().toISOString();
    setSubmitting(true);
    try {
      const result = await submitEndorsementApi(payload);
      const nextReceipt: EndorsementReceipt = {
        reference: result.reference,
        fullName: `${first} ${last}`,
        district,
        recordedAt,
        status: result.status,
      };
      rememberSubmittedNationalId(nin);
      if (mode === "self") {
        setEndorsementReceipt(nextReceipt);
        setSessionReceipt(null);
        setViewingAssistedPass(false);
      } else {
        setSessionReceipt(nextReceipt);
        setViewingAssistedPass(true);
      }
      setScreen("pass");
      haptic("medium");
      showAlert("Endorsement recorded.");
      onRecorded?.();
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        const localRef = createLocalEndorsementReference();
        const nextReceipt: EndorsementReceipt = {
          reference: localRef,
          fullName: `${first} ${last}`,
          district,
          recordedAt,
          status: "pending_review",
        };
        rememberSubmittedNationalId(nin);
        if (mode === "self") {
          setEndorsementReceipt(nextReceipt);
          setSessionReceipt(null);
          setViewingAssistedPass(false);
        } else {
          setSessionReceipt(nextReceipt);
          setViewingAssistedPass(true);
        }
        setScreen("pass");
        showAlert("Endorsement saved on this device.");
        onRecorded?.();
      } else if (err instanceof Error && err.message.includes("duplicate_entry")) {
        rememberSubmittedNationalId(nin);
        showAlert("This National ID already has an endorsement on record.");
      } else {
        showAlert("Could not record endorsement. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const passReceipt =
    screen === "pass"
      ? viewingAssistedPass && sessionReceipt
        ? sessionReceipt
        : endorsementReceipt
      : null;

  if (screen === "pass" && passReceipt) {
    return (
      <EndorsementPassCard
        receipt={passReceipt}
        onSubmitForAnother={endorsementReceipt ? startAssistFlow : undefined}
        onBackToMyPass={
          viewingAssistedPass && endorsementReceipt
            ? () => {
                setViewingAssistedPass(false);
                setScreen("pass");
                haptic("light");
              }
            : undefined
        }
      />
    );
  }

  if (screen === "nin-gate") {
    return (
      <div className="card endorse-form">
        <h2 className="endorse-form__title">{ENDORSEMENT_CAMPAIGN.assistNinTitle}</h2>
        <p className="endorse-form__subtitle">{ENDORSEMENT_CAMPAIGN.assistNinSubtitle}</p>
        <div className="field field--hint">
          <label htmlFor={ninGateId}>National Identification Number</label>
          <p className="field__hint">{ENDORSEMENT_CAMPAIGN.ninHint}</p>
          <input
            id={ninGateId}
            value={ninGateInput}
            onChange={(e) => setNinGateInput(e.target.value)}
            autoComplete="off"
            inputMode="text"
          />
        </div>
        <div className="endorse-form__nav">
          <button
            type="button"
            className="btn btn-secondary endorse-form__back"
            onClick={() => {
              setScreen(endorsementReceipt ? "pass" : "form");
              setMode("self");
            }}
          >
            {ENDORSEMENT_CAMPAIGN.backLabel}
          </button>
          <button
            type="button"
            className="btn btn-primary endorse-form__submit"
            disabled={checkingNin}
            onClick={() => void verifyNinAndContinue()}
          >
            {checkingNin ? "Checking…" : ENDORSEMENT_CAMPAIGN.assistContinueLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="card endorse-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="endorse-form__stepbar" aria-label="Form progress">
        <span className={`endorse-form__step${step === 1 ? " endorse-form__step--active" : ""}`}>1</span>
        <span className="endorse-form__step-line" aria-hidden />
        <span className={`endorse-form__step${step === 2 ? " endorse-form__step--active" : ""}`}>2</span>
      </div>

      <h2 className="endorse-form__title">
        {step === 1 ? ENDORSEMENT_CAMPAIGN.step1Title : ENDORSEMENT_CAMPAIGN.step2Title}
      </h2>
      <p className="endorse-form__subtitle">
        {step === 1 ? ENDORSEMENT_CAMPAIGN.step1Subtitle : ENDORSEMENT_CAMPAIGN.step2Subtitle}
      </p>

      {step === 1 ? (
        <>
          <div className="endorse-form__row">
            <div className="field">
              <label htmlFor={firstNameId}>First name</label>
              <input
                id={firstNameId}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor={surnameId}>Surname</label>
              <input
                id={surnameId}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={genderId}>Gender</label>
            <span className="field__hint">Optional</span>
            <select id={genderId} value={gender} onChange={(e) => setGender(e.target.value)}>
              {ENDORSEMENT_GENDERS.map((g) => (
                <option key={g.value || "unset"} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {!ninLocked ? (
            <div className="field field--hint">
              <label htmlFor={nationalIdId}>National Identification Number</label>
              <p className="field__hint">{ENDORSEMENT_CAMPAIGN.ninHint}</p>
              <input
                id={nationalIdId}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                autoComplete="off"
                inputMode="text"
                required
              />
            </div>
          ) : (
            <p className="endorse-form__nin-locked">
              National ID verified: <strong>{nationalId}</strong>
            </p>
          )}

          <div className="field">
            <label htmlFor={ageGroupId}>Age group</label>
            <select id={ageGroupId} value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} required>
              <option value="">Select age group</option>
              {ENDORSEMENT_AGE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn-primary endorse-form__solo-next" onClick={goNext}>
            {ENDORSEMENT_CAMPAIGN.nextLabel}
          </button>
        </>
      ) : (
        <>
          <div className="field field--hint">
            <label htmlFor={districtId}>District</label>
            <p className="field__hint">{ENDORSEMENT_CAMPAIGN.districtHint}</p>
            <select id={districtId} value={district} onChange={(e) => setDistrict(e.target.value)} required>
              <option value="">Select district</option>
              {UGANDA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="endorse-form__row">
            <div className="field">
              <label htmlFor={subCountyId}>Sub-county</label>
              <span className="field__hint">Optional</span>
              <input id={subCountyId} value={subCounty} onChange={(e) => setSubCounty(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor={parishId}>Parish</label>
              <span className="field__hint">Optional</span>
              <input id={parishId} value={parish} onChange={(e) => setParish(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor={villageId}>Village</label>
            <span className="field__hint">Optional</span>
            <input id={villageId} value={village} onChange={(e) => setVillage(e.target.value)} />
          </div>

          <div className="field field--hint">
            <label htmlFor={messageId}>Endorsement message</label>
            <span className="field__hint">Optional</span>
            <p className="field__hint">{ENDORSEMENT_CAMPAIGN.messageHint}</p>
            <textarea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share why you support this presidential endorsement campaign."
            />
          </div>

          {message.trim() ? (
            <label className="endorse-form__consent endorse-form__consent--secondary" htmlFor={publishId}>
              <input
                id={publishId}
                type="checkbox"
                checked={publishMessage}
                onChange={(e) => setPublishMessage(e.target.checked)}
              />
              {ENDORSEMENT_CAMPAIGN.publishMessageLabel}
            </label>
          ) : null}

          <label className="endorse-form__consent" htmlFor={consentId}>
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            {ENDORSEMENT_CAMPAIGN.consentLabel}
          </label>

          <div className="endorse-form__nav">
            <button type="button" className="btn btn-secondary endorse-form__back" onClick={() => setStep(1)}>
              {ENDORSEMENT_CAMPAIGN.backLabel}
            </button>
            <button type="submit" className="btn btn-primary endorse-form__submit" disabled={submitting}>
              {submitting ? "Recording…" : ENDORSEMENT_CAMPAIGN.submitLabel}
            </button>
          </div>
        </>
      )}
    </form>
  );
}