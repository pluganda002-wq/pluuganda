export const PLU_TAGLINE = "Connect. Participate. Build Uganda.";

export const PLU_STATS = {
  endorsements: 147_826,
  districts: 146,
  members: 150_689,
} as const;

export const PLU_ADDRESS = "Plot 7 Saddler Lane, Naguru, Kampala, Uganda";

export const PLU_VALUES = [
  {
    title: "Patriotism",
    text: "Love, loyalty and commitment to Uganda above personal or sectarian interests.",
  },
  {
    title: "National Unity",
    text: "Harmony across tribes, religions, regions and political backgrounds.",
  },
  {
    title: "Integrity & Accountability",
    text: "Protect public resources; promote honesty and responsible leadership.",
  },
  {
    title: "Service to the Nation",
    text: "Community service and civic engagement that puts people first.",
  },
] as const;

export type ProgrammeSlug =
  | "barazas"
  | "community-service"
  | "civic-education"
  | "youth"
  | "sports"
  | "diaspora"
  | "anti-corruption";

export const PROGRAMMES: {
  slug: ProgrammeSlug;
  title: string;
  summary: string;
  listen: string;
  organise: string;
  act: string;
}[] = [
  {
    slug: "barazas",
    title: "District Barazas",
    summary:
      "Open district gatherings for citizens, leaders and PLU structures to discuss priorities and follow-up.",
    listen: "Barazas create space for communities to raise priorities and share ideas.",
    organise: "PLU teams turn priorities into coordinated civic and service activities.",
    act: "Activities are delivered publicly and connected to reporting and accountability.",
  },
  {
    slug: "community-service",
    title: "Community service initiatives",
    summary: "Volunteer clean-ups and locally identified service with residents and institutions.",
    listen: "Residents identify needs in their neighbourhoods.",
    organise: "Volunteers and local leaders schedule service days.",
    act: "Visible national service in healthier public spaces.",
  },
  {
    slug: "civic-education",
    title: "Civic education",
    summary: "Forums on citizenship, constitutional duties, national values and peaceful participation.",
    listen: "Questions and concerns from citizens guide session topics.",
    organise: "Educators and mobilisers prepare accessible learning.",
    act: "Participants apply knowledge in local engagement.",
  },
  {
    slug: "youth",
    title: "Youth programmes",
    summary: "Youth forums, leadership development and service for constructive participation.",
    listen: "Young Ugandans share ideas and local challenges.",
    organise: "Youth leagues coordinate forums and mentorship.",
    act: "Projects and service activities led by youth structures.",
  },
  {
    slug: "sports",
    title: "Sports & community programmes",
    summary: "Runs, sports and gatherings that build solidarity, wellbeing and teamwork.",
    listen: "Communities propose accessible participation points.",
    organise: "Events are scheduled with safety and inclusion in mind.",
    act: "Families and young people meet, compete and serve together.",
  },
  {
    slug: "diaspora",
    title: "Diaspora engagement",
    summary: "Channels for Ugandans abroad to stay connected and contribute skills and ideas.",
    listen: "Diaspora voices on development priorities.",
    organise: "Virtual and in-country linkages with PLU programmes.",
    act: "Support for civic and community initiatives at home.",
  },
  {
    slug: "anti-corruption",
    title: "Anti-corruption & accountability",
    summary: "Public education, secure reporting and transparent case tracking.",
    listen: "Citizens report suspected corruption securely.",
    organise: "Cases move from review to investigation through lawful institutions.",
    act: "Public can follow outcomes and demand evidence-based action.",
  },
];

export const LEADERSHIP_RANKINGS = [
  { rank: 1, name: "Central Region Mobiliser", score: 9840, badge: "Gold" },
  { rank: 2, name: "Eastern Youth Coordinator", score: 9210, badge: "Gold" },
  { rank: 3, name: "Northern Service Captain", score: 8875, badge: "Silver" },
  { rank: 4, name: "Western Diaspora Link", score: 8540, badge: "Silver" },
  { rank: 5, name: "Kampala Integrity Champion", score: 8120, badge: "Bronze" },
];

export const CASE_TRACKER = [
  {
    id: "PLU-AC-1042",
    title: "Public procurement review — district works",
    status: "Under investigation",
    updated: "2026-10-18",
  },
  {
    id: "PLU-AC-1038",
    title: "Service delivery follow-up — health unit",
    status: "Action taken",
    updated: "2026-10-12",
  },
  {
    id: "PLU-AC-1031",
    title: "Community report — local revenue collection",
    status: "In review",
    updated: "2026-10-05",
  },
];

export const EDUCATION_MODULES = [
  { id: "citizenship", title: "Responsible citizenship", duration: "12 min" },
  { id: "constitution", title: "Constitution & civic duties", duration: "18 min" },
  { id: "integrity", title: "Protecting public resources", duration: "15 min" },
  { id: "unity", title: "National unity in practice", duration: "10 min" },
];

export const SOCIAL_FEED = [
  {
    id: "1",
    author: "PLU Secretariat",
    text: "District Baraza schedule for November is being finalised — watch for updates in your district.",
    time: "2h ago",
  },
  {
    id: "2",
    author: "Youth League",
    text: "Registration open for the next civic education forum. Bring a friend — serve Uganda together.",
    time: "5h ago",
  },
  {
    id: "3",
    author: "Integrity Desk",
    text: "New public case summary published. Follow lawful institutions for official outcomes.",
    time: "1d ago",
  },
];

export const MOBILITY_SERVICES = [
  {
    id: "ugo",
    name: "UGo Ride",
    desc: "Car rides for members travelling to PLU events and community service.",
    status: "Partner onboarding",
  },
  {
    id: "tugende",
    name: "Tugende Safe Boda",
    desc: "Verified boda transport for safe last-mile access to barazas and clean-ups.",
    status: "Coming soon",
  },
  {
    id: "hubs",
    name: "Transport & trucking hubs",
    desc: "Coordination for logistics, supplies and regional mobilisation.",
    status: "Pilot planning",
  },
];

export const ASSISTANT_PROMPTS = [
  "How do I register as a PLU member?",
  "Where is the next District Baraza?",
  "How do I report corruption securely?",
  "What youth programmes can I join?",
  "How do I add my presidential endorsement?",
];
