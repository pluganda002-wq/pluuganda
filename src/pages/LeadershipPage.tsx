import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Medal, Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { POINT_CATEGORIES, rankFromPoints, RANK_THRESHOLDS } from "@/data/servicePoints";
import { useLeadershipContent } from "@/context/ServiceContentContext";
import { useUser } from "@/context/UserContext";
import "./LeadershipPage.css";

type Tab = "rankings" | "recognition" | "earn";

function badgeClass(badge: string): string {
  const key = badge.toLowerCase();
  if (key.includes("gold") || key.includes("platinum")) return "leadership-badge leadership-badge--gold";
  if (key.includes("silver")) return "leadership-badge leadership-badge--silver";
  if (key.includes("bronze")) return "leadership-badge leadership-badge--bronze";
  return "leadership-badge leadership-badge--patriot";
}

export function LeadershipPage() {
  const { pillars, rankings, recognitions } = useLeadershipContent();
  const { member, endorsed, completedTasks } = useUser();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "rankings";

  const sortedRankings = useMemo(
    () => [...rankings].sort((a, b) => a.rank - b.rank),
    [rankings]
  );
  const topThree = sortedRankings.slice(0, 3);
  const rest = sortedRankings.slice(3);

  const myPoints = useMemo(() => {
    const activity = completedTasks.length * 25 + 10;
    const verified = (member ? 40 : 0) + (endorsed ? 35 : 0) + (member?.verified ? 50 : 0);
    return activity + verified;
  }, [member, endorsed, completedTasks]);

  const { tier: myTier } = rankFromPoints(myPoints);

  useEffect(() => {
    if (!params.get("tab")) {
      setParams({ tab: "rankings" }, { replace: true });
    }
  }, [params, setParams]);

  function setTab(next: Tab) {
    setParams({ tab: next });
  }

  return (
    <main className="page leadership-page">
      <PageHeader
        title="Rankings & recognition"
        subtitle="Patriot leaderboards and official awards from verified service."
      />

      <div className="card leadership-you">
        <p className="leadership-you__kicker">Your standing</p>
        <p className="leadership-you__score">
          <strong>{myPoints.toLocaleString()}</strong> service points
        </p>
        <p className="leadership-you__tier">
          Tier: <span className={badgeClass(myTier)}>{myTier}</span>
          {member?.district ? ` · ${member.district}` : null}
        </p>
        <Link to="/programmes/tasks" className="btn btn-secondary" style={{ marginTop: 10, width: "100%" }}>
          Earn more points
        </Link>
      </div>

      <div className="leadership-page__tabs" role="tablist" aria-label="Rankings">
        {(
          [
            ["rankings", "Rankings"],
            ["recognition", `Recognition (${recognitions.length})`],
            ["earn", "How it works"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`leadership-page__tab${tab === id ? " leadership-page__tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "rankings" ? (
        <>
          {topThree.length >= 3 ? <RankingsPodium topThree={topThree} badgeClass={badgeClass} /> : null}

          <h2 className="section-title">National leaderboard</h2>
          <div className="leadership-list">
            {rest.map((row) => (
              <article key={row.id} className="leadership-row card">
                <span className="leadership-row__rank">{row.rank}</span>
                {row.coverImage ? (
                  <img className="leadership-row__thumb" src={row.coverImage} alt="" loading="lazy" />
                ) : null}
                <div className="leadership-row__body">
                  <p className="leadership-row__name">{row.name}</p>
                  <p className="leadership-row__meta">
                    {row.district} · {row.role}
                  </p>
                  <p className="leadership-row__score">
                    {row.score.toLocaleString()} pts · <span className={badgeClass(row.badge)}>{row.badge}</span>
                  </p>
                  {row.highlight ? <p className="leadership-row__hint">{row.highlight}</p> : null}
                </div>
              </article>
            ))}
            {topThree.length < 3
              ? sortedRankings.map((row) => (
                  <article key={row.id} className="leadership-row card">
                    <span className="leadership-row__rank">{row.rank}</span>
                    <RankingRowBody row={row} badgeClass={badgeClass} />
                  </article>
                ))
              : null}
          </div>
        </>
      ) : null}

      {tab === "recognition" ? (
        <>
          <p className="leadership-page__intro">
            Official PLU awards issued by the secretariat for verified mobilisation, integrity, and service.
          </p>
          <div className="leadership-awards">
            {recognitions.map((award) => (
              <article key={award.id} className="card leadership-award">
                <div className="leadership-award__media">
                  <img src={award.coverImage} alt="" loading="lazy" />
                  <span className={`leadership-award__tier ${badgeClass(award.tier)}`}>{award.tier}</span>
                </div>
                <div className="leadership-award__body">
                  <p className="leadership-award__subtitle">{award.subtitle}</p>
                  <h3 className="leadership-award__title">{award.title}</h3>
                  <p className="leadership-award__recipient">
                    {award.recipient} · {award.district}
                  </p>
                  <p className="leadership-award__date">{award.dateLabel}</p>
                  <p className="leadership-award__text">{award.body}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {tab === "earn" ? (
        <>
          <div className="leadership-page__pillars">
            {pillars.map((p) => (
              <article key={p.id} className="leadership-pillar">
                <strong>{p.title}</strong>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
          <h2 className="section-title">Point categories</h2>
          {POINT_CATEGORIES.map((cat) => (
            <PointCategoryCard key={cat.id} cat={cat} />
          ))}
          <p className="card" style={{ fontSize: "0.78rem", color: "var(--plu-muted)", lineHeight: 1.45 }}>
            Tiers unlock at {RANK_THRESHOLDS.slice(1).join(", ")} points and above. Secretariat may adjust
            rankings after duty verification.
          </p>
          <Link to="/mobility" className="btn btn-ghost" style={{ marginTop: 8 }}>
            Transport apps (UGo & Tugende) →
          </Link>
        </>
      ) : null}
    </main>
  );
}

function RankingsPodium({
  topThree,
  badgeClass,
}: {
  topThree: ReturnType<typeof useLeadershipContent>["rankings"];
  badgeClass: (b: string) => string;
}) {
  const [second, first, third] = [topThree[1], topThree[0], topThree[2]];
  const slots = [
    { row: second, place: 2, className: "leadership-podium__slot leadership-podium__slot--2" },
    { row: first, place: 1, className: "leadership-podium__slot leadership-podium__slot--1" },
    { row: third, place: 3, className: "leadership-podium__slot leadership-podium__slot--3" },
  ];
  return (
    <section className="leadership-podium" aria-label="Top three patriots">
      {slots.map(({ row, place, className }) =>
        row ? (
          <article key={row.id} className={className}>
            <div className="leadership-podium__place">
              {place === 1 ? <Trophy size={18} /> : <Medal size={16} />}
              <span>#{place}</span>
            </div>
            {row.coverImage ? <img src={row.coverImage} alt="" /> : null}
            <p className="leadership-podium__name">{row.name}</p>
            <p className="leadership-podium__score">{row.score.toLocaleString()} pts</p>
            <span className={badgeClass(row.badge)}>{row.badge}</span>
          </article>
        ) : null
      )}
    </section>
  );
}

function RankingRowBody({
  row,
  badgeClass,
}: {
  row: ReturnType<typeof useLeadershipContent>["rankings"][number];
  badgeClass: (b: string) => string;
}) {
  return (
    <div className="leadership-row__body">
      <p className="leadership-row__name">{row.name}</p>
      <p className="leadership-row__meta">
        {row.district} · {row.role}
      </p>
      <p className="leadership-row__score">
        {row.score.toLocaleString()} pts · <span className={badgeClass(row.badge)}>{row.badge}</span>
      </p>
    </div>
  );
}

function PointCategoryCard({ cat }: { cat: (typeof POINT_CATEGORIES)[number] }) {
  return (
    <div className="card leadership-point-cat">
      <strong>{cat.label}</strong>
      <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--plu-muted)" }}>{cat.subtitle}</p>
    </div>
  );
}