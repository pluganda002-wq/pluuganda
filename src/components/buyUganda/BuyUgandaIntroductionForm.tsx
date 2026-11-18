import { FormEvent, useState } from "react";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useUser } from "@/context/UserContext";
import { isApiUnavailableError, submitBuyUgandaRequestApi } from "@/lib/api";
import {
  buildIntroduction,
  hasIntroductionForBusiness,
  saveBuyUgandaIntroduction,
} from "@/lib/buyUgandaIntroductions";
import { useTelegram } from "@/hooks/useTelegram";
import type { BuyUgandaBusinessEntry } from "@/types/serviceContent";

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 10) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return value.trim();
}

type Props = {
  business: BuyUgandaBusinessEntry;
  onSubmitted: (reference: string) => void;
};

export function BuyUgandaIntroductionForm({ business, onSubmitted }: Props) {
  const { member } = useUser();
  const { user, showAlert, haptic } = useTelegram();
  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [district, setDistrict] = useState(member?.district ?? "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !district) {
      showAlert("Enter your name, phone, and district.");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (hasIntroductionForBusiness(business.id, normalizedPhone)) {
      showAlert("You already requested an introduction to this supplier with this phone.");
      return;
    }
    if (!consent) {
      showAlert("Confirm consent so PLU can connect you with the supplier.");
      return;
    }

    const entry = buildIntroduction({
      businessId: business.id,
      businessName: business.name,
      fullName: fullName.trim(),
      phone: normalizedPhone,
      district,
      message: message.trim() || undefined,
    });

    setSubmitting(true);
    try {
      await submitBuyUgandaRequestApi({
        kind: "introduction",
        reference: entry.reference,
        fullName: entry.fullName,
        phone: entry.phone,
        district: entry.district,
        message: entry.message,
        businessId: business.id,
        businessName: business.name,
        businessDistrict: business.district,
        products: business.products,
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
    } catch (err) {
      if (!isApiUnavailableError(err)) {
        showAlert("Could not reach server. Request saved on this device.");
      }
    } finally {
      setSubmitting(false);
    }

    saveBuyUgandaIntroduction(entry);
    haptic("medium");
    onSubmitted(entry.reference);
  }

  return (
    <form className="bubu-intro-form" onSubmit={(e) => void onSubmit(e)}>
      <p className="bubu-intro-form__lead">
        PLU will share your contact with <strong>{business.name}</strong> for a patriot buyer introduction.
      </p>
      <div className="field">
        <label htmlFor="bubu-intro-name">Full name</label>
        <input
          id="bubu-intro-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label htmlFor="bubu-intro-phone">Phone</label>
        <input
          id="bubu-intro-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="+256…"
          required
          autoComplete="tel"
        />
      </div>
      <div className="field">
        <label htmlFor="bubu-intro-district">District</label>
        <select
          id="bubu-intro-district"
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
        <label htmlFor="bubu-intro-message">What do you need? (optional)</label>
        <textarea
          id="bubu-intro-message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bulk order, retail partnership, sample request…"
        />
      </div>
      <label className="bubu-intro-form__consent" htmlFor="bubu-intro-consent">
        <input
          id="bubu-intro-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I agree that PLU and {business.name} may contact me about this introduction.
      </label>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
        {submitting ? "Sending…" : "Send introduction request"}
      </button>
    </form>
  );
}