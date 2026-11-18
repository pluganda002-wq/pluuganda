const STORAGE_KEY = "plu-youth-registrations-v1";

export type YouthRegistrationBase = {
  id: string;
  reference: string;
  kind: "league" | "forum";
  fullName: string;
  phone: string;
  district: string;
  createdAt: string;
};

export type YouthLeagueRegistration = YouthRegistrationBase & {
  kind: "league";
  chapterId: string;
  chapterTitle: string;
  ageGroup: string;
  institution?: string;
};

export type YouthForumRegistration = YouthRegistrationBase & {
  kind: "forum";
  eventId: string;
  eventTitle: string;
  eventDate: string;
  role: string;
  notes?: string;
};

export type YouthRegistration = YouthLeagueRegistration | YouthForumRegistration;

function newId() {
  return `yr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createYouthReference(): string {
  return `YTH-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function loadYouthRegistrations(): YouthRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as YouthRegistration[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveYouthRegistration(entry: YouthRegistration) {
  const list = loadYouthRegistrations().filter((r) => r.id !== entry.id);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)));
}

export function buildLeagueRegistration(
  data: Omit<YouthLeagueRegistration, "id" | "reference" | "createdAt" | "kind">
): YouthLeagueRegistration {
  return {
    kind: "league",
    id: newId(),
    reference: createYouthReference(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

export function buildForumRegistration(
  data: Omit<YouthForumRegistration, "id" | "reference" | "createdAt" | "kind">
): YouthForumRegistration {
  return {
    kind: "forum",
    id: newId(),
    reference: createYouthReference(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

export function countForumRegistrations(eventId: string): number {
  return loadYouthRegistrations().filter((r) => r.kind === "forum" && r.eventId === eventId).length;
}

export function isRegisteredForForum(eventId: string, phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return loadYouthRegistrations().some(
    (r) =>
      r.kind === "forum" &&
      r.eventId === eventId &&
      r.phone.replace(/\D/g, "") === normalized
  );
}

export function isRegisteredForLeague(chapterId: string, phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return loadYouthRegistrations().some(
    (r) =>
      r.kind === "league" &&
      r.chapterId === chapterId &&
      r.phone.replace(/\D/g, "") === normalized
  );
}