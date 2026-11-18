import { getDb, isDbConfigured } from "../server/lib/mongodb.js";

const CONFIG_ID = "main";

function adminOk(password) {
  const manage = process.env.ADMIN_ITEM_PASSWORD_MANAGE_TASKS;
  const admin = process.env.ADMIN_PASSWORD;
  if (!password || typeof password !== "string") return false;
  if (manage && password === manage) return true;
  if (admin && password === admin) return true;
  return false;
}

function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ content: null, source: "none" });
  }
  const db = await getDb();
  const doc = await db.collection("service_content").findOne({ _id: CONFIG_ID });
  const content = isObject(doc?.content) ? doc.content : null;
  return Response.json({ content, updatedAt: doc?.updatedAt ?? null, source: "database" });
}

export async function PUT(request) {
  if (!isDbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!adminOk(body.adminPassword)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObject(body.content)) {
    return Response.json({ error: "content object required" }, { status: 400 });
  }

  const updatedAt = new Date();
  const db = await getDb();
  await db.collection("service_content").updateOne(
    { _id: CONFIG_ID },
    { $set: { content: body.content, updatedAt } },
    { upsert: true }
  );

  return Response.json({ ok: true, updatedAt: updatedAt.toISOString() });
}