import { Link } from "react-router-dom";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { PLU_ADDRESS, PLU_TAGLINE, PLU_VALUES } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";

export function ProfilePage() {
  const { member, endorsed, completedTasks } = useUser();
  const { user, displayName } = useTelegram();

  return (
    <main className="institutional-page">
      <div className="institutional-page__body" style={{ paddingTop: 8 }}>
        <p className="institutional-page__lead">{PLU_TAGLINE}</p>

        <div className="inst-panel">
          <ThemeSwitch />
        </div>

        <div className="inst-panel">
          <h2 className="inst-panel__title">Member record</h2>
          <div className="card card--flat">
            <strong>{displayName}</strong>
            {user?.username ? (
              <p style={{ margin: "4px 0", color: "var(--plu-muted)", fontSize: "0.85rem" }}>@{user.username}</p>
            ) : null}
            <p style={{ margin: "12px 0 0", fontSize: "0.88rem" }}>
              Membership:{" "}
              {member ? (
                <>
                  <span className="badge badge-gold">{member.memberId}</span>
                  {member.verified ? " · Verified" : " · Pending"}
                </>
              ) : (
                <Link to="/membership">Register now</Link>
              )}
            </p>
            <p style={{ margin: "8px 0", fontSize: "0.88rem" }}>
              Endorsement: {endorsed ? <span className="badge badge-green">Recorded</span> : "Not yet"}
            </p>
            <p style={{ margin: "8px 0", fontSize: "0.88rem" }}>Tasks completed: {completedTasks.length}</p>
          </div>
        </div>

        <div className="inst-panel">
          <h2 className="inst-panel__title">PLU values</h2>
          {PLU_VALUES.map((v) => (
            <div key={v.title} className="card card--flat" style={{ marginBottom: 10 }}>
              <strong>{v.title}</strong>
              <p style={{ margin: "6px 0 0", color: "var(--plu-muted)", fontSize: "0.85rem" }}>{v.text}</p>
            </div>
          ))}
        </div>

        <p className="section-sub">
          Secretariat: {PLU_ADDRESS}. Official site:{" "}
          <a href="https://plu.org.ug/" target="_blank" rel="noreferrer">
            plu.org.ug
          </a>
        </p>

        <Link to="/assistant" className="btn btn-secondary">
          Open PLU Assistant
        </Link>
      </div>
    </main>
  );
}
