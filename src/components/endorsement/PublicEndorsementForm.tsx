import { FormEvent, useId, useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useUser } from "@/context/UserContext";
import {
  ENDORSEMENT_AGE_GROUPS,
  ENDORSEMENT_CAMPAIGN,
  ENDORSEMENT_GENDERS,
} from "@/data/endorsementCampaign";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { isApiUnavailableError, submitEndorsementApi } from "@/lib/api";
import "@/pages/EndorsePage.css";

function normalizeNationalId(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

type Props = {
  onRecorded?: () => void;
};

export function PublicEndorsementForm({ onRecorded }: Props) {
  const uid = useId();
  const { user, haptic, showAlert } = useTelegram();
  const { setEndorsed } = useUser();
  const [submitted, setSubmitted] = useState(false);

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
  const ageGroupId = `${uid}-age-group`;
  const districtId = `${uid}-district`;
  const subCountyId = `${uid}-sub-county`;
  const parishId = `${uid}-parish`;
  const villageId = `${uid}-village`;
  const messageId = `${uid}-message`;
  const consentId = `${uid}-consent`;
  const publishId = `${uid}-publish`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const first = firstName.trim();
    const last = surname.trim();
    const nin = normalizeNationalId(nationalId);

    if (!first || !last) {
      showAlert("Enter your first name and surname.");
      return;
    }
    if (nin.length < 8) {
      showAlert("Enter a valid National Identification Number.");
      return;
    }
    if (!ageGroup) {
      showAlert("Select your age group.");
      return;
    }
    if (!district) {
      showAlert("Select your district.");
      return;
    }
    if (!consent) {
      showAlert("Confirm that these details are yours and that you support this endorsement.");
      return;
    }

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

    setSubmitted(true);
    try {
      await submitEndorsementApi(payload);
      setEndorsed(true);
      haptic("medium");
      showAlert("Thank you, Patriot. Your endorsement was recorded.");
      onRecorded?.();
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        setEndorsed(true);
        showAlert(
          "Endorsement saved on this device. Connect MongoDB on Vercel to store endorsements centrally."
        );
        onRecorded?.();
      } else if (err instanceof Error && err.message.includes("duplicate_entry")) {
        setSubmitted(false);
        showAlert("This National ID already has an endorsement on record.");
      } else {
        setSubmitted(false);
        showAlert("Could not record endorsement. Please try again.");
      }
    }
  }

  if (submitted) {
    return (
      <div className="card endorse-done">
        <p className="badge badge-green">Submitted</p>
        <p className="endorse-done__ref">
          Your endorsement is in the protected record. Public totals update after Secretariat sync — same
          process as{" "}
          <a href="https://plu.org.ug/endorsements/sign/" target="_blank" rel="noreferrer">
            plu.org.ug
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="card endorse-form" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="endorse-form__title">{ENDORSEMENT_CAMPAIGN.formTitle}</h2>
      <p className="endorse-form__subtitle">{ENDORSEMENT_CAMPAIGN.formSubtitle}</p>

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

      <button type="submit" className="btn btn-primary" style={{ marginTop: 16, width: "100%" }}>
        {ENDORSEMENT_CAMPAIGN.submitLabel}
      </button>
    </form>
  );
}