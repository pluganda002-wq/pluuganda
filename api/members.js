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

  const {
    fullName,
    phone,
    district,
    telegramId,
    telegramUsername,
    firstName,
    surname,
    gender,
    nationalId,
    ageGroup,
    subCounty,
    parish,
    village,
    membershipRole,
    interests,
    consent,
  } = body;
  if (!fullName?.trim() || !phone?.trim() || !district?.trim()) {
    return Response.json({ error: "fullName, phone and district are required" }, { status: 400 });
  }

  const memberId = `PLU-${Math.floor(100000 + Math.random() * 900000)}`;
  const doc = {
    memberId,
    fullName: fullName.trim(),
    phone: phone.trim(),
    district: district.trim(),
    firstName: firstName?.trim() || null,
    surname: surname?.trim() || null,
    gender: gender?.trim() || null,
    nationalId: nationalId?.trim() || null,
    ageGroup: ageGroup?.trim() || null,
    subCounty: subCounty?.trim() || null,
    parish: parish?.trim() || null,
    village: village?.trim() || null,
    membershipRole: membershipRole?.trim() || null,
    interests: Array.isArray(interests) ? interests.filter((x) => typeof x === "string") : [],
    consent: Boolean(consent),
    telegramId: telegramId ?? null,
    telegramUsername: telegramUsername ?? null,
    verified: false,
    registeredAt: new Date(),
  };

  const db = await getDb();
  await db.collection("members").insertOne(doc);

  return Response.json({
    memberId: doc.memberId,
    verified: doc.verified,
    registeredAt: doc.registeredAt.toISOString(),
  });
}
