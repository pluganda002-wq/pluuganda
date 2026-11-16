export type DutyKind = "field" | "digital" | "advanced";

export type DutyTab = "all" | DutyKind;

export const DUTY_VERIFICATION_DESK_TITLE = "Duty verification desk" as const;

export type DutyTask = {
  id: string;
  kind: DutyKind;
  title: string;
  subtitle?: string;
  points: number;
  cta: string;
  /** Advanced: only this Telegram user may open the duty */
  assigneeTelegramId?: number;
  assigneeLabel?: string;
  /** Digital: external or in-app action */
  actionTo?: string;
};

export const DUTY_TASKS: DutyTask[] = [
  {
    id: "dig-like",
    kind: "digital",
    title: "Like official PLU update",
    subtitle: "Social feed endorsement",
    points: 15,
    cta: "Like",
    actionTo: "/social",
  },
  {
    id: "dig-subscribe",
    kind: "digital",
    title: "Subscribe to PLU TV",
    subtitle: "Stay on civic broadcasts",
    points: 25,
    cta: "Subscribe",
    actionTo: "/tv",
  },
  {
    id: "dig-share",
    kind: "digital",
    title: "Share integrity tracker update",
    subtitle: "Forward to 5 patriots",
    points: 40,
    cta: "Share",
  },
  {
    id: "dig-channel",
    kind: "digital",
    title: "Join PLU Telegram channel",
    subtitle: "Digital mobilisation",
    points: 20,
    cta: "Join",
  },
  {
    id: "dig-module",
    kind: "digital",
    title: "Complete integrity module",
    subtitle: "Civic education",
    points: 80,
    cta: "Start",
    actionTo: "/education",
  },
  {
    id: "adv-audit",
    kind: "advanced",
    title: "District procurement witness log",
    subtitle: "Coordinator assignment",
    points: 200,
    cta: "Open",
    assigneeTelegramId: undefined,
    assigneeLabel: "District coordinator (assigned)",
  },
  {
    id: "adv-undercover",
    kind: "advanced",
    title: "Targeted bribery stake-out",
    subtitle: "Integrity desk only",
    points: 350,
    cta: "Locked",
    assigneeLabel: "Field agent · classified",
  },
];

export const DUTY_TABS: { id: DutyTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "field", label: "Field mobilisation" },
  { id: "digital", label: "Digital" },
  { id: "advanced", label: "Advanced" },
];