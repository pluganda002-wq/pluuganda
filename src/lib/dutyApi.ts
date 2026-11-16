import type { DutyTask } from "@/data/dutyVerification";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export async function fetchDutyTasksFromApi(): Promise<DutyTask[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/duties`);
    if (!res.ok) return null;
    const data = (await res.json()) as { tasks: DutyTask[] | null };
    if (!data.tasks?.length) return null;
    return data.tasks;
  } catch {
    return null;
  }
}

export async function saveDutyTasksToApi(tasks: DutyTask[], adminPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/duties`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPassword, tasks }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save duties");
  }
}