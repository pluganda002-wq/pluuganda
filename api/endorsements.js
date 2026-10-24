import { getDb, isDbConfigured } from "./lib/mongodb.js";

export async function POST(request) {
  if (!isDbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, district, telegramId, telegramUsername } = body;
  if (!message?.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const doc = {
    message: message.trim(),
    district: district?.trim() || null,
    telegramId: telegramId ?? null,
    telegramUsername: telegramUsername ?? null,
    createdAt: new Date(),
    status: "pending_review",
  };

  const db = await getDb();
  await db.collection("endorsements").insertOne(doc);

  return Response.json({ ok: true, status: doc.status });
}
