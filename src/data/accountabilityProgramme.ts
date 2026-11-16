import { CASE_TRACKER } from "@/data/plu";
import { ACCOUNTABILITY_STATS } from "@/data/accountability";

export const ACCOUNTABILITY_DASHBOARD = {
  title: "Accountability",
} as const;

export const ACCOUNTABILITY_DASHBOARD_METRICS = [
  {
    id: "projects",
    value: ACCOUNTABILITY_STATS.projectsTracked,
    label: "Projects",
    to: "/integrity",
    tone: "gold" as const,
  },
  {
    id: "red-flags",
    value: ACCOUNTABILITY_STATS.redFlags,
    label: "Red flags",
    to: "/integrity?filter=red-flag",
    tone: "red" as const,
  },
  {
    id: "open-cases",
    value: CASE_TRACKER.length,
    label: "Open cases",
    to: "/integrity?focus=cases",
    tone: "amber" as const,
  },
  {
    id: "reports",
    value: ACCOUNTABILITY_STATS.reportsLogged,
    label: "Reports",
    to: "/integrity?focus=reports",
    tone: "green" as const,
  },
] as const;