export type TourismPackageStatus = "open" | "waitlist" | "planning";

export type TourismPackage = {
  id: string;
  title: string;
  region: string;
  duration: string;
  status: TourismPackageStatus;
  statusLabel: string;
  spots: number;
  summary: string;
  departLabel?: string;
};

export const TOURISM_PILLARS = [
  {
    id: "safe",
    title: "Safe & organised",
    body: "Licensed guides, shared itineraries, and district mobiliser contact for PLU group travel.",
  },
  {
    id: "local",
    title: "Support communities",
    body: "Patriotic tourism that prioritises Ugandan operators, artisans, and homestays.",
  },
  {
    id: "connect",
    title: "Connect mobility",
    body: "Link trips with UGo Ride and Tugende partners for movement between venues.",
  },
] as const;

export const TOURISM_PACKAGES: TourismPackage[] = [
  {
    id: "patriot-heritage-weekend",
    title: "Patriot heritage weekend",
    region: "Central",
    duration: "2 days",
    status: "open",
    statusLabel: "Register interest",
    spots: 40,
    departLabel: "Dec 6, 2026",
    summary: "Kasubi Tombs, Ndere Centre, and a district baraza welcome in Kampala.",
  },
  {
    id: "pearl-nature-trail",
    title: "Pearl of Africa nature trail",
    region: "Western",
    duration: "5 days",
    status: "waitlist",
    statusLabel: "Waitlist open",
    spots: 60,
    summary: "Queen Elizabeth wildlife loop and crater lakes — Secretariat confirms dates.",
  },
  {
    id: "diaspora-homecoming",
    title: "Diaspora homecoming tour",
    region: "Multi-region",
    duration: "10 days",
    status: "planning",
    statusLabel: "Planning",
    spots: 80,
    summary: "Multi-region heritage trail for Ugandans abroad; express interest for 2026 cohort.",
  },
];

export const TOURISM_TRAVELLER_TYPES = [
  "Solo",
  "Couple",
  "Family",
  "Group (5+)",
  "Diaspora returnee",
] as const;

export const TOURISM_THEME_INTERESTS = [
  "Wildlife & parks",
  "Culture & heritage",
  "Adventure & nature",
  "City experiences",
  "Mixed itinerary",
] as const;

export const TOURISM_PACKAGE_FORM = {
  title: "Register for a PLU travel package",
  subtitle: "One submission per phone number per package. Secretariat confirms within 72 hours.",
  submitLabel: "Submit registration",
} as const;

export const TOURISM_ENQUIRY_FORM = {
  title: "Custom trip enquiry",
  subtitle: "Tell us your dates and themes — partners will propose a safe, patriotic itinerary.",
  submitLabel: "Send enquiry",
} as const;