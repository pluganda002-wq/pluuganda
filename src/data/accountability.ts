export type ProjectFilter = "all" | "stalled" | "scrutiny" | "red-flag";

export const ACCOUNTABILITY_STATS = {
  projectsTracked: 3420,
  redFlags: 892,
  fundsReconciledUgx: 14.8e9,
  reportsLogged: 4820,
  testimonies: 48,
} as const;

export const ACCOUNTABILITY_FILTERS: { id: ProjectFilter; label: string; count?: number }[] = [
  { id: "all", label: "All Projects", count: 3400 },
  { id: "stalled", label: "Stalled / Ghost", count: 142 },
  { id: "scrutiny", label: "Under Scrutiny" },
  { id: "red-flag", label: "Red flag" },
];

export type TrackedProject = {
  id: string;
  name: string;
  district: string;
  metro?: string;
  contractor: string;
  budgetUgx: number;
  targetLabel: string;
  physicalPct: number;
  disbursedPct: number;
  status: ProjectFilter;
  overdueMonths?: number;
  fieldNote: string;
  evidence: { label: string; meta?: string }[];
  photoCount: number;
  videoCount: number;
};

export const TRACKED_PROJECTS: TrackedProject[] = [
  {
    id: "lubigi-drain",
    name: "Lubigi Channel Drainage Expansion & Culvert Works",
    district: "Kampala",
    metro: "Kampala Metro",
    contractor: "Crested Engineering Ltd",
    budgetUgx: 3.2e9,
    targetLabel: "June 2024",
    physicalPct: 35,
    disbursedPct: 90,
    status: "red-flag",
    overdueMonths: 4,
    fieldNote:
      "Field inspectors note machinery abandoned on site for 3 weeks. No contractor teams present at last 4 citizen audits.",
    evidence: [
      { label: "Stalled Diggers" },
      { label: "Cracked Culvert" },
      { label: "GeoTag", meta: "0°19'N" },
    ],
    photoCount: 18,
    videoCount: 4,
  },
  {
    id: "mbale-youth",
    name: "Mbale Youth Skills Centre — Phase 1",
    district: "Mbale",
    contractor: "Eastline Builders",
    budgetUgx: 1.8e9,
    targetLabel: "March 2025",
    physicalPct: 62,
    disbursedPct: 58,
    status: "scrutiny",
    fieldNote: "BOQ variance under review. Patrol mobiliser requested site re-measurement.",
    evidence: [{ label: "Site slab" }, { label: "Materials store" }],
    photoCount: 6,
    videoCount: 1,
  },
  {
    id: "jinja-market",
    name: "Jinja Central Market Sanitation Upgrade",
    district: "Jinja",
    contractor: "Nile Works JV",
    budgetUgx: 950e6,
    targetLabel: "August 2024",
    physicalPct: 12,
    disbursedPct: 72,
    status: "stalled",
    overdueMonths: 2,
    fieldNote: "Works halted after procurement query. Citizens report ghost attendance rolls.",
    evidence: [{ label: "Empty site" }, { label: "Invoice copy" }],
    photoCount: 9,
    videoCount: 2,
  },
];

export type FieldTestimony = {
  id: string;
  author: string;
  role: string;
  badge: string;
  ago: string;
  body: string;
  tags: string[];
  likes: number;
  replies: number;
  status?: string;
  statusVariant?: "flagged" | "audited";
};

export const FIELD_TESTIMONIES: FieldTestimony[] = [
  {
    id: "t1",
    author: "Kigozi S.",
    role: "Kawempe Parish Mobiliser",
    badge: "Verified Patriot",
    ago: "2h ago",
    body: "Retaining walls already crumbling. Cement mix clearly below spec on south embankment — citizen video attached.",
    tags: ["Video 0:45", "Geotagged", "Crack Depth 12cm"],
    likes: 142,
    replies: 18,
    status: "FLAGGED TO SECRETARIAT",
    statusVariant: "flagged",
  },
  {
    id: "t2",
    author: "Eng. Ronald M.",
    role: "Civil Tech Volunteer",
    badge: "Tech Inspector",
    ago: "5h ago",
    body: "Concrete pour logs show Class 25 specified; field samples test Class 15. BOQ line items 14–18 need audit.",
    tags: ["BOQ", "Lab sample ref"],
    likes: 95,
    replies: 7,
    status: "BOQ Audited",
    statusVariant: "audited",
  },
];

export function formatUgxBillions(n: number): string {
  if (n >= 1e9) return `UGX ${(n / 1e9).toFixed(1)} Billion`;
  if (n >= 1e6) return `UGX ${(n / 1e6).toFixed(0)} Million`;
  return `UGX ${n.toLocaleString()}`;
}

export function formatReconciled(n: number): string {
  if (n >= 1e9) return `UGX ${(n / 1e9).toFixed(1)}B`;
  return `UGX ${(n / 1e6).toFixed(0)}M`;
}