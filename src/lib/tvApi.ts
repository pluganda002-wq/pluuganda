import { DEFAULT_PLU_TV_PROGRAMS } from "@/data/pluTvCatalog";
import { youtubeEmbedUrlFromInput } from "@/lib/youtubeEmbed";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export type PluTvProgramPublic = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  embedUrl: string | null;
  scheduledAt: string | null;
};

export type PluTvComment = {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

function serializeLocal() {
  const now = Date.now();
  const map = DEFAULT_PLU_TV_PROGRAMS.filter((p) => p.isPublished).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    youtubeUrl: p.youtubeUrl,
    embedUrl: youtubeEmbedUrlFromInput(p.youtubeUrl),
    scheduledAt: p.scheduledAt,
    sortOrder: p.sortOrder,
  }));

  const upcoming = map
    .filter((r) => r.scheduledAt && new Date(r.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .map(({ sortOrder: _s, ...rest }) => rest);

  const past = map
    .filter((r) => !r.scheduledAt || new Date(r.scheduledAt).getTime() < now)
    .sort((a, b) => {
      const ta = new Date(a.scheduledAt ?? 0).getTime();
      const tb = new Date(b.scheduledAt ?? 0).getTime();
      return tb - ta;
    })
    .map(({ sortOrder: _s, ...rest }) => rest);

  return { upcoming, past };
}

/** Immediate client catalog (no network). */
export function getDefaultTvPrograms(): {
  upcoming: PluTvProgramPublic[];
  past: PluTvProgramPublic[];
} {
  return serializeLocal();
}

export async function fetchTvPrograms(): Promise<{ upcoming: PluTvProgramPublic[]; past: PluTvProgramPublic[] }> {
  const fallback = serializeLocal();
  try {
    const res = await fetch(`${API_BASE}/api/tv-programs`);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { upcoming?: PluTvProgramPublic[]; past?: PluTvProgramPublic[] };
    const upcoming = data.upcoming ?? [];
    const past = data.past ?? [];
    if (upcoming.length === 0 && past.length === 0) return fallback;
    return { upcoming, past };
  } catch {
    return fallback;
  }
}

export async function fetchTvComments(programId: string): Promise<PluTvComment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tv-comments?programId=${encodeURIComponent(programId)}`);
    if (!res.ok) return loadLocalComments(programId);
    const data = (await res.json()) as { comments?: PluTvComment[] };
    return Array.isArray(data.comments) ? data.comments : [];
  } catch {
    return loadLocalComments(programId);
  }
}

export async function postTvComment(payload: {
  programId: string;
  body: string;
  authorName?: string;
  telegramId?: number;
  telegramUsername?: string;
}): Promise<PluTvComment> {
  try {
    const res = await fetch(`${API_BASE}/api/tv-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { comment?: PluTvComment; saved?: string };
    if (res.ok && data.comment) {
      if (data.saved === "client-only") return saveLocalComment(payload);
      return data.comment;
    }
    throw new Error("post failed");
  } catch {
    return saveLocalComment(payload);
  }
}

const COMMENTS_KEY = "plu-tv-comments-v1";

type StoredComment = PluTvComment & { programId: string };

function loadLocalComments(programId: string): PluTvComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as StoredComment[];
    return all.filter((c) => c.programId === programId).map(({ programId: _p, ...c }) => c);
  } catch {
    return [];
  }
}

function saveLocalComment(payload: {
  programId: string;
  body: string;
  authorName?: string;
}): PluTvComment {
  const comment: StoredComment = {
    id: `tc-${Date.now().toString(36)}`,
    programId: payload.programId,
    authorName: payload.authorName?.trim() || "Patriot",
    body: payload.body.trim(),
    createdAt: new Date().toISOString(),
  };
  const raw = localStorage.getItem(COMMENTS_KEY);
  const all: StoredComment[] = raw ? (JSON.parse(raw) as StoredComment[]) : [];
  all.unshift(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all.slice(0, 200)));
  const { programId: _p, ...pub } = comment;
  return pub;
}