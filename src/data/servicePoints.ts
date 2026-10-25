export const PLU_RANK_TIERS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Patriot",
  "Champion",
] as const;

export type PluRankTier = (typeof PLU_RANK_TIERS)[number];

/** Points required to reach each tier index (0 = Iron). */
export const RANK_THRESHOLDS = [0, 120, 350, 750, 1500, 3000, 6000];

export type PointCategoryId = "patriot" | "verified" | "service";

export const POINT_CATEGORIES: {
  id: PointCategoryId;
  label: string;
  subtitle: string;
  tone: "silver" | "blue" | "gold";
}[] = [
  {
    id: "patriot",
    label: "Patriot shields",
    subtitle: "Learning, daily tasks & quick missions",
    tone: "silver",
  },
  {
    id: "verified",
    label: "Verified shields",
    subtitle: "Endorsements, membership & proof",
    tone: "blue",
  },
  {
    id: "service",
    label: "Service shields",
    subtitle: "Programmes, charity & long-term service",
    tone: "gold",
  },
];

export function rankFromPoints(total: number): { tier: PluRankTier; index: number; nextAt: number | null } {
  let index = 0;
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= RANK_THRESHOLDS[i]) {
      index = i;
      break;
    }
  }
  const nextAt = index < RANK_THRESHOLDS.length - 1 ? RANK_THRESHOLDS[index + 1] : null;
  return { tier: PLU_RANK_TIERS[index], index, nextAt };
}
