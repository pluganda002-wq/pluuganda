import { FormEvent, useMemo, useState } from "react";
import { YOUTH_FORUM_EVENTS, YOUTH_FORUM_FORM, YOUTH_FORUM_ROLES } from "@/data/youthProgramme";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitYouthRegistrationApi } from "@/lib/api";
import {
  buildForumRegistration,
  countForumRegistrations,
  isRegisteredForForum,
  saveYouthRegistration,
  type YouthForumRegistration,
} from "@/lib/youthRegistrations";

type Props = {
  initialEventId?: string;
  onSaved: (entry: YouthForumRegistration) => void;
};

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

export function YouthForumForm({ initialEventId, onSaved }: Props) {
  const { member } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const [submitting, setSubmitting] = useState(false);

  const [eventId, setEventId] = useState(initialEventId ?? YOUTH_FORUM_EVENTS[0].id);
  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [district, setDistrict] = useState(member?.district ?? "");
  const [role, setRole] = useState<string>(YOUTH_FORUM_ROLES[0]);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const event = useMemo(
    () => YOUTH_FORUM_EVENTS.find((ev) => ev.id === eventId) ?? YOUTH_FORUM_EVENTS[0],
    [eventId]
  );

  const localCount = countForumRegistrations(eventId);
  const spotsLeft = Math.max(0, event.spots - localCount);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district) {
      showAlert("Complete name, phone, and district.");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (isRegisteredForForum(eventId, normalizedPhone)) {
      showAlert("You are already registered for this forum with this phone.");
      return;
    }
    if (spotsLeft <= 0) {
      showAlert("This forum is full on this device waitlist. Contact your district coordinator.");
      return;
    }
    if (!consent) {
      showAlert("Confirm attendance consent.");
      return;
    }

    const entry = buildForumRegistration({
      fullName: fullName.trim(),
      phone: normalizedPhone,
      district,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.dateLabel,
      role,
      notes: notes.trim() || undefined,
    });

    setSubmitting(true);
    try {
      await submitYouthRegistrationApi({
        kind: "forum",
        reference: entry.reference,
        fullName: entry.fullName,
        phone: entry.phone,
        district: entry.district,
        eventId: entry.eventId,
        eventTitle: entry.eventTitle,
        eventDate: entry.eventDate,
        role: entry.role,
        notes: entry.notes,
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
    showAlert(`Forum seat reserved. Reference: ${entry.reference}`);
    onSaved(entry);
    setNotes("");
    setConsent(false);
  }

  return (
    <form className="card youth-form" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="youth-form__title">{YOUTH_FORUM_FORM.title}</h2>
      <p className="youth-form__subtitle">{YOUTH_FORUM_FORM.subtitle}</p>

      <div className="field">
        <label htmlFor="youth-forum-event">Forum</label>
        <select id="youth-forum-event" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
          {YOUTH_FORUM_EVENTS.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} — {ev.dateLabel}
            </option>
          ))}
        </select>
        <p className="field__hint">
          {event.location} · {spotsLeft} of {event.spots} spots on this device
        </p>
      </div>

      <div className="field">
        <label htmlFor="youth-forum-name">Full name</label>
        <input
          id="youth-forum-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="youth-forum-phone">Phone</label>
        <input
          id="youth-forum-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="youth-forum-district">District</label>
        <select id="youth-forum-district" value={district} onChange={(e) => setDistrict(e.target.value)} required>
          <option value="">Select district</option>
          {UGANDA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="youth-forum-role">Your role</label>
        <select id="youth-forum-role" value={role} onChange={(e) => setRole(e.target.value)}>
          {YOUTH_FORUM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="youth-forum-notes">Notes for organisers</label>
        <span className="field__hint">Optional</span>
        <textarea
          id="youth-forum-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Accessibility needs, transport, or mentor request"
        />
      </div>
      <label className="youth-form__consent" htmlFor="youth-forum-consent">
        <input
          id="youth-forum-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        I will attend or notify organisers if I cannot make it.
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting || spotsLeft <= 0}>
        {spotsLeft <= 0 ? "Forum full" : submitting ? "Saving…" : YOUTH_FORUM_FORM.submitLabel}
      </button>
    </form>
  );
}