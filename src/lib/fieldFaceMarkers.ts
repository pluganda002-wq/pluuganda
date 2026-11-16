export type FaceMarker = { xPct: number; yPct: number; sizePct: number };

/** Demo markers tuned for default parish mobilization group photo. */
const PARISH_DEMO: FaceMarker[] = [
  { xPct: 27, yPct: 30, sizePct: 12 },
  { xPct: 41, yPct: 28, sizePct: 11 },
  { xPct: 18, yPct: 58, sizePct: 10 },
  { xPct: 32, yPct: 62, sizePct: 9 },
  { xPct: 48, yPct: 60, sizePct: 10 },
  { xPct: 62, yPct: 57, sizePct: 9 },
];

const HANDBOOKS_DEMO: FaceMarker[] = [
  { xPct: 22, yPct: 42, sizePct: 11 },
  { xPct: 38, yPct: 38, sizePct: 10 },
  { xPct: 55, yPct: 40, sizePct: 11 },
  { xPct: 70, yPct: 44, sizePct: 9 },
];

const CLEANUP_DEMO: FaceMarker[] = [
  { xPct: 20, yPct: 35, sizePct: 12 },
  { xPct: 35, yPct: 32, sizePct: 11 },
  { xPct: 50, yPct: 34, sizePct: 11 },
  { xPct: 65, yPct: 36, sizePct: 10 },
  { xPct: 78, yPct: 38, sizePct: 9 },
];

const DEMO_BY_TASK: Record<string, FaceMarker[]> = {
  "field-parish": PARISH_DEMO,
  "field-handbooks": HANDBOOKS_DEMO,
  "field-cleanup": CLEANUP_DEMO,
};

/** Simulated Face AI markers for user uploads (group photos, upper/mid frame). */
export function markersForUserPhoto(width: number, height: number): FaceMarker[] {
  const buckets = 4 + ((width + height) % 4);
  const count = Math.min(8, Math.max(3, buckets));
  const markers: FaceMarker[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const xPct = 14 + t * 72 + ((i * 17) % 9) - 4;
    const yPct = 26 + (i % 3) * 11 + ((width + i * 13) % 8);
    const sizePct = 9 + (i % 3);
    markers.push({
      xPct: Math.min(86, Math.max(12, xPct)),
      yPct: Math.min(72, Math.max(22, yPct)),
      sizePct,
    });
  }
  return markers;
}

export function markersForPhoto(taskId: string, userProvided: boolean, width: number, height: number): FaceMarker[] {
  if (!userProvided && DEMO_BY_TASK[taskId]) return DEMO_BY_TASK[taskId];
  if (!userProvided) return PARISH_DEMO;
  return markersForUserPhoto(width, height);
}