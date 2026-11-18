import { getDb, isDbConfigured } from "./lib/mongodb.js";

/** Keep in sync with src/data/pluTvCatalog.ts */
const DEFAULT_PROGRAMS = [
  {
    id: "plu-tv-fadil-handover",
    sortOrder: 0,
    title: "Hon. Fadil Twalla takes office as PLU General Secretary",
    description: "Official handover at the PLU secretariat — continuity and mobilisation priorities.",
    youtubeUrl: "https://www.youtube.com/watch?v=rK8yvocwmto",
    scheduledAt: new Date("2026-06-17T12:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-fadil-pledge",
    sortOrder: 1,
    title: "Building on legacy — new General Secretary",
    description: "Hon. Fadil Twalla on service, unity, and grassroots mobilisation (UBC).",
    youtubeUrl: "https://www.youtube.com/watch?v=WDgCQgCijwQ",
    scheduledAt: new Date("2026-06-15T09:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-leadership-reshuffle",
    sortOrder: 2,
    title: "PLU leadership reshuffle — General Secretary appointment",
    description: "Central Committee changes and secretariat realignment.",
    youtubeUrl: "https://www.youtube.com/watch?v=jFP0KXe6DmU",
    scheduledAt: new Date("2026-06-10T14:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-who-is-fadil",
    sortOrder: 3,
    title: "Who is Fadil Twalla? Rise of PLU’s Secretary General",
    description: "Profile of the new General Secretary and Sebei–national mobilisation journey.",
    youtubeUrl: "https://www.youtube.com/watch?v=WkYwHlm5k00",
    scheduledAt: new Date("2026-05-28T10:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-presidential-endorsement",
    sortOrder: 4,
    title: "PLU endorsement for 2031 — national briefing",
    description: "Leaders and coordinators on nationwide mobilisation and signature drive.",
    youtubeUrl: "https://www.youtube.com/watch?v=e-x8NYVm_QU",
    scheduledAt: new Date("2026-05-20T11:30:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-rebrand-plu",
    sortOrder: 5,
    title: "MK Movement becomes Patriotic League of Uganda",
    description: "Launch of PLU and outline of the organisation’s future plans.",
    youtubeUrl: "https://www.youtube.com/watch?v=mRNw7YYy8eY",
    scheduledAt: new Date("2026-04-12T08:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-mobilisation-structures",
    sortOrder: 6,
    title: "PLU launches national mobilisation structures",
    description: "Village-to-national structures for patriotic engagement and campaigns.",
    youtubeUrl: "https://www.youtube.com/watch?v=ZGbf_AUbOKY",
    scheduledAt: new Date("2026-03-22T15:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-vice-chair-nuwagira",
    sortOrder: 7,
    title: "National Vice Chairman — message to patriots",
    description: "Hon. Micheal Nuwagira Kaguta updates supporters on PLU coordination.",
    youtubeUrl: "https://www.youtube.com/watch?v=CFcEiSH4jWY",
    scheduledAt: new Date("2026-03-05T13:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-150k-foot-soldiers",
    sortOrder: 8,
    title: "150,000 patriots join PLU mobilisation drive",
    description: "Grassroots recruitment and structure-building across the country.",
    youtubeUrl: "https://www.youtube.com/watch?v=mg_k3TC2gxs",
    scheduledAt: new Date("2026-02-18T16:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-central-vice-gashumba",
    sortOrder: 9,
    title: "Central Region Vice Chairman — Bulange engagement",
    description: "Mr. Frank Gashumba on PLU presence and mobilisation in Central Uganda.",
    youtubeUrl: "https://www.youtube.com/watch?v=yNQpOJ27j34",
    scheduledAt: new Date("2026-02-01T12:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-mawanda-mobilisation",
    sortOrder: 10,
    title: "Director Mobilisation — patriot message",
    description: "Hon. Micheal Mawanda addresses patriots on duty and organisation building.",
    youtubeUrl: "https://www.youtube.com/watch?v=ei8fnOMxkIs",
    scheduledAt: new Date("2026-01-20T10:30:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-plu-changes-ahead",
    sortOrder: 11,
    title: "Organisational updates — Patriotic League of Uganda",
    description: "Preview of forthcoming PLU structural and leadership enhancements.",
    youtubeUrl: "https://www.youtube.com/watch?v=TnLGyeY2TzU",
    scheduledAt: new Date("2025-12-08T09:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-kira-engagement",
    sortOrder: 12,
    title: "Community engagement — Kira Municipality",
    description: "PLU leaders interact with residents on service delivery and patriotism.",
    youtubeUrl: "https://www.youtube.com/watch?v=L6_-8YPE7iM",
    scheduledAt: new Date("2025-11-15T14:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-secretariat-media",
    sortOrder: 13,
    title: "PLU secretariat — media briefing",
    description: "Official communication from the Patriotic League secretariat.",
    youtubeUrl: "https://www.youtube.com/watch?v=F1xLC3ujcm8",
    scheduledAt: new Date("2025-10-30T11:00:00.000Z"),
    isPublished: true,
  },
  {
    id: "plu-tv-upcoming-live",
    sortOrder: 14,
    title: "PLU TV live — patriot briefing",
    description: "Scheduled stream from @plutv1. Tap to watch and comment.",
    youtubeUrl: "https://www.youtube.com/watch?v=9Jhx2vI4u8M",
    scheduledAt: new Date("2026-12-15T18:00:00.000Z"),
    isPublished: true,
  },
];

function youtubeEmbedUrlFromInput(raw) {
  const s = raw.trim();
  if (!s) return null;
  try {
    const urlStr = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(urlStr);
    let id = null;
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") id = u.pathname.replace(/^\//, "").split("/")[0] ?? null;
    else if (host === "youtube.com" || host === "m.youtube.com") {
      id = u.searchParams.get("v");
      const path = u.pathname;
      if (!id && path.startsWith("/embed/")) id = path.slice(7).split("/")[0] ?? null;
      if (!id && path.startsWith("/shorts/")) id = path.slice(8).split("/")[0] ?? null;
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}

function serializeProgram(p) {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    youtubeUrl: p.youtubeUrl,
    embedUrl: youtubeEmbedUrlFromInput(p.youtubeUrl),
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt).toISOString() : null,
    sortOrder: p.sortOrder ?? 0,
  };
}

async function loadPrograms(db) {
  let rows = await db.collection("tv_programs").find({ isPublished: true }).toArray();
  if (!rows.length) {
    await db.collection("tv_programs").insertMany(
      DEFAULT_PROGRAMS.map((p) => ({
        ...p,
        scheduledAt: p.scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    rows = await db.collection("tv_programs").find({ isPublished: true }).toArray();
  }
  return rows;
}

function splitPrograms(serialized) {
  const now = Date.now();
  const upcoming = serialized
    .filter((r) => r.scheduledAt && new Date(r.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = serialized
    .filter((r) => !r.scheduledAt || new Date(r.scheduledAt).getTime() < now)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(b.scheduledAt ?? 0).getTime() - new Date(a.scheduledAt ?? 0).getTime();
    });
  return { upcoming, past };
}

export async function GET() {
  if (!isDbConfigured()) {
    const now = Date.now();
    const mapped = DEFAULT_PROGRAMS.map(serializeProgram);
    const upcoming = mapped
      .filter((r) => r.scheduledAt && new Date(r.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const past = mapped
      .filter((r) => !r.scheduledAt || new Date(r.scheduledAt).getTime() < now)
      .sort((a, b) => new Date(b.scheduledAt ?? 0).getTime() - new Date(a.scheduledAt ?? 0).getTime());
    return Response.json({ upcoming, past, source: "default" });
  }

  try {
    const db = await getDb();
    const rows = await loadPrograms(db);
    const serialized = rows.map(serializeProgram);
    const { upcoming, past } = splitPrograms(serialized);
    if (upcoming.length === 0 && past.length === 0) {
      const mapped = DEFAULT_PROGRAMS.map(serializeProgram);
      const fallback = splitPrograms(mapped);
      return Response.json({ ...fallback, source: "default-fallback" });
    }
    return Response.json({ upcoming, past, source: "database" });
  } catch (e) {
    console.error("[tv-programs GET]", e);
    const mapped = DEFAULT_PROGRAMS.map(serializeProgram);
    const { upcoming, past } = splitPrograms(mapped);
    return Response.json({ upcoming, past, source: "default-error" });
  }
}