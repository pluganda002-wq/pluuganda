import { SOCIAL_FEED } from "@/data/plu";
import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";

export function SocialPage() {
  const { haptic } = useTelegram();
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  return (
    <main className="institutional-page">
      <div className="institutional-page__body" style={{ paddingTop: 8 }}>
        <p className="institutional-page__lead">
          Official updates, member engagement and campaign conversations.
        </p>

        <div className="inst-panel">
          <h2 className="inst-panel__title">Updates feed</h2>
          {SOCIAL_FEED.map((post) => (
            <div key={post.id} className="card card--flat" style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--plu-gold-dark)" }}>
                {post.author}
              </p>
              <p style={{ margin: "8px 0", fontSize: "0.92rem", color: "var(--plu-text)" }}>{post.text}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--plu-muted)" }}>{post.time}</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setLikes((l) => ({ ...l, [post.id]: !l[post.id] }));
                    haptic("light");
                  }}
                >
                  {likes[post.id] ? "Endorsed ♥" : "Endorse"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
