import { PageHeader } from "@/components/PageHeader";
import { SOCIAL_FEED } from "@/data/plu";
import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";

export function SocialPage() {
  const { haptic } = useTelegram();
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  return (
    <main className="page">
      <PageHeader
        title="Social hub"
        subtitle="Official updates, member engagement and campaign conversations."
      />
      {SOCIAL_FEED.map((post) => (
        <div key={post.id} className="card">
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--plu-gold)" }}>{post.author}</p>
          <p style={{ margin: "8px 0", fontSize: "0.92rem" }}>{post.text}</p>
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
    </main>
  );
}
