import { FIELD_EVIDENCE_PHOTOS, type DutyTask } from "@/data/dutyVerification";

export type FieldGeo = {
  lat: string;
  lng: string;
  placeLine: string;
  wardLabel: string;
  altitude: string;
  accuracy: string;
  faceAiDefault: string;
  capturedAt: string;
};

const FIELD_GEO: Record<string, FieldGeo> = {
  "field-parish": {
    lat: "0.3956° N",
    lng: "32.6391° E",
    placeLine: "Kira Parish Ward • Wakiso",
    wardLabel: "Kira Ward",
    altitude: "1,180m",
    accuracy: "14m",
    faceAiDefault: "6 Patriots Dete…",
    capturedAt: "24-Oct-2024 • 10:42:18 EAT",
  },
  "field-handbooks": {
    lat: "0.3476° N",
    lng: "32.5825° E",
    placeLine: "Local youth centre • Kampala",
    wardLabel: "Youth hub zone",
    altitude: "1,210m",
    accuracy: "18m",
    faceAiDefault: "Handbooks ready",
    capturedAt: "Pending capture",
  },
  "field-cleanup": {
    lat: "0.3136° N",
    lng: "32.6342° E",
    placeLine: "Jinja Road drainage • Kampala",
    wardLabel: "Corridor team",
    altitude: "1,145m",
    accuracy: "22m",
    faceAiDefault: "Site scan idle",
    capturedAt: "Pending capture",
  },
};

const DEFAULT_GEO: FieldGeo = {
  lat: "0.3476° N",
  lng: "32.5825° E",
  placeLine: "Field zone • Uganda",
  wardLabel: "Assigned ward",
  altitude: "—",
  accuracy: "—",
  faceAiDefault: "Awaiting capture",
  capturedAt: "Pending capture",
};

const FALLBACK_BY_ICON: Partial<Record<NonNullable<DutyTask["iconKey"]>, string>> = {
  field: FIELD_EVIDENCE_PHOTOS["field-parish"],
  book: FIELD_EVIDENCE_PHOTOS["field-handbooks"],
  cleanup: FIELD_EVIDENCE_PHOTOS["field-cleanup"],
};

export function evidencePhotoFor(task: DutyTask): string {
  if (task.evidencePhoto) return task.evidencePhoto;
  if (FIELD_EVIDENCE_PHOTOS[task.id]) return FIELD_EVIDENCE_PHOTOS[task.id];
  if (task.iconKey && FALLBACK_BY_ICON[task.iconKey]) return FALLBACK_BY_ICON[task.iconKey]!;
  return FIELD_EVIDENCE_PHOTOS["field-parish"];
}

export function geoForTask(task: DutyTask): FieldGeo {
  const base = FIELD_GEO[task.id] ?? DEFAULT_GEO;
  if (task.location && !FIELD_GEO[task.id]) {
    return { ...base, placeLine: task.location };
  }
  return base;
}

export function coordsLine(geo: FieldGeo): string {
  return `${geo.lat}, ${geo.lng}`;
}

export function liveCoordsLabel(lat: number, lng: number): string {
  const latHem = lat >= 0 ? "N" : "S";
  const lngHem = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latHem}, ${Math.abs(lng).toFixed(4)}° ${lngHem}`;
}