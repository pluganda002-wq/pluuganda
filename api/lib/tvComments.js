import { getDb, isDbConfigured } from "./mongodb.js";

const MAX_BODY = 2000;

export async function getTvCommentsResponse(programId) {
  if (!programId) {
    return Response.json({ error: "programId required" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return Response.json({ comments: [], source: "none" });
  }

  const db = await getDb();
  const comments = await db
    .collection("tv_program_comments")
    .find({ programId })
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();

  return Response.json({
    comments: comments.map((c) => ({
      id: String(c._id),
      authorName: c.authorName ?? null,
      body: c.body,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    })),
  });
}

export async function postTvCommentResponse(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const programId = body.programId?.trim();
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!programId) return Response.json({ error: "programId required" }, { status: 400 });
  if (!text) return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
  if (text.length > MAX_BODY) {
    return Response.json({ error: `Comment too long (max ${MAX_BODY})` }, { status: 400 });
  }

  const authorName =
    body.authorName?.trim() ||
    (body.telegramUsername ? `@${body.telegramUsername}` : null) ||
    "Patriot";

  const createdAt = new Date();
  const comment = {
    id: `tc-${Date.now().toString(36)}`,
    authorName,
    body: text,
    createdAt: createdAt.toISOString(),
  };

  if (!isDbConfigured()) {
    return Response.json({ comment, saved: "client-only" });
  }

  const db = await getDb();
  const program = await db.collection("tv_programs").findOne({ id: programId, isPublished: true });
  if (!program) {
    return Response.json({ error: "Program not found" }, { status: 404 });
  }

  const doc = {
    programId,
    authorName,
    body: text,
    telegramId: body.telegramId ?? null,
    telegramUsername: body.telegramUsername ?? null,
    createdAt,
  };
  const result = await db.collection("tv_program_comments").insertOne(doc);

  return Response.json({
    comment: {
      id: String(result.insertedId),
      authorName,
      body: text,
      createdAt: createdAt.toISOString(),
    },
  });
}