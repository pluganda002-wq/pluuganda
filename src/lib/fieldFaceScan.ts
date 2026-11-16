import type { FaceMarker } from "@/lib/fieldFaceMarkers";

type DetectedFace = { boundingBox: DOMRectReadOnly };

declare global {
  interface Window {
    FaceDetector?: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
      detect: (image: ImageBitmapSource) => Promise<DetectedFace[]>;
    };
  }
}

const MIN_SCAN_MS = 1400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function boxToMarker(box: DOMRectReadOnly, imgW: number, imgH: number): FaceMarker {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const faceSpan = Math.max(box.width, box.height);
  return {
    xNorm: cx / imgW,
    yNorm: cy / imgH,
    radiusNorm: (faceSpan / 2 / Math.min(imgW, imgH)) * 1.05,
    ok: true,
  };
}

async function detectWithFaceDetector(img: HTMLImageElement): Promise<FaceMarker[] | null> {
  const FaceDetector = window.FaceDetector;
  if (!FaceDetector) return null;
  try {
    const detector = new FaceDetector({ fastMode: false, maxDetectedFaces: 24 });
    const faces = await detector.detect(img);
    if (!faces.length) return [];
    return faces.map((face) => boxToMarker(face.boundingBox, img.naturalWidth, img.naturalHeight));
  } catch {
    return null;
  }
}

export type FaceScanResult = {
  markers: FaceMarker[];
  usedNativeDetector: boolean;
  detectorUnavailable: boolean;
};

export async function scanFacesInImage(src: string): Promise<FaceScanResult> {
  const started = performance.now();
  const img = new Image();
  img.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });

  const detected = await detectWithFaceDetector(img);
  const detectorUnavailable = detected === null;
  const markers = detected ?? [];

  const elapsed = performance.now() - started;
  if (elapsed < MIN_SCAN_MS) {
    await sleep(MIN_SCAN_MS - elapsed);
  }

  return {
    markers,
    usedNativeDetector: !detectorUnavailable,
    detectorUnavailable,
  };
}