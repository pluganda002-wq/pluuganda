import { FormEvent, useState } from "react";
import {
  TOURISM_ENQUIRY_FORM,
  TOURISM_THEME_INTERESTS,
  TOURISM_TRAVELLER_TYPES,
} from "@/data/tourismProgramme";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitTourismBookingApi } from "@/lib/api";
import {
  buildEnquiryBooking,
  saveTourismBooking,
  type TourismEnquiryBooking,
} from "@/lib/tourismBookings";

type Props = {
  onSaved: (entry: TourismEnquiryBooking) => void;
};

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

export function TourismEnquiryForm({ onSaved }: Props) {
  const { member } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [district, setDistrict] = useState(member?.district ?? "");
  const [theme, setTheme] = useState<string>(TOURISM_THEME_INTERESTS[0]);
  const [travellerType, setTravellerType] = useState<string>(TOURISM_TRAVELLER_TYPES[0]);
  const [preferredDates, setPreferredDates] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district || !preferredDates.trim()) {
      showAlert("Complete name, phone, district, and preferred dates.");
      return;
    }
    if (!consent) {
      showAlert("Confirm consent to contact you about itineraries.");
      return;
    }

    const entry = buildEnquiryBooking({
      fullName: fullName.trim(),
      phone: normalizePhone(phone),
      district,
      theme,
      travellerType,
      preferredDates: preferredDates.trim(),
      travellers: Math.max(1, Math.min(20, travellers)),
      notes: notes.trim() || undefined,
    });

    setSubmitting(true);
    try {
      await submitTourismBookingApi({
        kind: "enquiry",
        reference: entry.reference,
        fullName: entry.fullName,
        phone: entry.phone,
        district: entry.district,
        theme: entry.theme,
        travellerType: entry.travellerType,
        preferredDates: entry.preferredDates,
        travellers: entry.travellers,
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

    saveTourismBooking(entry);
    haptic("medium");
    showAlert(`Enquiry sent. Reference: ${entry.reference}`);
    onSaved(entry);
    setNotes("");
    setPreferredDates("");
    setConsent(false);
  }

  return (
    <form className="card tourism-form" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="tourism-form__title">{TOURISM_ENQUIRY_FORM.title}</h2>
      <p className="tourism-form__subtitle">{TOURISM_ENQUIRY_FORM.subtitle}</p>

      <div className="field">
        <label htmlFor="tourism-enq-name">Full name</label>
        <input
          id="tourism-enq-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-phone">Phone</label>
        <input
          id="tourism-enq-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-district">Home district</label>
        <select id="tourism-enq-district" value={district} onChange={(e) => setDistrict(e.target.value)} required>
          <option value="">Select district</option>
          {UGANDA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-theme">Primary interest</label>
        <select id="tourism-enq-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {TOURISM_THEME_INTERESTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-type">Traveller type</label>
        <select id="tourism-enq-type" value={travellerType} onChange={(e) => setTravellerType(e.target.value)}>
          {TOURISM_TRAVELLER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-dates">Preferred dates</label>
        <input
          id="tourism-enq-dates"
          value={preferredDates}
          onChange={(e) => setPreferredDates(e.target.value)}
          placeholder="e.g. 15–22 Jan 2026 or flexible"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-travellers">Number of travellers</label>
        <input
          id="tourism-enq-travellers"
          type="number"
          min={1}
          max={20}
          value={travellers}
          onChange={(e) => setTravellers(Number(e.target.value))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-enq-notes">Notes</label>
        <span className="field__hint">Optional</span>
        <textarea id="tourism-enq-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <label className="tourism-form__consent" htmlFor="tourism-enq-consent">
        <input
          id="tourism-enq-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        PLU tourism partners may contact me by phone or Telegram about this enquiry.
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Sending…" : TOURISM_ENQUIRY_FORM.submitLabel}
      </button>
    </form>
  );
}