import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PLU_YOUTUBE_CHANNEL_URL } from "@/data/pluTvCatalog";
import { useTelegram } from "@/hooks/useTelegram";
import { useUser } from "@/context/UserContext";
import { youtubeThumbnailUrl } from "@/lib/youtubeEmbed";
import {
  fetchTvComments,
  fetchTvPrograms,
  getDefaultTvPrograms,
  postTvComment,
  type PluTvComment,
  type PluTvProgramPublic,
} from "@/lib/tvApi";
import "./PluTvPage.css";

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function PluTvPage() {
  const { user, displayName, haptic, showAlert } = useTelegram();
  const { member } = useUser();

  const boot = getDefaultTvPrograms();
  const [upcoming, setUpcoming] = useState<PluTvProgramPublic[]>(boot.upcoming);
  const [past, setPast] = useState<PluTvProgramPublic[]>(boot.past);
  const [listTab, setListTab] = useState<"upcoming" | "library">(
    boot.past.length > 0 ? "library" : "upcoming"
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeProgram, setActiveProgram] = useState<PluTvProgramPublic | null>(null);
  const [comments, setComments] = useState<PluTvComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authorName = member?.fullName?.trim() || displayName;

  const loadPrograms = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    try {
      const data = await fetchTvPrograms();
      setUpcoming(data.upcoming);
      setPast(data.past);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPrograms({ silent: true });
  }, [loadPrograms]);

  const loadComments = useCallback(async (programId: string) => {
    setCommentsLoading(true);
    try {
      const rows = await fetchTvComments(programId);
      setComments(rows);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeProgram) {
      setComments([]);
      setDraft("");
      return;
    }
    void loadComments(activeProgram.id);
  }, [activeProgram, loadComments]);

  async function submitComment() {
    if (!activeProgram) return;
    const text = draft.trim();
    if (!text) {
      showAlert("Write your comment first.");
      return;
    }
    setSubmitting(true);
    try {
      const comment = await postTvComment({
        programId: activeProgram.id,
        body: text,
        authorName,
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
      setComments((prev) => [comment, ...prev]);
      setDraft("");
      haptic("medium");
      showAlert("Comment posted.");
    } catch {
      showAlert("Could not post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeList = listTab === "upcoming" ? upcoming : past;
  const emptyCopy =
    listTab === "upcoming"
      ? "Nothing scheduled yet. New broadcasts will appear here."
      : "Replays from @plutv1 appear here when published.";

  function ProgramCard({
    program,
    variant,
  }: {
    program: PluTvProgramPublic;
    variant: "upcoming" | "past";
  }) {
    const thumb = youtubeThumbnailUrl(program.youtubeUrl);
    return (
      <button
        type="button"
        className={`plu-tv-card${variant === "upcoming" ? " plu-tv-card--upcoming" : ""}`}
        onClick={() => {
          haptic("light");
          setActiveProgram(program);
        }}
      >
        <div className="plu-tv-card__thumb">
          {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className="plu-tv-card__play">PLU TV</span>}
          <span className="plu-tv-card__play">▶ Watch</span>
        </div>
        <div className="plu-tv-card__body">
          <p className="plu-tv-card__title">{program.title}</p>
          {program.scheduledAt ? <p className="plu-tv-card__when">{formatWhen(program.scheduledAt)}</p> : null}
          {program.description ? <p className="plu-tv-card__desc">{program.description}</p> : null}
          <p className="plu-tv-card__hint">Tap to play · comment</p>
        </div>
      </button>
    );
  }

  return (
    <main className="page plu-tv-page">
      <PageHeader
        title="PLU TV"
        subtitle="Episodes from Patriotic League of Uganda on YouTube — barazas, briefings, and civic learning."
      />

      <div className="plu-tv__actions">
        <a href={PLU_YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          @plutv1 on YouTube
        </a>
        <button type="button" className="btn btn-ghost" disabled={refreshing} onClick={() => void loadPrograms()}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && upcoming.length === 0 && past.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--plu-muted)", fontSize: "0.85rem" }}>Loading programs…</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="plu-tv__tabs" role="tablist" aria-label="PLU TV lists">
              <button
                type="button"
                role="tab"
                aria-selected={listTab === "upcoming"}
                className={`plu-tv__tab${listTab === "upcoming" ? " plu-tv__tab--active" : ""}`}
                onClick={() => setListTab("upcoming")}
              >
                Upcoming{upcoming.length ? ` (${upcoming.length})` : ""}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={listTab === "library"}
                className={`plu-tv__tab${listTab === "library" ? " plu-tv__tab--active" : ""}`}
                onClick={() => setListTab("library")}
              >
                Library{past.length ? ` (${past.length})` : ""}
              </button>
            </div>
          </div>

          {activeList.length === 0 ? (
            <p className="card" style={{ textAlign: "center", color: "var(--plu-muted)", fontSize: "0.84rem" }}>
              {emptyCopy}
            </p>
          ) : (
            <div className="plu-tv__grid">
              {activeList.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  variant={listTab === "upcoming" ? "upcoming" : "past"}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Link to="/programmes/tasks?tab=digital" className="btn btn-ghost" style={{ marginTop: 12 }}>
        Earn points — subscribe on YouTube
      </Link>

      {activeProgram ? (
        <div
          className="plu-tv-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plu-tv-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveProgram(null);
          }}
        >
          <div className="plu-tv-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="plu-tv-modal__head">
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, color: "var(--plu-gold-dark)" }}>
                  PLU TV
                </p>
                <h2 id="plu-tv-modal-title" style={{ margin: "4px 0 0", fontSize: "1rem", lineHeight: 1.3 }}>
                  {activeProgram.title}
                </h2>
                {activeProgram.scheduledAt ? (
                  <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "var(--plu-muted)" }}>
                    {formatWhen(activeProgram.scheduledAt)}
                  </p>
                ) : null}
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setActiveProgram(null)}>
                Close
              </button>
            </div>
            <div className="plu-tv-modal__body">
              {activeProgram.description ? (
                <p style={{ margin: "0 0 12px", fontSize: "0.84rem", lineHeight: 1.45 }}>{activeProgram.description}</p>
              ) : null}

              {activeProgram.embedUrl ? (
                <div className="plu-tv-modal__embed">
                  <iframe
                    src={activeProgram.embedUrl}
                    title={activeProgram.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="card" style={{ fontSize: "0.82rem", color: "var(--plu-muted)" }}>
                  Video needs a valid YouTube URL.
                </p>
              )}

              <div className="card" style={{ marginTop: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: "0.88rem" }}>Comments</h3>
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    user ? "Share feedback on this episode…" : "Open in Telegram to comment as your profile."
                  }
                  disabled={submitting}
                  style={{ width: "100%", resize: "vertical" }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 8, width: "100%" }}
                  disabled={submitting}
                  onClick={() => void submitComment()}
                >
                  {submitting ? "Posting…" : "Post comment"}
                </button>
              </div>

              <div style={{ marginTop: 14 }}>
                <p style={{ margin: "0 0 8px", fontSize: "0.72rem", fontWeight: 800, color: "var(--plu-muted)" }}>
                  Recent comments
                </p>
                {commentsLoading ? (
                  <p style={{ fontSize: "0.78rem", color: "var(--plu-muted)" }}>Loading…</p>
                ) : comments.length === 0 ? (
                  <p style={{ fontSize: "0.78rem", color: "var(--plu-muted)" }}>No comments yet — start the conversation.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="plu-tv-comments__item">
                      <span className="plu-tv-comments__meta">{c.authorName ?? "Patriot"}</span>
                      <span className="plu-tv-comments__time">{formatWhen(c.createdAt)}</span>
                      <p className="plu-tv-comments__text">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}