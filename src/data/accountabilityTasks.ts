export type TaskChannel = "physical" | "digital";

export type AccountabilityTask = {
  id: string;
  channel: TaskChannel;
  title: string;
  points: number;
  cta: string;
  actionTo?: string;
};

export const ACCOUNTABILITY_TASKS: AccountabilityTask[] = [
  {
    id: "acc-p1",
    channel: "physical",
    title: "Submit field proof",
    points: 30,
    cta: "Upload",
    actionTo: "/integrity",
  },
  {
    id: "acc-p2",
    channel: "physical",
    title: "Site visit & geotagged photos",
    points: 120,
    cta: "Start",
    actionTo: "/integrity",
  },
  { id: "acc-p3", channel: "physical", title: "Parish accountability baraza", points: 80, cta: "Check in" },
  { id: "acc-d1", channel: "digital", title: "Share tracker update", points: 40, cta: "Share" },
  { id: "acc-d2", channel: "digital", title: "Civic integrity module", points: 80, cta: "Learn", actionTo: "/education" },
];