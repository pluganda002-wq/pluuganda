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

  const { kind, fullName, phone, district } = body;
  if (!kind || !fullName?.trim() || !phone?.trim() || !district?.trim()) {
    return Response.json({ error: "kind, fullName, phone and district are required" }, { status: 400 });
  }
  if (kind !== "package" && kind !== "enquiry") {
    return Response.json({ error: "kind must be package or enquiry" }, { status: 400 });
  }

  const reference = body.reference?.trim() || `TRV-${Math.floor(10000 + Math.random() * 90000)}`;
  const travellers = Number(body.travellers);
  const doc = {
    reference,
    kind,
    fullName: fullName.trim(),
    phone: phone.trim(),
    district: district.trim(),
    travellers: Number.isFinite(travellers) && travellers > 0 ? travellers : 1,
    registeredAt: new Date(),
    telegramId: body.telegramId ?? null,
    telegramUsername: body.telegramUsername ?? null,
    ...(kind === "package"
      ? {
          packageId: body.packageId?.trim() || null,
          packageTitle: body.packageTitle?.trim() || null,
          departLabel: body.departLabel?.trim() || null,
          notes: body.notes?.trim() || null,
        }
      : {
          theme: body.theme?.trim() || null,
          travellerType: body.travellerType?.trim() || null,
          preferredDates: body.preferredDates?.trim() || null,
          notes: body.notes?.trim() || null,
        }),
  };

  const db = await getDb();
  await db.collection("tourism_bookings").insertOne(doc);

  return Response.json({
    ok: true,
    reference: doc.reference,
    registeredAt: doc.registeredAt.toISOString(),
  });
}