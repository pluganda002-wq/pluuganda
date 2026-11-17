import { getDb, isDbConfigured } from "../lib/mongodb.js";

function normalizeNationalId(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

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

  const nationalId = normalizeNationalId(body.nationalId);
  if (nationalId.length < 8) {
    return Response.json({ error: "Invalid national ID" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("endorsements").findOne({ nationalId });

  return Response.json({
    available: !existing,
    nationalId,
  });
}