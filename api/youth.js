import { getDb, isDbConfigured } from "../server/lib/mongodb.js";

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

  const { kind, fullName, phone, district } = body;
  if (!kind || !fullName?.trim() || !phone?.trim() || !district?.trim()) {
    return Response.json({ error: "kind, fullName, phone and district are required" }, { status: 400 });
  }
  if (kind !== "league" && kind !== "forum") {
    return Response.json({ error: "kind must be league or forum" }, { status: 400 });
  }

  const reference = body.reference?.trim() || `YTH-${Math.floor(10000 + Math.random() * 90000)}`;
  const doc = {
    reference,
    kind,
    fullName: fullName.trim(),
    phone: phone.trim(),
    district: district.trim(),
    registeredAt: new Date(),
    telegramId: body.telegramId ?? null,
    telegramUsername: body.telegramUsername ?? null,
    ...(kind === "league"
      ? {
          chapterId: body.chapterId?.trim() || null,
          chapterTitle: body.chapterTitle?.trim() || null,
          ageGroup: body.ageGroup?.trim() || null,
          institution: body.institution?.trim() || null,
        }
      : {
          eventId: body.eventId?.trim() || null,
          eventTitle: body.eventTitle?.trim() || null,
          eventDate: body.eventDate?.trim() || null,
          role: body.role?.trim() || null,
          notes: body.notes?.trim() || null,
        }),
  };

  const db = await getDb();
  await db.collection("youth_registrations").insertOne(doc);

  return Response.json({
    ok: true,
    reference: doc.reference,
    registeredAt: doc.registeredAt.toISOString(),
  });
}