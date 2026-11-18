import { getDb } from "./mongodb.js";

export async function saveBubuRequest(body) {
  const { kind, fullName, phone, district } = body;
  if (!kind || !fullName?.trim() || !phone?.trim() || !district?.trim()) {
    return Response.json({ error: "kind, fullName, phone and district are required" }, { status: 400 });
  }
  if (kind !== "introduction" && kind !== "listing") {
    return Response.json({ error: "kind must be introduction or listing" }, { status: 400 });
  }

  const reference = body.reference?.trim() || `BUBU-${Math.floor(10000 + Math.random() * 90000)}`;
  const doc = {
    reference,
    kind,
    fullName: fullName.trim(),
    phone: phone.trim(),
    district: district.trim(),
    message: body.message?.trim() || null,
    registeredAt: new Date(),
    telegramId: body.telegramId ?? null,
    telegramUsername: body.telegramUsername ?? null,
    ...(kind === "introduction"
      ? {
          businessId: body.businessId?.trim() || null,
          businessName: body.businessName?.trim() || null,
          businessDistrict: body.businessDistrict?.trim() || null,
          products: body.products?.trim() || null,
        }
      : {
          businessName: body.businessName?.trim() || null,
          productOrService: body.productOrService?.trim() || null,
        }),
  };

  const db = await getDb();
  await db.collection("bubu_requests").insertOne(doc);

  return Response.json({
    ok: true,
    reference: doc.reference,
    registeredAt: doc.registeredAt.toISOString(),
  });
}