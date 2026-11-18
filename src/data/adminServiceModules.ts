import type { ServiceModuleId } from "@/types/serviceContent";

export type AdminSectionId =
  | "regions"
  | "packages"
  | "pillars"
  | "forums"
  | "featured"
  | "drives"
  | "programs"
  | "listings"
  | "categories"
  | "businesses"
  | "rankings"
  | "recognitions";

export type AdminModuleConfig = {
  id: ServiceModuleId;
  label: string;
  sections: { id: AdminSectionId; label: string }[];
};

export const SERVICE_ADMIN_MODULES: AdminModuleConfig[] = [
  {
    id: "tourism",
    label: "Tourism",
    sections: [
      { id: "regions", label: "Explore themes" },
      { id: "packages", label: "Travel packages" },
      { id: "pillars", label: "Pillars" },
    ],
  },
  {
    id: "youth",
    label: "Youth",
    sections: [
      { id: "forums", label: "Forum events" },
      { id: "pillars", label: "Pillars" },
    ],
  },
  {
    id: "buy-uganda",
    label: "Buy Uganda",
    sections: [
      { id: "categories", label: "Shop categories" },
      { id: "businesses", label: "Business directory" },
      { id: "featured", label: "Featured suppliers" },
      { id: "pillars", label: "Pillars" },
    ],
  },
  {
    id: "charity",
    label: "Charity",
    sections: [{ id: "drives", label: "Drives" }],
  },
  { id: "csr", label: "CSR", sections: [{ id: "listings", label: "Listings" }] },
  { id: "education", label: "Education", sections: [{ id: "listings", label: "Listings" }] },
  {
    id: "tv",
    label: "PLU TV",
    sections: [
      { id: "programs", label: "Video programs (use API / Mongo)" },
      { id: "listings", label: "Listings" },
    ],
  },
  { id: "mobility", label: "Mobility", sections: [{ id: "listings", label: "Listings" }] },
  {
    id: "leadership",
    label: "Rankings & recognition",
    sections: [
      { id: "rankings", label: "Leaderboard" },
      { id: "recognitions", label: "Awards" },
      { id: "pillars", label: "How points work" },
      { id: "listings", label: "Listings (legacy)" },
    ],
  },
  { id: "projects", label: "Projects", sections: [{ id: "listings", label: "Listings" }] },
];