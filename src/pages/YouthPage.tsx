import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { YouthForumForm } from "@/components/youth/YouthForumForm";
import { YouthLeagueForm } from "@/components/youth/YouthLeagueForm";
import { YOUTH_FORUM_EVENTS, YOUTH_PILLARS } from "@/data/youthProgramme";
import { countForumRegistrations, loadYouthRegistrations } from "@/lib/youthRegistrations";
import "./YouthPage.css";

type Panel = "overview" | "league" | "forums" | "mine";

export function YouthPage() {
  const [panel, setPanel] = useState<Panel>("overview");
  const [forumEventId, setForumEventId] = useState<string | undefined>();
  const [registrations, setRegistrations] = useState(() => loadYouthRegistrations());

  const refreshRegs = useCallback(() => setRegistrations(loadYouthRegistrations()), []);

  return (
    <main className="page youth-page">
      <PageHeader
        title="Youth leagues & forums"
        subtitle="Listen → Organise → Act. Join a chapter, reserve forum seats, and track your sign-ups."
      />

      <div className="youth-page__pillars">
        {YOUTH_PILLARS.map((p) => (
          <article key={p.id} className="youth-pillar">
            <strong>{p.title}</strong>
            <p>{p.body}</p>
          </article>
        ))}
      </div>

      <div className="youth-page__tabs" role="tablist" aria-label="Youth programmes">
        {(
          [
            ["overview", "Overview"],
            ["league", "Join league"],
            ["forums", "Forum forms"],
            ["mine", `My sign-ups (${registrations.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={panel === id}
            className={`youth-page__tab${panel === id ? " youth-page__tab--active" : ""}`}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "overview" ? (
        <>
          {YOUTH_FORUM_EVENTS.map((ev) => {
            const taken = countForumRegistrations(ev.id);
            const left = Math.max(0, ev.spots - taken);
            return (
              <div key={ev.id} className="card youth-event">
                <strong>{ev.title}</strong>
                <p className="youth-event__meta">
                  {ev.dateLabel} · {ev.location} · {left} spots left
                </p>
                <p className="youth-event__summary">{ev.summary}</p>
                <div className="youth-event__actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setForumEventId(ev.id);
                      setPanel("forums");
                    }}
                  >
                    Register interest
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setPanel("league")}>
                    Join league instead
                  </button>
                </div>
              </div>
            );
          })}
          <Link to="/programmes" className="btn btn-ghost" style={{ marginTop: 8 }}>
            Open accountability programme hub
          </Link>
        </>
      ) : null}

      {panel === "league" ? <YouthLeagueForm onSaved={refreshRegs} /> : null}

      {panel === "forums" ? (
        <YouthForumForm
          key={forumEventId ?? "default-forum"}
          initialEventId={forumEventId}
          onSaved={refreshRegs}
        />
      ) : null}

      {panel === "mine" ? (
        <div className="card">
          {registrations.length === 0 ? (
            <p style={{ margin: 0, color: "var(--plu-muted)", fontSize: "0.84rem" }}>
              No sign-ups yet. Join a league or register for a forum.
            </p>
          ) : (
            registrations.map((r) => (
              <div key={r.id} className="youth-mine__item">
                <span className="youth-mine__ref">{r.reference}</span>
                <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: "0.88rem" }}>{r.fullName}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--plu-muted)" }}>
                  {r.kind === "league"
                    ? `League · ${r.chapterTitle} · ${r.district}`
                    : `Forum · ${r.eventTitle} · ${r.role}`}
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </main>
  );
}