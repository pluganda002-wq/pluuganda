const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiHealth(): Promise<{ ok: boolean; database: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export type RegisterMemberPayload = {
  fullName: string;
  phone: string;
  district: string;
  telegramId?: number;
  telegramUsername?: string;
};

export async function registerMemberApi(payload: RegisterMemberPayload) {
  return postJson<{ memberId: string; verified: boolean; registeredAt: string }>(
    "/api/members",
    payload
  );
}

export async function submitEndorsementApi(payload: {
  message: string;
  district?: string;
  telegramId?: number;
  telegramUsername?: string;
}) {
  return postJson<{ ok: boolean; status: string }>("/api/endorsements", payload);
}

export async function submitReportApi(payload: {
  category: string;
  details: string;
  contact?: string;
  telegramId?: number;
}) {
  return postJson<{ ok: boolean; reference: string; status: string }>("/api/reports", payload);
}

export function isApiUnavailableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes("Database not configured") ||
    err.message.includes("503") ||
    err.message.includes("Failed to fetch")
  );
}
