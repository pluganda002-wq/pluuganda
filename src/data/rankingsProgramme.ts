/** Patriot rankings & recognition — secretariat-managed leaderboards. */

export const RANKINGS_PILLARS = [
  {
    title: "Verified service",
    body: "Points from completed duties, field proof, and digital tasks audited by PLU.",
  },
  {
    title: "Mobilisation impact",
    body: "Endorsements, membership growth, and district baraza participation.",
  },
  {
    title: "Integrity leadership",
    body: "Whistleblower support, project reviews, and anti-corruption programme work.",
  },
] as const;

export type RankingSeed = {
  id: string;
  rank: number;
  name: string;
  district: string;
  role: string;
  score: number;
  badge: string;
  coverImage: string;
  highlight?: string;
};

export type RecognitionSeed = {
  id: string;
  title: string;
  subtitle: string;
  recipient: string;
  district: string;
  dateLabel: string;
  body: string;
  coverImage: string;
  tier: string;
};

export const DEFAULT_RANKINGS: RankingSeed[] = [
  {
    id: "rank-1",
    rank: 1,
    name: "Hon. Central Region Mobiliser",
    district: "Kampala",
    role: "Regional coordinator",
    score: 9840,
    badge: "Gold",
    coverImage: "/branding/plu-metallic-gold-ref.png",
    highlight: "Led Q3 national endorsement drive",
  },
  {
    id: "rank-2",
    rank: 2,
    name: "Eastern Youth Coordinator",
    district: "Mbale",
    role: "Youth league",
    score: 9210,
    badge: "Gold",
    coverImage: "/branding/plu-hero-banner.png",
    highlight: "Youth forums across Busoga",
  },
  {
    id: "rank-3",
    rank: 3,
    name: "Northern Service Captain",
    district: "Gulu",
    role: "Field duties",
    score: 8875,
    badge: "Silver",
    coverImage: "/branding/field-evidence-default.jpg",
    highlight: "98% field verification rate",
  },
  {
    id: "rank-4",
    rank: 4,
    name: "Western Diaspora Link",
    district: "Mbarara",
    role: "Diaspora patriot",
    score: 8540,
    badge: "Silver",
    coverImage: "/branding/plu-services-hero.png",
  },
  {
    id: "rank-5",
    rank: 5,
    name: "Kampala Integrity Champion",
    district: "Kampala",
    role: "Integrity desk",
    score: 8120,
    badge: "Bronze",
    coverImage: "/branding/field-evidence-handbooks.jpg",
  },
  {
    id: "rank-6",
    rank: 6,
    name: "Tooro Sub-region Lead",
    district: "Fort Portal",
    role: "Mobilisation",
    score: 7890,
    badge: "Bronze",
    coverImage: "/tourism/adventure-2.jpg",
  },
  {
    id: "rank-7",
    rank: 7,
    name: "Busoga Baraza Organiser",
    district: "Jinja",
    role: "Community",
    score: 7620,
    badge: "Patriot",
    coverImage: "/tourism/cities-3.jpg",
  },
  {
    id: "rank-8",
    rank: 8,
    name: "Ankole Veterans Liaison",
    district: "Mbarara",
    role: "Veterans affairs",
    score: 7310,
    badge: "Patriot",
    coverImage: "/branding/field-mobilization-sample.jpg",
  },
];

export const DEFAULT_RECOGNITIONS: RecognitionSeed[] = [
  {
    id: "rec-gold-q3",
    title: "Gold Patriot — Q3 mobilisation",
    subtitle: "National recognition",
    recipient: "Central Region Mobiliser corps",
    district: "Nationwide",
    dateLabel: "Sep 2026",
    body: "Awarded for crossing 90% district endorsement targets with verified field reports.",
    coverImage: "/branding/plu-metallic-gold-ref.png",
    tier: "Gold",
  },
  {
    id: "rec-integrity",
    title: "Integrity Shield",
    subtitle: "Whistleblower support",
    recipient: "Kampala Integrity Champion",
    district: "Kampala",
    dateLabel: "Oct 2026",
    body: "Outstanding citizen reports resolved with district follow-up and public feedback.",
    coverImage: "/branding/field-evidence-cleanup.jpg",
    tier: "Silver",
  },
  {
    id: "rec-youth",
    title: "Youth Service Star",
    subtitle: "League & forums",
    recipient: "Eastern Youth Coordinator",
    district: "Mbale",
    dateLabel: "Nov 2026",
    body: "Hosted five forums with full registration and duty verification compliance.",
    coverImage: "/branding/plu-service-points-icon.png",
    tier: "Gold",
  },
  {
    id: "rec-field",
    title: "Field Duty Excellence",
    subtitle: "Photographic proof",
    recipient: "Northern Service Captain",
    district: "Gulu",
    dateLabel: "Nov 2026",
    body: "Highest verified field missions in the northern corridor this quarter.",
    coverImage: "/branding/field-mobilization-evidence.png",
    tier: "Platinum",
  },
  {
    id: "rec-charity",
    title: "Community Care Award",
    subtitle: "Charity drives",
    recipient: "Busoga Baraza Organiser",
    district: "Jinja",
    dateLabel: "Aug 2026",
    body: "Coordinated medical outreach supplies with transparent giving records.",
    coverImage: "/branding/plu-hero-banner.png",
    tier: "Bronze",
  },
];