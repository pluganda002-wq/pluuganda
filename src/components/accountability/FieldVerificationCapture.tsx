import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Camera, Check, CheckCircle2, Crosshair, Images, Lock, RotateCcw, ScanFace, X } from "lucide-react";
import {
  coordsLine,
  evidencePhotoFor,
  geoForTask,
  liveCoordsLabel,
  type FieldGeo,
} from "@/lib/fieldDutyGeo";
import { markersInViewport, type FaceMarker } from "@/lib/fieldFaceMarkers";
import { scanFacesInImage } from "@/lib/fieldFaceScan";
import type { DutyTask } from "@/data/dutyVerification";
import { useTelegram } from "@/hooks/useTelegram";
import "./FieldVerificationCapture.css";

const MIN_GROUP_FACES = 3;

type LivePin = { lat: number; lng: number; accuracyM?: number };
type LocationMode = "default" | "live" | null;

type DisplayMarker = { xPct: number; yPct: number; sizePct: number; ok?: boolean };

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
  const [faceMarkers, setFaceMarkers] = useState<FaceMarker[]>([]);
  const [displayMarkers, setDisplayMarkers] = useState<DisplayMarker[]>([]);
  const [faceCount, setFaceCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [noPeople, setNoPeople] = useState(false);

  const [geo, setGeo] = useState<FieldGeo>(defaultGeo);
  const [livePin, setLivePin] = useState<LivePin | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>(null);
  const [locationLocked, setLocationLocked] = useState(false);
  const [pinning, setPinning] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const scanGenRef = useRef(0);

  const syncMarkerLayout = useCallback(() => {
    const img = imgRef.current;
    const vp = viewportRef.current;
    if (!img?.complete || !img.naturalWidth || !vp) {
      setDisplayMarkers([]);
      return;
    }
    setDisplayMarkers(
      markersInViewport(faceMarkers, img.naturalWidth, img.naturalHeight, vp.clientWidth, vp.clientHeight)
    );
  }, [faceMarkers]);

  const coords = livePin ? liveCoordsLabel(livePin.lat, livePin.lng) : coordsLine(geo);
  const accuracyLabel = livePin?.accuracyM
    ? `${Math.round(livePin.accuracyM)}m`
    : geo.accuracy === "—"
      ? "GPS standby"
      : geo.accuracy;
  const hudTime = userPhoto ? (scanning ? "Face AI scan in progress…" : "Live capture · just now") : defaultGeo.capturedAt;

  const photoAccepted =
    userPhoto && !scanning && !noPeople && faceCount >= MIN_GROUP_FACES;
  const submitReady = photoAccepted && locationLocked && locationMode !== null;

  useEffect(() => {
    onSubmitReady?.(submitReady);
  }, [submitReady, onSubmitReady]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    syncMarkerLayout();
  }, [syncMarkerLayout, photoSrc]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => syncMarkerLayout());
    ro.observe(vp);
    return () => ro.disconnect();
  }, [syncMarkerLayout]);

  const rejectUserPhoto = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoSrc(defaultPhoto);
    setUserPhoto(false);
    setNoPeople(false);
    setFaceMarkers([]);
    setFaceCount(0);
    setDisplayMarkers([]);
  }, [defaultPhoto]);

  const runFaceScan = useCallback(
    async (src: string) => {
      const gen = ++scanGenRef.current;
      setScanning(true);
      setNoPeople(false);
      setFaceMarkers([]);
      setFaceCount(0);
      setDisplayMarkers([]);

      try {
        const { markers, detectorUnavailable } = await scanFacesInImage(src);
        if (gen !== scanGenRef.current) return;

        if (detectorUnavailable) {
          setNoPeople(true);
          setFaceMarkers([]);
          setFaceCount(0);
          haptic("light");
          showAlert(
            "Face scan unavailable in this browser. Use Chrome, Edge, or Telegram — or retake in a supported app."
          );
          return;
        }

        if (!markers.length) {
          setNoPeople(true);
          setFaceMarkers([]);
          setFaceCount(0);
          haptic("light");
          showAlert("No human detected.");
          return;
        }

        setFaceMarkers(markers);
        setFaceCount(markers.length);
        setNoPeople(false);
        haptic(markers.length >= MIN_GROUP_FACES ? "medium" : "light");
      } catch {
        if (gen !== scanGenRef.current) return;
        setNoPeople(true);
        setFaceCount(0);
        setFaceMarkers([]);
        showAlert("No human detected.");
      } finally {
        if (gen === scanGenRef.current) setScanning(false);
      }
    },
    [haptic, showAlert, rejectUserPhoto]
  );

  function pickFile(file: File | null, fromCapture: boolean) {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoSrc(url);
    setUserPhoto(true);
    void runFaceScan(url);
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

  function resetFieldProof() {
    scanGenRef.current += 1;
    setScanning(false);
    setNoPeople(false);
    rejectUserPhoto();
    setLocationMode(null);
    setLocationLocked(false);
    setLivePin(null);
    setGeo(defaultGeo);
    setPinning(false);
    haptic("light");
  }

  function useDefaultLocation() {
    if (locationLocked) return;
    setLocationMode("default");
    setLivePin(null);
    setGeo(defaultGeo);
    haptic("light");
  }

  function pinMyLocation() {
    if (locationLocked || pinning) return;
    if (!navigator.geolocation) {
      showAlert("Location not available on this device.");
      return;
    }
    setPinning(true);
    haptic("light");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLivePin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        });
        setLocationMode("live");
        setPinning(false);
        haptic("medium");
      },
      () => {
        setPinning(false);
        showAlert("Allow location access to pin your field duty.");
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  function lockLocation() {
    if (locationLocked || !locationMode) {
      if (!locationMode) {
        showAlert("Choose system default coordinates or pin your location, then lock.");
      }
      return;
    }
    setLocationLocked(true);
    if (locationMode === "default") {
      setGeo(defaultGeo);
      setLivePin(null);
    }
    haptic("medium");
  }

  const faceAiLabel = scanning
    ? "Scanning…"
    : !userPhoto
      ? "Awaiting your capture"
      : noPeople
        ? "No human detected"
        : faceCount >= MIN_GROUP_FACES
          ? `${faceCount} Patriot${faceCount === 1 ? "" : "s"} Dete…`
          : faceCount > 0
            ? `${faceCount} face${faceCount === 1 ? "" : "s"} · need ${MIN_GROUP_FACES}+`
            : "Awaiting scan…";

  return (
    <div className="field-capture">
      <header className="field-capture__head">
        <span className="field-capture__head-title">
          <Camera size={15} aria-hidden />
          Reconcile Field Action
        </span>
        <span className="field-capture__head-meta">Live Camera Buffer</span>
      </header>

      <div
        ref={viewportRef}
        className={`field-capture__viewport${scanning ? " field-capture__viewport--scanning" : ""}${noPeople && userPhoto ? " field-capture__viewport--fail" : ""}`}
      >
        <img
          ref={imgRef}
          src={photoSrc}
          alt=""
          className={`field-capture__photo${userPhoto ? "" : " field-capture__photo--sample"}`}
          onLoad={syncMarkerLayout}
        />
        {scanning ? (
          <>
            <div className="field-capture__scan-ring" aria-hidden />
            <div className="field-capture__scan-line" aria-hidden />
            <p className="field-capture__scan-label">
              <ScanFace size={16} aria-hidden />
              Scanning for patriots…
            </p>
          </>
        ) : null}
        {noPeople && userPhoto && !scanning ? (
          <p className="field-capture__human-fail" role="alert">
            No human detected
          </p>
        ) : null}
        <div className="field-capture__faces" aria-hidden>
          {!scanning && noPeople && userPhoto ? (
            <span className="field-capture__face field-capture__face--fail field-capture__face--center">
              <X size={22} strokeWidth={3} aria-hidden />
            </span>
          ) : null}
          {!scanning &&
            userPhoto &&
            !noPeople &&
            displayMarkers.map((m, i) => (
              <span
                key={i}
                className={`field-capture__face${m.ok === false ? " field-capture__face--fail" : ""}`}
                style={{
                  left: `${m.xPct}%`,
                  top: `${m.yPct}%`,
                  width: `${m.sizePct}%`,
                  height: `${m.sizePct}%`,
                }}
              >
                {m.ok === false ? <X size={14} strokeWidth={3} aria-hidden /> : <Check size={14} strokeWidth={3} aria-hidden />}
              </span>
            ))}
        </div>
        <span className="field-capture__live">
          <span className="field-capture__live-dot" aria-hidden />
          {scanning ? "FACE AI · SCANNING" : userPhoto ? "CAPTURE · FACE AI" : "LIVE CAM · GEOTAG ACTIVE"}
        </span>
        {!scanning ? <div className="field-capture__frame" aria-hidden /> : null}
        <div className="field-capture__hud">
          <div className="field-capture__hud-coords">{coords}</div>
          <div className="field-capture__hud-place">{geo.placeLine}</div>
          <div className="field-capture__hud-row">
            <span>{hudTime}</span>
            <span>ALT {geo.altitude}</span>
          </div>
        </div>
      </div>

      {noPeople && userPhoto && !scanning ? (
        <p className="field-capture__hint field-capture__hint--fail" role="alert">
          No human detected. Your photo was not accepted — retake or choose a clearer group shot.
        </p>
      ) : null}

      <input
        ref={fileRef}
        id={fileId}
        type="file"
        accept="image/*"
        className="field-capture__file"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null, Boolean(fileRef.current?.hasAttribute("capture")))}
      />

      <div className="field-capture__toolbar" role="group" aria-label="Capture actions">
        <button type="button" className="field-capture__tool field-capture__tool--wide" disabled={scanning}>
          <ScanFace size={16} aria-hidden />
          {!noPeople && faceCount >= MIN_GROUP_FACES ? (
            <Check size={12} className="field-capture__tool-check" aria-hidden />
          ) : noPeople ? (
            <X size={12} className="field-capture__tool-fail" aria-hidden />
          ) : null}
          Face AI: {faceAiLabel}
        </button>
        <button type="button" className="field-capture__tool" disabled={scanning} onClick={onRetake}>
          <RotateCcw size={15} aria-hidden />
          Retake
        </button>
        <button type="button" className="field-capture__tool" disabled={scanning} onClick={onGallery}>
          <Images size={15} aria-hidden />
          Gallery
        </button>
      </div>

      {!userPhoto ? (
        <p className="field-capture__hint">
          Sample evidence shown. Capture or pick a <strong>group photo</strong> with at least {MIN_GROUP_FACES}{" "}
          visible faces (green ticks after scan).
        </p>
      ) : !scanning && !noPeople && faceCount > 0 && faceCount < MIN_GROUP_FACES ? (
        <p className="field-capture__hint field-capture__hint--warn">
          Only {faceCount} face{faceCount === 1 ? "" : "s"} detected. Need at least {MIN_GROUP_FACES} for field proof.
        </p>
      ) : null}

      <section className="field-capture__telemetry" aria-labelledby={`geo-sheet-${task.id}`}>
        <div className="field-capture__telemetry-head">
          <h4 id={`geo-sheet-${task.id}`}>GEOLOCATION TELEMETRY</h4>
          {!locationLocked ? (
            <span className="field-capture__geo-pick">Select source, then lock</span>
          ) : (
            <span className="field-capture__geo-pick field-capture__geo-pick--locked">
              {locationMode === "live" ? "Live GPS" : "System default"}
            </span>
          )}
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
        {!locationLocked ? (
          <div className="field-capture__geo-actions" role="group" aria-label="Location source">
            <button
              type="button"
              className={`field-capture__geo-btn${locationMode === "default" ? " field-capture__geo-btn--active" : ""}`}
              disabled={pinning}
              onClick={useDefaultLocation}
            >
              <Crosshair size={14} aria-hidden />
              Use system default
            </button>
            <button
              type="button"
              className={`field-capture__geo-btn${locationMode === "live" ? " field-capture__geo-btn--active" : ""}`}
              disabled={pinning}
              onClick={pinMyLocation}
            >
              <Crosshair size={14} aria-hidden />
              {pinning ? "Pinning…" : "Pin my location"}
            </button>
          </div>
        ) : null}
        <div className="field-capture__telemetry-foot">
          <span className="field-capture__telemetry-foot-geofence">
            <CheckCircle2 size={14} aria-hidden />
            {locationLocked
              ? `Geofence Verified (${geo.wardLabel})`
              : locationMode
                ? `Ready to lock · ${locationMode === "live" ? "Your GPS" : "Default site"}`
                : "Choose default or your GPS"}
          </span>
          <div className="field-capture__telemetry-status">
            <span>{locationLocked ? "Status: Locked" : "Status: Open"}</span>
            {!locationLocked ? (
              <button
                type="button"
                className="field-capture__lock field-capture__lock--inline"
                disabled={!locationMode || pinning}
                onClick={lockLocation}
              >
                <Lock size={13} aria-hidden />
                Lock GPS
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <button type="button" className="field-capture__default-link" onClick={resetFieldProof} disabled={scanning}>
        Reset
      </button>
    </div>
  );
}