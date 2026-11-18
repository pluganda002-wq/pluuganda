import { FormEvent, useState } from "react";
import { ENDORSEMENT_AGE_GROUPS } from "@/data/endorsementCampaign";
import { YOUTH_LEAGUE_CHAPTERS, YOUTH_LEAGUE_FORM } from "@/data/youthProgramme";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitYouthRegistrationApi } from "@/lib/api";
import {
  buildLeagueRegistration,
  isRegisteredForLeague,
  saveYouthRegistration,
  type YouthLeagueRegistration,
} from "@/lib/youthRegistrations";

type Props = {
  onSaved: (entry: YouthLeagueRegistration) => void;
};

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

export function YouthLeagueForm({ onSaved }: Props) {
  const { member } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [district, setDistrict] = useState(member?.district ?? "");
  const [chapterId, setChapterId] = useState(YOUTH_LEAGUE_CHAPTERS[0].id);
  const [ageGroup, setAgeGroup] = useState("");
  const [institution, setInstitution] = useState("");
  const [consent, setConsent] = useState(false);

  const chapter = YOUTH_LEAGUE_CHAPTERS.find((c) => c.id === chapterId) ?? YOUTH_LEAGUE_CHAPTERS[0];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district || !ageGroup) {
      showAlert("Complete name, phone, district, and age group.");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (isRegisteredForLeague(chapterId, normalizedPhone)) {
      showAlert("You already applied for this chapter with this phone number.");
      return;
    }
    if (!consent) {
      showAlert("Confirm consent to join the youth league.");
      return;
    }

    const entry = buildLeagueRegistration({
      fullName: fullName.trim(),
      phone: normalizedPhone,
      district,
      chapterId,
      chapterTitle: chapter.title,
      ageGroup,
      institution: institution.trim() || undefined,
    });

    setSubmitting(true);
    try {
      await submitYouthRegistrationApi({
        kind: "league",
        reference: entry.reference,
        fullName: entry.fullName,
        phone: entry.phone,
        district: entry.district,
        chapterId: entry.chapterId,
        chapterTitle: entry.chapterTitle,
        ageGroup: entry.ageGroup,
        institution: entry.institution,
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
    } catch (err) {
      if (!isApiUnavailableError(err)) {
        showAlert("Could not reach server. Saved on this device.");
      }
    } finally {
      setSubmitting(false);
    }

    saveYouthRegistration(entry);
    haptic("medium");
    showAlert(`League application received. Reference: ${entry.reference}`);
    onSaved(entry);
    setConsent(false);
  }

  return (
    <form className="card youth-form" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="youth-form__title">{YOUTH_LEAGUE_FORM.title}</h2>
      <p className="youth-form__subtitle">{YOUTH_LEAGUE_FORM.subtitle}</p>

      <div className="field">
        <label htmlFor="youth-league-name">Full name</label>
        <input
          id="youth-league-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="youth-league-phone">Phone</label>
        <input
          id="youth-league-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+256 ..."
          required
        />
      </div>
      <div className="field">
        <label htmlFor="youth-league-district">District</label>
        <select id="youth-league-district" value={district} onChange={(e) => setDistrict(e.target.value)} required>
          <option value="">Select district</option>
          {UGANDA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="youth-league-chapter">League chapter</label>
        <select id="youth-league-chapter" value={chapterId} onChange={(e) => setChapterId(e.target.value)} required>
          {YOUTH_LEAGUE_CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <p className="field__hint">{chapter.subtitle}</p>
      </div>
      <div className="field">
        <label htmlFor="youth-league-age">Age group</label>
        <select id="youth-league-age" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} required>
          <option value="">Select age group</option>
          {ENDORSEMENT_AGE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="youth-league-school">School / institution</label>
        <span className="field__hint">Optional</span>
        <input
          id="youth-league-school"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="e.g. Makerere University"
        />
      </div>
      <label className="youth-form__consent" htmlFor="youth-league-consent">
        <input
          id="youth-league-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        I agree to PLU youth league conduct and mentorship guidelines.
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Submitting…" : YOUTH_LEAGUE_FORM.submitLabel}
      </button>
    </form>
  );
}