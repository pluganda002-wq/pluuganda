import type { LucideIcon } from "lucide-react";
import { BarChart3, Camera, Megaphone, RefreshCw } from "lucide-react";

export type AccountabilityAction = {
  id: string;
  label: string;
  meta?: string;
  to: string;
  icon: LucideIcon;
  accent?: "gold" | "red" | "green" | "neutral";
};

export const ACCOUNTABILITY_DASHBOARD = {
  title: "Accountability",
  tag: "Anti-corruption programme",
} as const;

export const TRACKER_DASHBOARD = {
  title: "National projects & corruption tracker",
  path: "/integrity",
} as const;

export const ACCOUNTABILITY_ACTIONS: AccountabilityAction[] = [
  {
    id: "report",
    label: "Whistleblower report",
    meta: "Voice or text",
    to: "/integrity/report",
    icon: Megaphone,
    accent: "red",
  },
  {
    id: "proof",
    label: "Submit field proof",
    meta: "+30 pts",
    to: "/integrity",
    icon: Camera,
    accent: "gold",
  },
  {
    id: "cases",
    label: "Open cases",
    meta: "Live status",
    to: "/integrity",
    icon: BarChart3,
    accent: "green",
  },
  {
    id: "sync",
    label: "Sync vault",
    meta: "Queue",
    to: "/programmes",
    icon: RefreshCw,
    accent: "neutral",
  },
];
