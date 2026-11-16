import { CASE_TRACKER } from "@/data/plu";
import { ACCOUNTABILITY_STATS } from "@/data/accountability";

export const ACCOUNTABILITY_DASHBOARD = {
  title: "Active audit desk",
} as const;

export const CIVIC_WATCH_FORM_TITLE = "Civic accountability and corruption watch" as const;

export const WHISTLEBLOWER_DISCLAIMER_SHORT =
  "Your identity (if provided) will be protected according to applicable whistleblower protection laws." as const;

export const WHISTLEBLOWER_DISCLAIMER_FULL = [
  "You may submit this form anonymously.",
  "Provide as much accurate detail as possible. False or malicious reports may have legal consequences.",
  WHISTLEBLOWER_DISCLAIMER_SHORT,
  "Do not use this form for general tax questions or complaints about service.",
  "Some whistle-blowing tasks are paid once successful.",
] as const;

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