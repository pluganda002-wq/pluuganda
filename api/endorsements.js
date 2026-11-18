import { randomBytes } from "node:crypto";
import { getDb, isDbConfigured } from "./lib/mongodb.js";

function createEndorsementReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = randomBytes(3).toString("hex").toUpperCase();
  return `END-${stamp}-${salt}`;
}

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

  if (body.action === "check") {
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

  const firstName = body.firstName?.trim();
  const surname = body.surname?.trim();
  const nationalId = normalizeNationalId(body.nationalId);
  const ageGroup = body.ageGroup?.trim();
  const district = body.district?.trim();
  const consent = Boolean(body.consent);

  if (!firstName || !surname || !nationalId || !ageGroup || !district) {
    return Response.json({ error: "Missing required endorsement fields" }, { status: 400 });
  }
  if (!consent) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }
  if (nationalId.length < 8) {
    return Response.json({ error: "Invalid national ID" }, { status: 400 });
  }

  const db = await getDb();

  const existing = await db.collection("endorsements").findOne({ nationalId });
  if (existing) {
    return Response.json({ error: "duplicate_entry" }, { status: 409 });
  }

  const message = body.message?.trim() || null;
  const reference = createEndorsementReference();
  const doc = {
    reference,
    firstName,
    surname,
    fullName: `${firstName} ${surname}`.trim(),
    gender: body.gender?.trim() || null,
    nationalId,
    ageGroup,
    district,
    subCounty: body.subCounty?.trim() || null,
    parish: body.parish?.trim() || null,
    village: body.village?.trim() || null,
    message,
    publishMessagePublic: Boolean(body.publishMessagePublic) && Boolean(message),
    consent,
    telegramId: body.telegramId ?? null,
    telegramUsername: body.telegramUsername ?? null,
    createdAt: new Date(),
    status: "pending_review",
    source: "plu-bot",
  };

  await db.collection("endorsements").insertOne(doc);

  return Response.json({ ok: true, status: doc.status, reference });
}