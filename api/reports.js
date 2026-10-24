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

  const { category, details, contact, telegramId } = body;
  if (!details?.trim() || details.trim().length < 20) {
    return Response.json({ error: "details must be at least 20 characters" }, { status: 400 });
  }

  const reference = `PLU-AC-${Math.floor(1000 + Math.random() * 9000)}`;
  const doc = {
    reference,
    category: category || "other",
    details: details.trim(),
    contact: contact?.trim() || null,
    telegramId: telegramId ?? null,
    status: "In review",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDb();
  await db.collection("integrity_reports").insertOne(doc);

  return Response.json({ ok: true, reference, status: doc.status });
}
