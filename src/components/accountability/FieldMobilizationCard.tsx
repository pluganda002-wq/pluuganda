import { Camera, Check, CheckCircle2, Crosshair, Images, RotateCcw, ScanFace } from "lucide-react";
import { FIELD_EVIDENCE_PHOTOS, type DutyTask } from "@/data/dutyVerification";
import "./FieldMobilizationCard.css";

const FALLBACK_BY_ICON: Partial<Record<NonNullable<DutyTask["iconKey"]>, string>> = {
  field: FIELD_EVIDENCE_PHOTOS["field-parish"],
  book: FIELD_EVIDENCE_PHOTOS["field-handbooks"],
  cleanup: FIELD_EVIDENCE_PHOTOS["field-cleanup"],
};

function evidencePhotoFor(task: DutyTask): string {
  if (task.evidencePhoto) return task.evidencePhoto;
  if (FIELD_EVIDENCE_PHOTOS[task.id]) return FIELD_EVIDENCE_PHOTOS[task.id];
  if (task.iconKey && FALLBACK_BY_ICON[task.iconKey]) return FALLBACK_BY_ICON[task.iconKey]!;
  return FIELD_EVIDENCE_PHOTOS["field-parish"];
}

type FieldGeo = {
  lat: string;
  lng: string;
  placeLine: string;
  wardLabel: string;
  altitude: string;
  accuracy: string;
  faceAi: string;
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
    faceAi: "6 Patriots Dete…",
    capturedAt: "24-Oct-2024 • 10:42:18 EAT",
  },
  "field-handbooks": {
    lat: "0.3476° N",
    lng: "32.5825° E",
    placeLine: "Local youth centre • Kampala",
    wardLabel: "Youth hub zone",
    altitude: "1,210m",
    accuracy: "18m",
    faceAi: "Handbooks ready",
    capturedAt: "Pending capture",
  },
  "field-cleanup": {
    lat: "0.3136° N",
    lng: "32.6342° E",
    placeLine: "Jinja Road drainage • Kampala",
    wardLabel: "Corridor team",
    altitude: "1,145m",
    accuracy: "22m",
    faceAi: "Site scan idle",
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
  faceAi: "Awaiting capture",
  capturedAt: "Pending capture",
};

function geoForTask(task: DutyTask): FieldGeo {
  const base = FIELD_GEO[task.id] ?? DEFAULT_GEO;
  if (task.location && !FIELD_GEO[task.id]) {
    return { ...base, placeLine: task.location };
  }
  return base;
}

type Props = {
  task: DutyTask;
  done: boolean;
  onSubmitProof: () => void;
  onCaptureAction: () => void;
};

export function FieldMobilizationCard({ task, done, onSubmitProof, onCaptureAction }: Props) {
  const geo = geoForTask(task);
  const coords = `${geo.lat}, ${geo.lng}`;
  const photoSrc = evidencePhotoFor(task);

  return (
    <li className="field-evidence-wrap">
      <article className={`field-evidence${done ? " field-evidence--done" : ""}`}>
        <header className="field-evidence__head">
          <span className="field-evidence__head-title">
            <Camera size={15} aria-hidden />
            Field Mobilization Evidence
          </span>
          <span className="field-evidence__head-meta">
            Live Camera Buffer · +{task.points} pts
          </span>
        </header>

        <div className="field-evidence__viewport">
          <img
            src={photoSrc}
            alt=""
            className="field-evidence__photo"
            loading="lazy"
          />
          <span className="field-evidence__live">
            <span className="field-evidence__live-dot" aria-hidden />
            LIVE CAM · GEOTAG ACTIVE
          </span>
          <div className="field-evidence__frame" aria-hidden />
          <div className="field-evidence__hud">
            <div className="field-evidence__hud-coords">{coords}</div>
            <div className="field-evidence__hud-place">{geo.placeLine}</div>
            <div className="field-evidence__hud-row">
              <span>{done ? "Verified · points credited" : geo.capturedAt}</span>
              <span>ALT {geo.altitude}</span>
            </div>
          </div>
        </div>

        <div className="field-evidence__toolbar" role="group" aria-label="Capture actions">
          <button
            type="button"
            className="field-evidence__tool field-evidence__tool--wide"
            disabled={done}
            onClick={onCaptureAction}
          >
            <ScanFace size={16} aria-hidden />
            <Check size={12} className="field-evidence__tool-check" aria-hidden />
            Face AI: {geo.faceAi}
          </button>
          <button
            type="button"
            className="field-evidence__tool"
            disabled={done}
            onClick={onCaptureAction}
          >
            <RotateCcw size={15} aria-hidden />
            Retake
          </button>
          <button
            type="button"
            className="field-evidence__tool"
            disabled={done}
            onClick={onCaptureAction}
          >
            <Images size={15} aria-hidden />
            Gallery
          </button>
        </div>

        <section className="field-evidence__telemetry" aria-labelledby={`geo-${task.id}`}>
          <div className="field-evidence__telemetry-head">
            <h4 id={`geo-${task.id}`}>GEOLOCATION TELEMETRY</h4>
            <button type="button" className="field-evidence__refresh" disabled={done} onClick={onCaptureAction}>
              <Crosshair size={13} aria-hidden />
              Refresh GPS Pin
            </button>
          </div>
          <div className="field-evidence__telemetry-body">
            <span className="field-evidence__radar" aria-hidden>
              <Crosshair size={22} />
            </span>
            <div>
              <p className="field-evidence__accuracy">
                <strong>{geo.accuracy === "—" ? "GPS standby" : `${geo.accuracy} Accuracy`}</strong>
                {geo.accuracy !== "—" ? <span> (Within 250m zone)</span> : null}
              </p>
              <p className="field-evidence__telemetry-loc">
                {coords} · {task.location ?? geo.placeLine}
              </p>
            </div>
          </div>
          <div className="field-evidence__telemetry-foot">
            <span>
              <CheckCircle2 size={14} aria-hidden />
              {done ? "Verified by district captain" : `Geofence Verified (${geo.wardLabel})`}
            </span>
            <span>{done ? "Status: Closed" : "Status: Locked"}</span>
          </div>
        </section>

        <p className="field-evidence__mission">{task.title}</p>

        <button
          type="button"
          className={`field-evidence__submit${done ? " field-evidence__submit--done" : ""}`}
          disabled={done}
          onClick={onSubmitProof}
        >
          {done ? "Verified · points credited" : task.cta}
        </button>
      </article>
    </li>
  );
}