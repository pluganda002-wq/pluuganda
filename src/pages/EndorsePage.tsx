import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { PLU_STATS } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitEndorsementApi } from "@/lib/api";

export function EndorsePage() {
  const { endorsed, setEndorsed } = useUser();
  const { user, haptic, showAlert } = useTelegram();
  const [message, setMessage] = useState("");
  const [district, setDistrict] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      showAlert("Please share a short endorsement message.");
      return;
    }
    setEndorsed(true);
    try {
      await submitEndorsementApi({
        message: message.trim(),
        district: district.trim() || undefined,
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
      haptic("medium");
      showAlert("Thank you, Patriot. Your endorsement was saved to the PLU database.");
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert("Endorsement saved on this device. Connect MongoDB on Vercel to persist centrally.");
      } else {
        showAlert("Could not reach server. Endorsement marked on this device only.");
      }
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Presidential endorsement"
        subtitle="Add your voice to the campaign — public totals mirror plu.org.ug live stats."
      />

      <StatGrid
        stats={[
          { label: "Recorded", value: PLU_STATS.endorsements + (endorsed ? 1 : 0) },
          { label: "Districts", value: PLU_STATS.districts },
          { label: "Members", value: PLU_STATS.members },
        ]}
      />

      {endorsed ? (
        <div className="card" style={{ marginTop: 16 }}>
          <span className="badge badge-green">Endorsed</span>
          <p style={{ marginTop: 12, color: "var(--plu-muted)", fontSize: "0.9rem" }}>
            You have added your endorsement in PLU BOT. Official publication follows PLU Secretariat review.
          </p>
        </div>
      ) : (
        <form className="card" style={{ marginTop: 16 }} onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="district">District / city</label>
            <input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Mbale City"
            />
          </div>
          <div className="field">
            <label htmlFor="message">Your message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share why you endorse Gen. Muhoozi Kainerugaba for Uganda's future..."
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Endorse now
          </button>
        </form>
      )}
    </main>
  );
}
