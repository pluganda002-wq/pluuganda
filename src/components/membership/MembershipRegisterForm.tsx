import { FormEvent, useId, useState } from "react";
import { ENDORSEMENT_AGE_GROUPS, ENDORSEMENT_GENDERS } from "@/data/endorsementCampaign";
import { MEMBERSHIP_CAMPAIGN, MEMBERSHIP_ROLES } from "@/data/membershipCampaign";
import { PATRIOT_INTERESTS } from "@/data/profileInterests";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, registerMemberApi, type RegisterMemberPayload } from "@/lib/api";
import "@/pages/EndorsePage.css";

function normalizeNationalId(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

type Props = {
  onRegistered?: () => void;
};

export function MembershipRegisterForm({ onRegistered }: Props) {
  const uid = useId();
  const { user, displayName, haptic, showAlert } = useTelegram();
  const { registerMember } = useUser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState(() => displayName.split(/\s+/)[0] ?? "");
  const [surname, setSurname] = useState(() => displayName.split(/\s+/).slice(1).join(" "));
  const [gender, setGender] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");

  const [membershipRole, setMembershipRole] = useState<string>(MEMBERSHIP_ROLES[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const firstNameId = `${uid}-first`;
  const surnameId = `${uid}-surname`;
  const genderId = `${uid}-gender`;
  const nationalIdId = `${uid}-nin`;
  const ageGroupId = `${uid}-age`;
  const phoneId = `${uid}-phone`;
  const districtId = `${uid}-district`;
  const subCountyId = `${uid}-subcounty`;
  const parishId = `${uid}-parish`;
  const villageId = `${uid}-village`;
  const roleId = `${uid}-role`;
  const consentId = `${uid}-consent`;

  function toggleInterest(item: string) {
    setInterests((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  function validateStep1(): boolean {
    if (!firstName.trim() || !surname.trim()) {
      showAlert("Enter your first name and surname.");
      return false;
    }
    const nin = normalizeNationalId(nationalId);
    if (nin.length < 8) {
      showAlert("Enter a valid National Identification Number.");
      return false;
    }
    if (!ageGroup) {
      showAlert("Select your age group.");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    const normalized = normalizePhone(phone);
    if (normalized.replace(/\D/g, "").length < 12) {
      showAlert("Enter a valid Uganda phone number.");
      return false;
    }
    setPhone(normalized);
    if (!district) {
      showAlert("Select your district.");
      return false;
    }
    return true;
  }

  function goNext() {
    haptic("light");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => (s === 3 ? 3 : ((s + 1) as 1 | 2 | 3)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      showAlert("Confirm consent before registering.");
      return;
    }
    if (step !== 3) return;

    const fullName = `${firstName.trim()} ${surname.trim()}`;
    const nin = normalizeNationalId(nationalId);
    const payload: RegisterMemberPayload = {
      fullName,
      firstName: firstName.trim(),
      surname: surname.trim(),
      gender: gender || undefined,
      nationalId: nin,
      ageGroup,
      phone: normalizePhone(phone),
      district,
      subCounty: subCounty.trim() || undefined,
      parish: parish.trim() || undefined,
      village: village.trim() || undefined,
      membershipRole,
      interests: interests.length ? interests : undefined,
      consent: true,
      telegramId: user?.id,
      telegramUsername: user?.username,
    };

    setSubmitting(true);
    try {
      const saved = await registerMemberApi(payload);
      const created = registerMember(
        {
          fullName: payload.fullName,
          phone: payload.phone,
          district: payload.district,
          firstName: payload.firstName,
          surname: payload.surname,
          gender: payload.gender,
          nationalId: payload.nationalId,
          ageGroup: payload.ageGroup,
          subCounty: payload.subCounty,
          parish: payload.parish,
          village: payload.village,
          membershipRole: payload.membershipRole,
          interests: payload.interests,
        },
        { memberId: saved.memberId, registeredAt: saved.registeredAt }
      );
      haptic("medium");
      showAlert(`Welcome, patriot. Your membership ID is ${created.memberId}.`);
      onRegistered?.();
    } catch (err) {
      const created = registerMember({
        fullName: payload.fullName,
        phone: payload.phone,
        district: payload.district,
        firstName: payload.firstName,
        surname: payload.surname,
        gender: payload.gender,
        nationalId: payload.nationalId,
        ageGroup: payload.ageGroup,
        subCounty: payload.subCounty,
        parish: payload.parish,
        village: payload.village,
        membershipRole: payload.membershipRole,
        interests: payload.interests,
      });
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert(`Saved on this device. Provisional ID: ${created.memberId}.`);
      } else {
        showAlert("Could not reach server. Saved on this device only.");
      }
      onRegistered?.();
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    step === 1
      ? MEMBERSHIP_CAMPAIGN.step1Title
      : step === 2
        ? MEMBERSHIP_CAMPAIGN.step2Title
        : MEMBERSHIP_CAMPAIGN.step3Title;
  const subtitle =
    step === 1
      ? MEMBERSHIP_CAMPAIGN.step1Subtitle
      : step === 2
        ? MEMBERSHIP_CAMPAIGN.step2Subtitle
        : MEMBERSHIP_CAMPAIGN.step3Subtitle;

  return (
    <form className="card endorse-form membership-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="endorse-form__stepbar" aria-label="Registration progress">
        <span className={`endorse-form__step${step === 1 ? " endorse-form__step--active" : ""}`}>1</span>
        <span className="endorse-form__step-line" aria-hidden />
        <span className={`endorse-form__step${step === 2 ? " endorse-form__step--active" : ""}`}>2</span>
        <span className="endorse-form__step-line" aria-hidden />
        <span className={`endorse-form__step${step === 3 ? " endorse-form__step--active" : ""}`}>3</span>
      </div>

      <h2 className="endorse-form__title">{title}</h2>
      <p className="endorse-form__subtitle">{subtitle}</p>

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

          <div className="field field--hint">
            <label htmlFor={nationalIdId}>National Identification Number</label>
            <p className="field__hint">{MEMBERSHIP_CAMPAIGN.ninHint}</p>
            <input
              id={nationalIdId}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              autoComplete="off"
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

          <button type="button" className="btn btn-primary endorse-form__solo-next" onClick={goNext}>
            {MEMBERSHIP_CAMPAIGN.nextLabel}
          </button>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className="field field--hint">
            <label htmlFor={phoneId}>Phone (Uganda)</label>
            <p className="field__hint">{MEMBERSHIP_CAMPAIGN.phoneHint}</p>
            <input
              id={phoneId}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+256 7XX XXX XXX"
              required
            />
          </div>

          <div className="field field--hint">
            <label htmlFor={districtId}>District</label>
            <p className="field__hint">{MEMBERSHIP_CAMPAIGN.districtHint}</p>
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

          <div className="endorse-form__nav">
            <button type="button" className="btn btn-secondary endorse-form__back" onClick={() => setStep(1)}>
              {MEMBERSHIP_CAMPAIGN.backLabel}
            </button>
            <button type="button" className="btn btn-primary endorse-form__submit" onClick={goNext}>
              {MEMBERSHIP_CAMPAIGN.nextLabel}
            </button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <div className="field">
            <label htmlFor={roleId}>How do you serve?</label>
            <select id={roleId} value={membershipRole} onChange={(e) => setMembershipRole(e.target.value)}>
              {MEMBERSHIP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="membership-form__interests">
            <legend>Interests</legend>
            <p className="field__hint">{MEMBERSHIP_CAMPAIGN.interestsHint}</p>
            <div className="membership-form__chips" role="group" aria-label="Interests">
              {PATRIOT_INTERESTS.map((item) => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    className={`membership-form__chip${active ? " membership-form__chip--active" : ""}`}
                    aria-pressed={active}
                    onClick={() => toggleInterest(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="endorse-form__consent" htmlFor={consentId}>
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            {MEMBERSHIP_CAMPAIGN.consentLabel}
          </label>

          <div className="endorse-form__nav">
            <button type="button" className="btn btn-secondary endorse-form__back" onClick={() => setStep(2)}>
              {MEMBERSHIP_CAMPAIGN.backLabel}
            </button>
            <button type="submit" className="btn btn-primary endorse-form__submit" disabled={submitting}>
              {submitting ? "Saving…" : MEMBERSHIP_CAMPAIGN.submitLabel}
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}