import { Copy, Share2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { LEADERSHIP_RANKINGS, PLU_STATS, PLU_TAGLINE } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { usePatriotAvatar } from "@/hooks/usePatriotAvatar";
import "./GuildPage.css";

export function GuildPage() {
  const { member, endorsed, completedTasks, patriotProfile, inviteCode } = useUser();
  const { user, displayName, webApp, showAlert } = useTelegram();
  const avatarSrc = usePatriotAvatar();

  const inviteLink = `https://t.me/share/url?url=${encodeURIComponent(
    `https://pluuganda-hifl.vercel.app/?ref=${inviteCode}`
  )}&text=${encodeURIComponent("Join the Patriotic League of Uganda on PLU BOT")}`;

  const copyInvite = async () => {
    const text = `Join PLU BOT — use my invite code ${inviteCode}: https://pluuganda-hifl.vercel.app/?ref=${inviteCode}`;
    try {
      await navigator.clipboard.writeText(text);
      showAlert("Invite link copied.");
    } catch {
      showAlert(text);
    }
  };

  const shareInvite = () => {
    if (webApp.openTelegramLink) {
      webApp.openTelegramLink(inviteLink);
    } else {
      window.open(inviteLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="institutional-page guild-page">
      <div className="institutional-page__body guild-page__body">
        <header className="guild-hero">
          <img src={avatarSrc} alt="" className="guild-hero__avatar" width={72} height={72} />
          <div>
            <p className="guild-hero__kicker">PLU Guild</p>
            <h1 className="guild-hero__title">{displayName}</h1>
            <p className="guild-hero__tagline">{PLU_TAGLINE}</p>
          </div>
        </header>

        {patriotProfile.interests.length > 0 ? (
          <div className="guild-interests">
            {patriotProfile.interests.map((item) => (
              <span key={item} className="guild-interests__chip">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="institutional-page__lead">
            Set your photo and interests from the avatar on Home to showcase how you serve.
          </p>
        )}

        <div className="inst-panel guild-panel">
          <h2 className="inst-panel__title">Invite patriots</h2>
          <p className="guild-panel__text">
            Grow the movement. Share your code so others join PLU BOT and earn service points together.
          </p>
          <div className="guild-invite-code">{inviteCode}</div>
          <div className="guild-invite-actions">
            <button type="button" className="btn btn-primary" onClick={shareInvite}>
              <Share2 size={18} />
              Share invite
            </button>
            <button type="button" className="btn btn-secondary" onClick={copyInvite}>
              <Copy size={18} />
              Copy link
            </button>
          </div>
        </div>

        <div className="inst-panel guild-panel">
          <h2 className="inst-panel__title">Rankings</h2>
          <p className="guild-panel__text">
            {PLU_STATS.endorsements.toLocaleString()} endorsements nationwide ·{" "}
            {PLU_STATS.members.toLocaleString()} members
          </p>
          <div className="guild-rank-list">
            {LEADERSHIP_RANKINGS.slice(0, 5).map((row) => (
              <div key={row.rank} className="guild-rank-row">
                <span className="guild-rank-row__num">{row.rank}</span>
                <div className="guild-rank-row__body">
                  <strong>{row.name}</strong>
                  <span>
                    {row.score.toLocaleString()} pts · {row.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/leadership" className="btn btn-secondary guild-rank-more">
            <Trophy size={18} />
            Full rankings
          </Link>
        </div>

        <div className="inst-panel guild-panel">
          <h2 className="inst-panel__title">Your standing</h2>
          <div className="card card--flat">
            {user?.username ? (
              <p style={{ margin: "0 0 8px", color: "var(--plu-muted)", fontSize: "0.85rem" }}>
                @{user.username}
              </p>
            ) : null}
            <p style={{ margin: "0 0 6px", fontSize: "0.88rem" }}>
              Membership:{" "}
              {member ? (
                <>
                  <span className="badge badge-gold">{member.memberId}</span>
                  {member.verified ? " · Verified" : " · Pending"}
                </>
              ) : (
                <Link to="/membership">Register</Link>
              )}
            </p>
            <p style={{ margin: "0 0 6px", fontSize: "0.88rem" }}>
              Endorsement: {endorsed ? <span className="badge badge-green">Recorded</span> : "Not yet"}
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>Tasks completed: {completedTasks.length}</p>
          </div>
        </div>

        <div className="inst-panel">
          <ThemeSwitch />
        </div>

        <Link to="/assistant" className="btn btn-secondary">
          Open PLU Assistant
        </Link>
      </div>
    </main>
  );
}
