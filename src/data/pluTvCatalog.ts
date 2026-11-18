export const PLU_YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@plutv1";

export type PluTvSeedProgram = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  scheduledAt: string | null;
  sortOrder: number;
  isPublished: boolean;
};

function watch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Default PLU TV library — official channel @plutv1 replays and briefings. */
export const DEFAULT_PLU_TV_PROGRAMS: PluTvSeedProgram[] = [
  {
    id: "plu-tv-fadil-handover",
    sortOrder: 0,
    title: "Hon. Fadil Twalla takes office as PLU General Secretary",
    description: "Official handover at the PLU secretariat — continuity and mobilisation priorities.",
    youtubeUrl: watch("rK8yvocwmto"),
    scheduledAt: "2026-06-17T12:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-fadil-pledge",
    sortOrder: 1,
    title: "Building on legacy — new General Secretary",
    description: "Hon. Fadil Twalla on service, unity, and grassroots mobilisation (UBC).",
    youtubeUrl: watch("WDgCQgCijwQ"),
    scheduledAt: "2026-06-15T09:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-leadership-reshuffle",
    sortOrder: 2,
    title: "PLU leadership reshuffle — General Secretary appointment",
    description: "Central Committee changes and secretariat realignment.",
    youtubeUrl: watch("jFP0KXe6DmU"),
    scheduledAt: "2026-06-10T14:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-who-is-fadil",
    sortOrder: 3,
    title: "Who is Fadil Twalla? Rise of PLU’s Secretary General",
    description: "Profile of the new General Secretary and Sebei–national mobilisation journey.",
    youtubeUrl: watch("WkYwHlm5k00"),
    scheduledAt: "2026-05-28T10:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-presidential-endorsement",
    sortOrder: 4,
    title: "PLU endorsement for 2031 — national briefing",
    description: "Leaders and coordinators on nationwide mobilisation and signature drive.",
    youtubeUrl: watch("e-x8NYVm_QU"),
    scheduledAt: "2026-05-20T11:30:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-rebrand-plu",
    sortOrder: 5,
    title: "MK Movement becomes Patriotic League of Uganda",
    description: "Launch of PLU and outline of the organisation’s future plans.",
    youtubeUrl: watch("mRNw7YYy8eY"),
    scheduledAt: "2026-04-12T08:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-mobilisation-structures",
    sortOrder: 6,
    title: "PLU launches national mobilisation structures",
    description: "Village-to-national structures for patriotic engagement and campaigns.",
    youtubeUrl: watch("ZGbf_AUbOKY"),
    scheduledAt: "2026-03-22T15:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-vice-chair-nuwagira",
    sortOrder: 7,
    title: "National Vice Chairman — message to patriots",
    description: "Hon. Micheal Nuwagira Kaguta updates supporters on PLU coordination.",
    youtubeUrl: watch("CFcEiSH4jWY"),
    scheduledAt: "2026-03-05T13:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-150k-foot-soldiers",
    sortOrder: 8,
    title: "150,000 patriots join PLU mobilisation drive",
    description: "Grassroots recruitment and structure-building across the country.",
    youtubeUrl: watch("mg_k3TC2gxs"),
    scheduledAt: "2026-02-18T16:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-central-vice-gashumba",
    sortOrder: 9,
    title: "Central Region Vice Chairman — Bulange engagement",
    description: "Mr. Frank Gashumba on PLU presence and mobilisation in Central Uganda.",
    youtubeUrl: watch("yNQpOJ27j34"),
    scheduledAt: "2026-02-01T12:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-mawanda-mobilisation",
    sortOrder: 10,
    title: "Director Mobilisation — patriot message",
    description: "Hon. Micheal Mawanda addresses patriots on duty and organisation building.",
    youtubeUrl: watch("ei8fnOMxkIs"),
    scheduledAt: "2026-01-20T10:30:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-plu-changes-ahead",
    sortOrder: 11,
    title: "Organisational updates — Patriotic League of Uganda",
    description: "Preview of forthcoming PLU structural and leadership enhancements.",
    youtubeUrl: watch("TnLGyeY2TzU"),
    scheduledAt: "2025-12-08T09:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-kira-engagement",
    sortOrder: 12,
    title: "Community engagement — Kira Municipality",
    description: "PLU leaders interact with residents on service delivery and patriotism.",
    youtubeUrl: watch("L6_-8YPE7iM"),
    scheduledAt: "2025-11-15T14:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-secretariat-media",
    sortOrder: 13,
    title: "PLU secretariat — media briefing",
    description: "Official communication from the Patriotic League secretariat.",
    youtubeUrl: watch("F1xLC3ujcm8"),
    scheduledAt: "2025-10-30T11:00:00.000Z",
    isPublished: true,
  },
  {
    id: "plu-tv-upcoming-live",
    sortOrder: 14,
    title: "PLU TV live — patriot briefing",
    description: "Scheduled stream from @plutv1. Tap to watch and comment.",
    youtubeUrl: watch("9Jhx2vI4u8M"),
    scheduledAt: "2026-12-15T18:00:00.000Z",
    isPublished: true,
  },
];