import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, Check, CheckCircle2, Crosshair, Images, Lock, RotateCcw, ScanFace } from "lucide-react";
import {
  coordsLine,
  evidencePhotoFor,
  geoForTask,
  liveCoordsLabel,
  type FieldGeo,
} from "@/lib/fieldDutyGeo";
import { markersForPhoto, type FaceMarker } from "@/lib/fieldFaceMarkers";
import type { DutyTask } from "@/data/dutyVerification";
import { useTelegram } from "@/hooks/useTelegram";
import "./FieldVerificationCapture.css";

const MIN_GROUP_FACES = 3;

type LivePin = { lat: number; lng: number; accuracyM?: number };

type Props = {
  task: DutyTask;
  onSubmitReady?: (ready: boolean) => void;
};

export function FieldVerificationCapture({ task, onSubmitReady }: Props) {
  const { showAlert, haptic } = useTelegram();
  const defaultPhoto = evidencePhotoFor(task);
  const defaultGeo = geoForTask(task);
  const fileId = useId();

  const [photoSrc, setPhotoSrc] = useState(defaultPhoto);
  const [userPhoto, setUserPhoto] = useState(false);
  const [faceMarkers, setFaceMarkers] = useState<FaceMarker[]>(() =>
    markersForPhoto(task.id, false, 900, 560)
  );
  const [faceCount, setFaceCount] = useState(faceMarkers.length);

  const [geo, setGeo] = useState<FieldGeo>(defaultGeo);
  const [livePin, setLivePin] = useState<LivePin | null>(null);
  const [locationLocked, setLocationLocked] = useState(false);
  const [pinning, setPinning] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const coords = livePin ? liveCoordsLabel(livePin.lat, livePin.lng) : coordsLine(geo);
  const accuracyLabel = livePin?.accuracyM
    ? `${Math.round(livePin.accuracyM)}m`
    : geo.accuracy === "—"
      ? "GPS standby"
      : geo.accuracy;
  const hudTime = userPhoto ? "Live capture · just now" : defaultGeo.capturedAt;

  const submitReady = userPhoto && faceCount >= MIN_GROUP_FACES && locationLocked;

  useEffect(() => {
    onSubmitReady?.(submitReady);
  }, [submitReady, onSubmitReady]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const runFaceScan = useCallback(
    (src: string, fromUser: boolean) => {
      const img = new Image();
      img.onload = () => {
        const markers = markersForPhoto(task.id, fromUser, img.naturalWidth, img.naturalHeight);
        setFaceMarkers(markers);
        setFaceCount(markers.length);
      };
      img.src = src;
    },
    [task.id]
  );

  function pickFile(file: File | null, fromCapture: boolean) {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoSrc(url);
    setUserPhoto(true);
    runFaceScan(url, true);
    haptic("light");
    if (fromCapture) {
      fileRef.current?.removeAttribute("capture");
    }
  }

  function onRetake() {
    fileRef.current?.setAttribute("capture", "environment");
    fileRef.current?.click();
  }

  function onGallery() {
    fileRef.current?.removeAttribute("capture");
    fileRef.current?.click();
  }

  function resetToDefaultPhoto() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoSrc(defaultPhoto);
    setUserPhoto(false);
    const markers = markersForPhoto(task.id, false, 900, 560);
    setFaceMarkers(markers);
    setFaceCount(markers.length);
  }

  function refreshGps() {
    if (locationLocked || pinning) return;
    if (!navigator.geolocation) return;
    setPinning(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLivePin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        });
        setPinning(false);
      },
      () => {
        setPinning(false);
        showAlert("Allow location access to refresh your GPS pin.");
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  function lockLocation() {
    if (locationLocked) return;
    setLocationLocked(true);
    if (!livePin) {
      setGeo(defaultGeo);
    }
    haptic("medium");
  }

  const faceAiLabel =
    faceCount >= MIN_GROUP_FACES
      ? `${faceCount} Patriot${faceCount === 1 ? "" : "s"} Dete…`
      : "Scan for group…";

  return (
    <div className="field-capture">
      <header className="field-capture__head">
        <span className="field-capture__head-title">
          <Camera size={15} aria-hidden />
          Field Mobilization Evidence
        </span>
        <span className="field-capture__head-meta">Live Camera Buffer</span>
      </header>

      <div className="field-capture__viewport">
        <img src={photoSrc} alt="" className="field-capture__photo" />
        <div className="field-capture__faces" aria-hidden>
          {faceMarkers.map((m, i) => (
            <span
              key={i}
              className="field-capture__face"
              style={{
                left: `${m.xPct}%`,
                top: `${m.yPct}%`,
                width: `${m.sizePct}%`,
                height: `${m.sizePct}%`,
              }}
            >
              <Check size={14} strokeWidth={3} aria-hidden />
            </span>
          ))}
        </div>
        <span className="field-capture__live">
          <span className="field-capture__live-dot" aria-hidden />
          {userPhoto ? "CAPTURE · FACE AI" : "LIVE CAM · GEOTAG ACTIVE"}
        </span>
        <div className="field-capture__frame" aria-hidden />
        <div className="field-capture__hud">
          <div className="field-capture__hud-coords">{coords}</div>
          <div className="field-capture__hud-place">{geo.placeLine}</div>
          <div className="field-capture__hud-row">
            <span>{hudTime}</span>
            <span>ALT {geo.altitude}</span>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        id={fileId}
        type="file"
        accept="image/*"
        className="field-capture__file"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null, Boolean(fileRef.current?.hasAttribute("capture")))}
      />

      <div className="field-capture__toolbar" role="group" aria-label="Capture actions">
        <button type="button" className="field-capture__tool field-capture__tool--wide">
          <ScanFace size={16} aria-hidden />
          <Check size={12} className="field-capture__tool-check" aria-hidden />
          Face AI: {faceAiLabel}
        </button>
        <button type="button" className="field-capture__tool" onClick={onRetake}>
          <RotateCcw size={15} aria-hidden />
          Retake
        </button>
        <button type="button" className="field-capture__tool" onClick={onGallery}>
          <Images size={15} aria-hidden />
          Gallery
        </button>
      </div>

      {!userPhoto ? (
        <p className="field-capture__hint">
          Sample evidence shown. Capture or pick a <strong>group photo</strong> with at least {MIN_GROUP_FACES}{" "}
          visible faces (green ticks).
        </p>
      ) : faceCount < MIN_GROUP_FACES ? (
        <p className="field-capture__hint field-capture__hint--warn">
          Need at least {MIN_GROUP_FACES} faces detected. Widen the shot or move closer to the group.
        </p>
      ) : null}

      <section className="field-capture__telemetry" aria-labelledby={`geo-sheet-${task.id}`}>
        <div className="field-capture__telemetry-head">
          <h4 id={`geo-sheet-${task.id}`}>GEOLOCATION TELEMETRY</h4>
          <button
            type="button"
            className="field-capture__refresh"
            disabled={locationLocked || pinning}
            onClick={refreshGps}
          >
            <Crosshair size={13} aria-hidden />
            {pinning ? "Pinning…" : "Refresh GPS Pin"}
          </button>
        </div>
        <div className="field-capture__telemetry-body">
          <span className="field-capture__radar" aria-hidden>
            <Crosshair size={22} />
          </span>
          <div>
            <p className="field-capture__accuracy">
              <strong>{accuracyLabel === "GPS standby" ? accuracyLabel : `${accuracyLabel} Accuracy`}</strong>
              {accuracyLabel !== "GPS standby" ? <span> (Within 250m zone)</span> : null}
            </p>
            <p className="field-capture__telemetry-loc">
              {coords} · {task.location ?? geo.placeLine}
            </p>
          </div>
        </div>
        <div className="field-capture__telemetry-foot">
          <span>
            <CheckCircle2 size={14} aria-hidden />
            {locationLocked ? `Geofence Verified (${geo.wardLabel})` : "Awaiting location lock"}
          </span>
          <span>{locationLocked ? "Status: Locked" : "Status: Open"}</span>
        </div>
        {!locationLocked ? (
          <button type="button" className="field-capture__lock" onClick={lockLocation}>
            <Lock size={15} aria-hidden />
            Lock GPS pin
          </button>
        ) : null}
      </section>

      <button type="button" className="field-capture__default-link" onClick={resetToDefaultPhoto}>
        Restore sample evidence
      </button>
    </div>
  );
}