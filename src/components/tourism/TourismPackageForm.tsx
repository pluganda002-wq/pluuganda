import { FormEvent, useMemo, useState } from "react";
import {
  TOURISM_PACKAGE_FORM,
  type TourismPackage,
  type TourismPackageStatus,
} from "@/data/tourismProgramme";
import { useTourismContent } from "@/context/ServiceContentContext";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitTourismBookingApi } from "@/lib/api";
import {
  buildPackageBooking,
  countPackageBookings,
  isRegisteredForPackage,
  saveTourismBooking,
  type TourismPackageBooking,
} from "@/lib/tourismBookings";

type Props = {
  initialPackageId?: string;
  onSaved: (entry: TourismPackageBooking) => void;
};

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

function spotsCap(pkg: TourismPackage): number | null {
  return pkg.status === "open" ? pkg.spots : null;
}

function canSubmit(pkg: TourismPackage, taken: number): boolean {
  if (pkg.status !== "open") return true;
  return taken < pkg.spots;
}

export function TourismPackageForm({ initialPackageId, onSaved }: Props) {
  const { packages: TOURISM_PACKAGES } = useTourismContent();
  const { member } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const [submitting, setSubmitting] = useState(false);

  const [packageId, setPackageId] = useState(initialPackageId ?? TOURISM_PACKAGES[0]?.id ?? "");
  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [district, setDistrict] = useState(member?.district ?? "");
  const [travellers, setTravellers] = useState(1);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const pkg = useMemo(
    () =>
      TOURISM_PACKAGES.find((p) => p.id === packageId) ??
      TOURISM_PACKAGES[0] ?? {
        id: "",
        title: "Package",
        region: "",
        duration: "",
        status: "open" as const,
        statusLabel: "",
        spots: 0,
        summary: "",
      },
    [packageId]
  );

  const taken = countPackageBookings(packageId);
  const cap = spotsCap(pkg);
  const spotsLeft = cap !== null ? Math.max(0, cap - taken) : null;
  const openFull = pkg.status === "open" && spotsLeft !== null && spotsLeft <= 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district) {
      showAlert("Complete name, phone, and district.");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (isRegisteredForPackage(packageId, normalizedPhone)) {
      showAlert("You already registered for this package with this phone.");
      return;
    }
    if (!canSubmit(pkg, taken)) {
      showAlert("This package is full. Try another departure or send a custom enquiry.");
      return;
    }
    if (!consent) {
      showAlert("Confirm travel consent and data use.");
      return;
    }

    const entry = buildPackageBooking({
      fullName: fullName.trim(),
      phone: normalizedPhone,
      district,
      packageId: pkg.id,
      packageTitle: pkg.title,
      departLabel: pkg.departLabel,
      travellers: Math.max(1, Math.min(20, travellers)),
      notes: notes.trim() || undefined,
    });

    setSubmitting(true);
    try {
      await submitTourismBookingApi({
        kind: "package",
        reference: entry.reference,
        fullName: entry.fullName,
        phone: entry.phone,
        district: entry.district,
        packageId: entry.packageId,
        packageTitle: entry.packageTitle,
        departLabel: entry.departLabel,
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
    const waitlist = pkg.status !== "open";
    showAlert(
      waitlist
        ? `Waitlist received. Reference: ${entry.reference}`
        : `Package registration received. Reference: ${entry.reference}`
    );
    onSaved(entry);
    setNotes("");
    setConsent(false);
  }

  const statusHint = statusHintFor(pkg.status, spotsLeft, pkg.spots);

  return (
    <form className="card tourism-form" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="tourism-form__title">{TOURISM_PACKAGE_FORM.title}</h2>
      <p className="tourism-form__subtitle">{TOURISM_PACKAGE_FORM.subtitle}</p>

      <div className="field">
        <label htmlFor="tourism-pkg-select">Package</label>
        <select
          id="tourism-pkg-select"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          required
        >
          {TOURISM_PACKAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.duration}
            </option>
          ))}
        </select>
        <p className="field__hint">
          {pkg.region}
          {pkg.departLabel ? ` · ${pkg.departLabel}` : ""} · {statusHint}
        </p>
      </div>

      <div className="field">
        <label htmlFor="tourism-pkg-name">Full name</label>
        <input
          id="tourism-pkg-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-pkg-phone">Phone</label>
        <input
          id="tourism-pkg-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+256 ..."
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-pkg-district">District</label>
        <select
          id="tourism-pkg-district"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
        >
          <option value="">Select district</option>
          {UGANDA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="tourism-pkg-travellers">Number of travellers</label>
        <input
          id="tourism-pkg-travellers"
          type="number"
          min={1}
          max={20}
          value={travellers}
          onChange={(e) => setTravellers(Number(e.target.value))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tourism-pkg-notes">Notes</label>
        <span className="field__hint">Optional — accessibility, pickup, diaspora flight dates</span>
        <textarea
          id="tourism-pkg-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <label className="tourism-form__consent" htmlFor="tourism-pkg-consent">
        <input
          id="tourism-pkg-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        I agree to share this information with PLU tourism partners for booking and safety coordination.
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting || openFull}>
        {openFull ? "Package full" : submitting ? "Submitting…" : TOURISM_PACKAGE_FORM.submitLabel}
      </button>
    </form>
  );
}

function statusHintFor(status: TourismPackageStatus, spotsLeft: number | null, spots: number): string {
  if (status === "open" && spotsLeft !== null) {
    return `${spotsLeft} of ${spots} spots on this device`;
  }
  if (status === "waitlist") return "Waitlist — dates to be confirmed";
  return "Planning cohort — express interest";
}