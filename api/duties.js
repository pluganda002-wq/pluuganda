import { getDb, isDbConfigured } from "./lib/mongodb.js";

const CONFIG_ID = "main";

function adminOk(password) {
  const manage = process.env.ADMIN_ITEM_PASSWORD_MANAGE_TASKS;
  const admin = process.env.ADMIN_PASSWORD;
  if (!password || typeof password !== "string") return false;
  if (manage && password === manage) return true;
  if (admin && password === admin) return true;
  return false;
}

function sanitizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = raw.kind;
  if (kind !== "field" && kind !== "digital" && kind !== "advanced" && kind !== "classified") return null;
  if (typeof raw.id !== "string" || !raw.id.trim()) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  const points = Number(raw.points);
  if (!Number.isFinite(points) || points < 0) return null;

  const task = {
    id: raw.id.trim(),
    kind,
    title: raw.title.trim(),
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle.trim() : undefined,
    points: Math.round(points),
    cta: typeof raw.cta === "string" && raw.cta.trim() ? raw.cta.trim() : "Open",
    actionTo: typeof raw.actionTo === "string" && raw.actionTo.trim() ? raw.actionTo.trim() : undefined,
    instructions: typeof raw.instructions === "string" ? raw.instructions.trim() : undefined,
    externalUrl: typeof raw.externalUrl === "string" && raw.externalUrl.trim() ? raw.externalUrl.trim() : undefined,
    assigneeLabel: typeof raw.assigneeLabel === "string" ? raw.assigneeLabel.trim() : undefined,
    categoryLabel: typeof raw.categoryLabel === "string" ? raw.categoryLabel.trim() : undefined,
    location: typeof raw.location === "string" ? raw.location.trim() : undefined,
    description: typeof raw.description === "string" ? raw.description.trim() : undefined,
    iconKey: typeof raw.iconKey === "string" ? raw.iconKey.trim() : undefined,
  };

  if (raw.assigneeTelegramId === null || raw.assigneeTelegramId === undefined || raw.assigneeTelegramId === "") {
    task.assigneeTelegramId = undefined;
  } else {
    const id = Number(raw.assigneeTelegramId);
    if (!Number.isFinite(id) || id <= 0) return null;
    task.assigneeTelegramId = Math.floor(id);
  }

  return task;
}

export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ tasks: null, source: "none" });
  }
  const db = await getDb();
  const doc = await db.collection("duty_config").findOne({ _id: CONFIG_ID });
  const tasks = Array.isArray(doc?.tasks) ? doc.tasks : null;
  return Response.json({ tasks, updatedAt: doc?.updatedAt ?? null, source: "database" });
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

  if (!Array.isArray(body.tasks)) {
    return Response.json({ error: "tasks array required" }, { status: 400 });
  }

  const tasks = body.tasks.map(sanitizeTask).filter(Boolean);
  if (tasks.length === 0) {
    return Response.json({ error: "No valid tasks" }, { status: 400 });
  }

  const updatedAt = new Date();
  const db = await getDb();
  await db.collection("duty_config").updateOne(
    { _id: CONFIG_ID },
  { $set: { tasks, updatedAt } },
    { upsert: true }
  );

  return Response.json({ ok: true, tasks, updatedAt: updatedAt.toISOString() });
}