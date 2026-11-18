import { PageHeader } from "@/components/PageHeader";
import { MembershipRegisterForm } from "@/components/membership/MembershipRegisterForm";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { MEMBERSHIP_CAMPAIGN } from "@/data/membershipCampaign";
import "./MembershipPage.css";

export function MembershipPage() {
  const { member, verifyMember } = useUser();
  const { haptic, showAlert } = useTelegram();

  function onVerify() {
    verifyMember();
    haptic("heavy");
    showAlert("Member record marked verified (demo). Secretariat will sync official records.");
  }

  return (
    <main className="page membership-page">
      <PageHeader title="Membership" subtitle={MEMBERSHIP_CAMPAIGN.formSubtitle} />

      {member ? (
        <div className="card membership-card">
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

          <dl className="membership-card__meta">
            {member.phone ? (
              <>
                <dt>Phone</dt>
                <dd>{member.phone}</dd>
              </>
            ) : null}
            {member.nationalId ? (
              <>
                <dt>National ID</dt>
                <dd>On file (private)</dd>
              </>
            ) : null}
            {member.ageGroup ? (
              <>
                <dt>Age group</dt>
                <dd>{member.ageGroup}</dd>
              </>
            ) : null}
            {member.membershipRole ? (
              <>
                <dt>Role</dt>
                <dd>{member.membershipRole}</dd>
              </>
            ) : null}
            {member.subCounty || member.parish || member.village ? (
              <>
                <dt>Area</dt>
                <dd>
                  {[member.subCounty, member.parish, member.village].filter(Boolean).join(" · ") || "—"}
                </dd>
              </>
            ) : null}
            {member.interests?.length ? (
              <>
                <dt>Interests</dt>
                <dd>
                  <span className="membership-card__chips">
                    {member.interests.map((tag) => (
                      <span key={tag} className="membership-card__chip">
                        {tag}
                      </span>
                    ))}
                  </span>
                </dd>
              </>
            ) : null}
          </dl>

          {!member.verified ? (
            <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={onVerify}>
              Verify my record (demo)
            </button>
          ) : null}
        </div>
      ) : (
        <MembershipRegisterForm />
      )}

      <ul className="feature-list">
        <li>Responsible citizenship and trusted official updates</li>
        <li>Connect to district barazas and community service</li>
        <li>Synced with PLU Secretariat when database API is available</li>
      </ul>
    </main>
  );
}