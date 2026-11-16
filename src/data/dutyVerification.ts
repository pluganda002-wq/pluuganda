export type DutyKind = "digital" | "field" | "advanced" | "classified";

export type DutyTab = DutyKind;

export const DUTY_VERIFICATION_DESK_TITLE = "Duty Verification Desk" as const;

export type DutyIconKey =
  | "youtube"
  | "tiktok"
  | "facebook"
  | "zoom"
  | "whatsapp"
  | "x"
  | "social"
  | "tv"
  | "share"
  | "telegram"
  | "education"
  | "heart"
  | "field"
  | "book"
  | "cleanup"
  | "classified"
  | "link";

export type DutyTask = {
  id: string;
  kind: DutyKind;
  title: string;
  subtitle?: string;
  points: number;
  cta: string;
  categoryLabel?: string;
  location?: string;
  description?: string;
  iconKey?: DutyIconKey;
  /** Advanced & classified: only this Telegram user may open */
  assigneeTelegramId?: number;
  assigneeLabel?: string;
  actionTo?: string;
  instructions?: string;
  externalUrl?: string;
  /** Field mobilization viewport preview */
  evidencePhoto?: string;
};

/** Blurred sample backdrop for field proof sheet (single shared asset). */
export const FIELD_EVIDENCE_SAMPLE = "/branding/field-evidence-default.jpg" as const;

export const FIELD_EVIDENCE_PHOTOS: Record<string, string> = {
  "field-parish": FIELD_EVIDENCE_SAMPLE,
  "field-handbooks": FIELD_EVIDENCE_SAMPLE,
  "field-cleanup": FIELD_EVIDENCE_SAMPLE,
};

export const DUTY_TABS: { id: DutyTab; label: string }[] = [
  { id: "digital", label: "Digital" },
  { id: "field", label: "Field action" },
  { id: "advanced", label: "Advanced" },
  { id: "classified", label: "Classified" },
];

export const DEFAULT_DUTY_TASKS: DutyTask[] = [
  {
    id: "dig-like",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Like official PLU update",
    subtitle: "Social feed endorsement",
    points: 15,
    cta: "Like",
    iconKey: "facebook",
    actionTo: "/social",
  },
  {
    id: "dig-subscribe",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Subscribe to PLU TV",
    subtitle: "Official YouTube channel",
    points: 25,
    cta: "Subscribe",
    iconKey: "youtube",
    actionTo: "/tv",
  },
  {
    id: "dig-tiktok",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Follow PLU on TikTok",
    subtitle: "Like & share civic clips",
    points: 20,
    cta: "Follow",
    iconKey: "tiktok",
    actionTo: "/social",
  },
  {
    id: "dig-zoom",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Join civic Zoom briefing",
    subtitle: "Live patriot briefing",
    points: 50,
    cta: "Join",
    iconKey: "zoom",
    instructions: "Attend the scheduled Zoom and stay for the full briefing to earn points.",
  },
  {
    id: "dig-digest",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Share PLU Weekly Patriot Digest",
    subtitle: "Telegram & WhatsApp",
    description: "Share with local contacts to expand our verified reach.",
    points: 15,
    cta: "Share",
    iconKey: "whatsapp",
    actionTo: "/social",
  },
  {
    id: "dig-share",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Share integrity tracker update",
    subtitle: "Forward to 5 patriots",
    points: 40,
    cta: "Share",
    iconKey: "share",
    actionTo: "/integrity",
    instructions:
      "Open the projects dashboard, pick a live update, and share it with at least five patriots.",
  },
  {
    id: "dig-channel",
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: "Join PLU Telegram channel",
    subtitle: "Digital mobilisation",
    points: 20,
    cta: "Join",
    iconKey: "telegram",
    instructions: "Join the official PLU Telegram channel for mobilisation alerts.",
    externalUrl: "https://t.me/share/url?url=https%3A%2F%2Fpluuganda.vercel.app",
  },
  {
    id: "dig-module",
    kind: "digital",
    categoryLabel: "Civic literacy",
    title: "Complete integrity module",
    subtitle: "Civic education",
    points: 80,
    cta: "Start",
    iconKey: "education",
    actionTo: "/education",
  },
  {
    id: "field-parish",
    kind: "field",
    categoryLabel: "Field mobilization",
    title: "Host or attend parish mobilization meeting",
    location: "Wakiso District · Kira Parish Council",
    description:
      "Organise or attend a verified parish meeting of at least 20 patriots, review the recruitment charter, and capture a geolocated photo.",
    points: 50,
    cta: "Submit proof",
    iconKey: "field",
    evidencePhoto: FIELD_EVIDENCE_PHOTOS["field-parish"],
  },
  {
    id: "field-handbooks",
    kind: "field",
    categoryLabel: "Civic literacy",
    title: "Distribute civic literacy handbooks",
    location: "Local youth centre",
    description: "Deliver civic handbooks and the PISG guidance to a youth hub and log delivery.",
    points: 25,
    cta: "Submit proof",
    iconKey: "book",
    evidencePhoto: FIELD_EVIDENCE_PHOTOS["field-handbooks"],
  },
  {
    id: "field-cleanup",
    kind: "field",
    categoryLabel: "Community welfare",
    title: "Community clean-up along Jinja Road drainage",
    location: "Kampala Corridor Team",
    description: "Coordinate a verified drainage clean-up and upload photo evidence with GPS.",
    points: 40,
    cta: "Submit proof",
    iconKey: "cleanup",
    evidencePhoto: FIELD_EVIDENCE_PHOTOS["field-cleanup"],
  },
  {
    id: "adv-audit",
    kind: "advanced",
    categoryLabel: "Advanced",
    title: "District procurement witness log",
    subtitle: "Coordinator assignment",
    points: 200,
    cta: "Open",
    assigneeLabel: "District coordinator (assigned)",
  },
  {
    id: "adv-undercover",
    kind: "advanced",
    categoryLabel: "Advanced",
    title: "Targeted bribery stake-out",
    subtitle: "Integrity desk only",
    points: 350,
    cta: "Locked",
    assigneeLabel: "Field agent · assigned",
  },
  {
    id: "cls-report-account",
    kind: "classified",
    categoryLabel: "Classified",
    title: "Report this account",
    subtitle: "Integrity directive · assigned patriots only",
    description:
      "Document suspicious activity on the named account per secretariat briefing. Do not discuss outside your assignment.",
    points: 120,
    cta: "Open",
    assigneeLabel: "Assigned by admin",
    iconKey: "classified",
    actionTo: "/integrity/report",
  },
];