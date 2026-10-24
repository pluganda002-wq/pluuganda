import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, registerMemberApi } from "@/lib/api";

const DISTRICTS = [
  "Kampala",
  "Wakiso",
  "Mbale",
  "Gulu",
  "Mbarara",
  "Arua",
  "Jinja",
  "Other",
];

export function MembershipPage() {
  const { member, registerMember, verifyMember } = useUser();
  const { user, displayName, haptic, showAlert } = useTelegram();
  const [fullName, setFullName] = useState(displayName);
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState(DISTRICTS[0]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showAlert("Please enter your name and phone number.");
      return;
    }
    const payload = { fullName: fullName.trim(), phone: phone.trim(), district };
    try {
      const saved = await registerMemberApi({
        ...payload,
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
      const created = registerMember(payload, {
        memberId: saved.memberId,
        registeredAt: saved.registeredAt,
      });
      haptic("medium");
      showAlert(`Registration saved to PLU database. Your ID is ${created.memberId}.`);
    } catch (err) {
      const created = registerMember(payload);
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert(`Registration saved on device. Your provisional ID is ${created.memberId}.`);
      } else {
        showAlert("Could not save to server. Saved on this device only.");
      }
    }
  }

  function onVerify() {
    verifyMember();
    haptic("heavy");
    showAlert("Member record marked verified (demo). Secretariat will sync official records.");
  }

  return (
    <main className="page">
      <PageHeader
        title="Membership"
        subtitle="Register and verify your PLU member record — same mission as plu.org.ug member routes."
      />

      {member ? (
        <div className="card">
          <p>
            <span className="badge badge-gold">{member.verified ? "Verified" : "Pending verification"}</span>
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>{member.fullName}</strong>
            <br />
            <span style={{ color: "var(--plu-muted)", fontSize: "0.88rem" }}>
              {member.memberId} · {member.district}
            </span>
          </p>
          {!member.verified ? (
            <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={onVerify}>
              Verify my record (demo)
            </button>
          ) : null}
        </div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As on your ID"
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (Uganda)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256 ..."
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="district">District</label>
            <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Register as member
          </button>
        </form>
      )}

      <ul className="feature-list">
        <li>Responsible citizenship and trusted official updates</li>
        <li>Connect to district barazas and community service</li>
        <li>Future: sync with PLU Secretariat database via secure API</li>
      </ul>
    </main>
  );
}
