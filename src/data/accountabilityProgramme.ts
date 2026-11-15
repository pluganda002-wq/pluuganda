export type QueuePriority = "high" | "civic" | "draft";

export type AccountabilityQueueItem = {
  id: string;
  priority: QueuePriority;
  priorityLabel: string;
  timeLabel: string;
  title: string;
  subtitle: string;
  region: string;
  coords: string;
  hash: string;
  sizeLabel: string;
  syncNote: string;
  footStatus: string;
  inspectTo: string;
  thumbVariant: "audit" | "report" | "proof";
};

export const ACCOUNTABILITY_PROGRAMME = {
  title: "Anti-corruption & accountability",
  summary:
    "Secure reporting, national project tracking, and field proof — one programme for integrity across all 146 districts.",
} as const;

export const ACCOUNTABILITY_QUEUE: AccountabilityQueueItem[] = [
  {
    id: "q1",
    priority: "high",
    priorityLabel: "High priority",
    timeLabel: "14:22 EAT",
    title: "National project field audit — Kampala corridor",
    subtitle: "3 red-flag metrics • Geotag verified",
    region: "Kampala metro",
    coords: "0.3476° N, 32.5825° E",
    hash: "SHA-256: f8a92d…21c2",
    sizeLabel: "12.4 MB",
    syncNote: "Signed local key",
    footStatus: "Queued for integrity desk",
    inspectTo: "/integrity",
    thumbVariant: "audit",
  },
  {
    id: "q2",
    priority: "civic",
    priorityLabel: "Whistleblower",
    timeLabel: "13:05 EAT",
    title: "Secure corruption report — voice or written",
    subtitle: "Optional voice recording • Encrypted in transit",
    region: "Any district",
    coords: "Parish-level optional",
    hash: "Report vault: sealed",
    sizeLabel: "≤ 3 MB audio",
    syncNote: "Awaiting uplink",
    footStatus: "Ready to submit",
    inspectTo: "/integrity/report",
    thumbVariant: "report",
  },
  {
    id: "q3",
    priority: "draft",
    priorityLabel: "Draft proof",
    timeLabel: "Yesterday",
    title: "Procurement red-flag evidence package",
    subtitle: "Photos / hashes • Coordinator signature",
    region: "Wakiso",
    coords: "0.4043° N, 32.4597° E",
    hash: "SHA-256: 2c90be…0b30",
    sizeLabel: "5.5 MB",
    syncNote: "Encrypted staging",
    footStatus: "Attach at tracker",
    inspectTo: "/integrity",
    thumbVariant: "proof",
  },
];