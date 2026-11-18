import type { ServiceContentData } from "@/types/serviceContent";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export async function fetchServiceContentFromApi(): Promise<ServiceContentData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/service-content`);
    if (!res.ok) return null;
    const data = (await res.json()) as { content: ServiceContentData | null };
    if (!data.content) return null;
    return data.content;
  } catch {
    return null;
  }
}

export async function saveServiceContentToApi(
  content: ServiceContentData,
  adminPassword: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/service-content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPassword, content }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(typeof text === "string" ? text : "Failed to save service content");
  }
}