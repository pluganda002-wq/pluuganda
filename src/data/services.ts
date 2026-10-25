export type ServiceCategory =
  | "all"
  | "membership"
  | "integrity"
  | "economy"
  | "media"
  | "leadership";

export type ServiceItem = {
  id: string;
  to: string;
  title: string;
  subtitle: string;
  category: ServiceCategory;
  accent?: "gold" | "red" | "green" | "blue";
  iconKey: string;
};

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "membership", label: "Membership" },
  { id: "integrity", label: "Integrity" },
  { id: "economy", label: "Economy" },
  { id: "media", label: "Media" },
  { id: "leadership", label: "Leadership" },
];

export const SERVICE_ITEMS: ServiceItem[] = [
  {
    id: "membership",
    to: "/membership",
    title: "Registration",
    subtitle: "Join & verify",
    category: "membership",
    accent: "gold",
    iconKey: "user",
  },
  {
    id: "endorse",
    to: "/endorse",
    title: "Endorsement",
    subtitle: "Campaign voice",
    category: "membership",
    accent: "gold",
    iconKey: "vote",
  },
  {
    id: "integrity",
    to: "/integrity",
    title: "Integrity",
    subtitle: "Report & track",
    category: "integrity",
    accent: "red",
    iconKey: "shield",
  },
  {
    id: "youth",
    to: "/youth",
    title: "Youth",
    subtitle: "Leagues & forums",
    category: "membership",
    accent: "green",
    iconKey: "users",
  },
  {
    id: "tourism",
    to: "/tourism",
    title: "Tourism",
    subtitle: "Pearl of Africa",
    category: "economy",
    accent: "green",
    iconKey: "map",
  },
  {
    id: "buy-uganda",
    to: "/buy-uganda",
    title: "Buy Uganda",
    subtitle: "Build Uganda",
    category: "economy",
    accent: "gold",
    iconKey: "shop",
  },
  {
    id: "charity",
    to: "/charity",
    title: "Charity",
    subtitle: "Community care",
    category: "economy",
    accent: "red",
    iconKey: "heart",
  },
  {
    id: "csr",
    to: "/csr",
    title: "CSR",
    subtitle: "Partnerships",
    category: "economy",
    accent: "blue",
    iconKey: "briefcase",
  },
  {
    id: "tv",
    to: "/tv",
    title: "PLU TV",
    subtitle: "Broadcasts",
    category: "media",
    accent: "gold",
    iconKey: "tv",
  },
  {
    id: "mobility",
    to: "/mobility",
    title: "Mobility",
    subtitle: "UGo & Tugende",
    category: "media",
    accent: "blue",
    iconKey: "car",
  },
  {
    id: "education",
    to: "/education",
    title: "Education",
    subtitle: "Civic learning",
    category: "media",
    accent: "green",
    iconKey: "grad",
  },
  {
    id: "projects",
    to: "/projects",
    title: "Projects",
    subtitle: "Citizen reviews",
    category: "leadership",
    accent: "green",
    iconKey: "clipboard",
  },
  {
    id: "tasks",
    to: "/tasks",
    title: "Tasks",
    subtitle: "Missions",
    category: "leadership",
    accent: "gold",
    iconKey: "tasks",
  },
  {
    id: "leadership",
    to: "/leadership",
    title: "Rankings",
    subtitle: "Recognition",
    category: "leadership",
    accent: "gold",
    iconKey: "trophy",
  },
];

/** Icon resolver lives in ServicesPage to avoid circular deps with lucide */
