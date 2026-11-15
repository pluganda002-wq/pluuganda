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

export type ProgrammeSlug = "anti-corruption";

export const PROGRAMMES: {
  slug: ProgrammeSlug;
  title: string;
  summary: string;
  listen: string;
  organise: string;
  act: string;
}[] = [
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
    logo: "/branding/ugo-ride.png",
    desc: "Car rides for members travelling to PLU events and community service.",
    status: "Partner onboarding",
  },
  {
    id: "tugende",
    name: "Tugende",
    logo: "/branding/tugende-safe-boda.png",
    desc: "Verified boda transport for safe last-mile access to barazas and clean-ups.",
    status: "Live · UGX 1,000/km",
  },
  {
    id: "hubs",
    name: "Transport & trucking hubs",
    desc: "Coordination for logistics, supplies and regional mobilisation.",
    status: "Pilot planning",
  },
];

export const BUBU_TAGLINE = "Buy Uganda, Build Uganda.";

export const BUBU_PILLARS = [
  {
    title: "Buy local",
    text: "Choose Ugandan-made goods and services to keep jobs and value at home.",
  },
  {
    title: "Build industries",
    text: "Support MSMEs, agro-processing and manufacturing that create wealth in every district.",
  },
  {
    title: "Patriot consumers",
    text: "PLU members mobilise responsible spending that strengthens national development.",
  },
] as const;

export const BUBU_CATEGORIES = [
  { id: "agro", name: "Agro & food", examples: "Coffee, tea, fruits, honey, packaged foods" },
  { id: "fashion", name: "Fashion & crafts", examples: "Kitenge, leather, baskets, jewellery" },
  { id: "build", name: "Build & home", examples: "Cement, tiles, furniture made in Uganda" },
  { id: "tech", name: "Innovation", examples: "Apps, fintech and tech solutions by Ugandan teams" },
] as const;

export const BUBU_FEATURED = [
  { name: "Uganda Coffee Collective", district: "Mbale / Bugisu", tag: "Verified local" },
  { name: "Nile Craft Export Hub", district: "Jinja", tag: "Artisan" },
  { name: "Ankole Leather Works", district: "Mbarara", tag: "Made in Uganda" },
  { name: "Kampala Green Foods", district: "Kampala", tag: "Agro-processing" },
];

export const TOURISM_REGIONS = [
  {
    id: "wildlife",
    name: "Wildlife & parks",
    highlights: "Murchison Falls, Queen Elizabeth, Bwindi gorilla trekking, Kidepo",
    tip: "Book through licensed operators; respect park rules and communities.",
  },
  {
    id: "culture",
    name: "Culture & heritage",
    highlights: "Kasubi Tombs, Ndere Centre, regional kingdom sites, local festivals",
    tip: "Combine visits with district barazas and community service where scheduled.",
  },
  {
    id: "adventure",
    name: "Adventure & nature",
    highlights: "Source of the Nile, Rwenzori hikes, Ssese Islands, crater lakes",
    tip: "Use registered guides; share itineraries with your district mobiliser when on PLU trips.",
  },
  {
    id: "cities",
    name: "City experiences",
    highlights: "Kampala nightlife & markets, Entebbe lakefront, Jinja adventure hub",
    tip: "UGo Ride and Tugende partners (when live) support safe movement between venues.",
  },
] as const;

export const TOURISM_PACKAGES = [
  { title: "Patriot heritage weekend", region: "Central", duration: "2 days", status: "Register interest" },
  { title: "Pearl of Africa nature trail", region: "Western", duration: "5 days", status: "Coming soon" },
  { title: "Diaspora homecoming tour", region: "Multi-region", duration: "10 days", status: "Planning" },
];

export const ASSISTANT_PROMPTS = [
  "How do I register as a PLU member?",
  "Where is the next District Baraza?",
  "How do I report corruption securely?",
  "What youth programmes can I join?",
  "How do I add my presidential endorsement?",
  "Tourism experiences in Uganda",
  "Buy Uganda Build Uganda — how do I participate?",
];
