import { isDbConfigured } from "./lib/mongodb.js";

export async function GET() {
  return Response.json({
    ok: true,
    service: "plu-bot",
    database: isDbConfigured() ? "configured" : "missing_mongodb_uri",
  });
}
