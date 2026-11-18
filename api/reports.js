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

  const { category, details, contact, telegramId, audioRecording } = body;
  const hasAudio =
    audioRecording?.dataBase64 &&
    typeof audioRecording.durationSec === "number" &&
    audioRecording.durationSec >= 2;
  const detailsText = details?.trim() ?? "";
  if (!hasAudio && detailsText.length < 20) {
    return Response.json(
      { error: "Provide at least 20 characters of detail, or attach a voice recording." },
      { status: 400 }
    );
  }
  if (hasAudio && audioRecording.dataBase64.length > 3_000_000) {
    return Response.json({ error: "Voice recording too large" }, { status: 400 });
  }

  const reference = `PLU-AC-${Math.floor(1000 + Math.random() * 9000)}`;
  const doc = {
    reference,
    category: category || "other",
    details: detailsText || "(Voice report — see attached recording.)",
    contact: contact?.trim() || null,
    telegramId: telegramId ?? null,
    audioRecording: hasAudio
      ? {
          mimeType: audioRecording.mimeType || "audio/webm",
          durationSec: audioRecording.durationSec,
          dataBase64: audioRecording.dataBase64,
        }
      : null,
    status: "In review",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDb();
  await db.collection("integrity_reports").insertOne(doc);

  return Response.json({ ok: true, reference, status: doc.status });
}
