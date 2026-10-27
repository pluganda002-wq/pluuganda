import { getDb, isDbConfigured } from "./lib/mongodb.js";

export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({
      ok: true,
      service: "plu-bot",
      database: "missing_mongodb_uri",
      databasePing: false,
    });
  }

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const dbName = process.env.MONGODB_DB_NAME || "plu_bot";
    const tugendeUsers = await db.collection("tugende_users").estimatedDocumentCount();
    return Response.json({
      ok: true,
      service: "plu-bot",
      database: dbName,
      databasePing: true,
      tugendeUsers,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        service: "plu-bot",
        database: process.env.MONGODB_DB_NAME || "plu_bot",
        databasePing: false,
        error: err instanceof Error ? err.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
