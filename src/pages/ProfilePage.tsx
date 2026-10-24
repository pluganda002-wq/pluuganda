import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PLU_ADDRESS, PLU_TAGLINE, PLU_VALUES } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";

export function ProfilePage() {
  const { member, endorsed, completedTasks } = useUser();
  const { user, displayName } = useTelegram();

  return (
    <main className="page">
      <PageHeader title="Your profile" subtitle={PLU_TAGLINE} />

      <div className="card">
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

      <h2 className="section-title" style={{ marginTop: 20 }}>
        PLU values
      </h2>
      {PLU_VALUES.map((v) => (
        <div key={v.title} className="card">
          <strong>{v.title}</strong>
          <p style={{ margin: "6px 0 0", color: "var(--plu-muted)", fontSize: "0.85rem" }}>{v.text}</p>
        </div>
      ))}

      <p className="section-sub" style={{ marginTop: 16 }}>
        Secretariat: {PLU_ADDRESS}. Official site:{" "}
        <a href="https://plu.org.ug/" target="_blank" rel="noreferrer">
          plu.org.ug
        </a>
      </p>

      <Link to="/assistant" className="btn btn-secondary" style={{ marginTop: 12 }}>
        Open PLU Assistant
      </Link>
    </main>
  );
}
