export const YOUTH_PILLARS = [
  {
    id: "listen",
    title: "Listen",
    body: "Hear youth priorities in barazas, digital polls, and district listening sessions.",
  },
  {
    id: "organise",
    title: "Organise",
    body: "Join campus and district leagues; coordinate mentors and service teams.",
  },
  {
    id: "act",
    title: "Act",
    body: "Turn out for forums, clean-ups, and civic literacy drives with verified attendance.",
  },
] as const;

export type YouthLeagueChapter = {
  id: string;
  title: string;
  subtitle: string;
  district?: string;
};

export const YOUTH_LEAGUE_CHAPTERS: YouthLeagueChapter[] = [
  { id: "national", title: "National youth council", subtitle: "Country-wide coordination" },
  { id: "campus", title: "Campus patriots league", subtitle: "Universities & tertiary institutions" },
  { id: "district", title: "District youth mobilisers", subtitle: "Home district chapter" },
  { id: "skills", title: "Skills & enterprise circle", subtitle: "TVET, apprenticeships, BUBU" },
];

export type YouthForumEvent = {
  id: string;
  title: string;
  dateLabel: string;
  dateIso: string;
  location: string;
  spots: number;
  summary: string;
};

export const YOUTH_FORUM_EVENTS: YouthForumEvent[] = [
  {
    id: "forum-kampala-civic",
    title: "Youth civic forum — Kampala",
    dateLabel: "Nov 8, 2026",
    dateIso: "2026-11-08",
    location: "Naguru, Kampala",
    spots: 120,
    summary: "District youth coordinators, integrity briefing, and Q&A with league mentors.",
  },
  {
    id: "forum-mentorship",
    title: "Leadership mentorship circle",
    dateLabel: "Nov 15, 2026",
    dateIso: "2026-11-15",
    location: "Wakiso · Kira",
    spots: 40,
    summary: "Small-group mentorship for league chairs and campus reps.",
  },
  {
    id: "forum-cleanup",
    title: "Community clean-up mobilisation",
    dateLabel: "Nov 22, 2026",
    dateIso: "2026-11-22",
    location: "Jinja Road corridor",
    spots: 200,
    summary: "Field action with youth leagues — verify attendance for duty points.",
  },
];

export const YOUTH_FORUM_ROLES = [
  "Attendee",
  "Volunteer steward",
  "Speaker / testimony interest",
] as const;

export const YOUTH_LEAGUE_FORM = {
  title: "Join a youth league chapter",
  subtitle: "One registration per patriot. Secretariat confirms your chapter within 48 hours.",
  submitLabel: "Submit league application",
} as const;

export const YOUTH_FORUM_FORM = {
  title: "Register for a forum",
  subtitle: "Reserve a spot. Bring your PLU member ID or Telegram profile for check-in.",
  submitLabel: "Confirm registration",
} as const;