/** Face position in image space (0–1), independent of how the photo is cropped on screen. */
export type FaceMarker = {
  xNorm: number;
  yNorm: number;
  radiusNorm: number;
  ok?: boolean;
};

export function markersInViewport(
  markers: FaceMarker[],
  imgW: number,
  imgH: number,
  viewW: number,
  viewH: number
): { xPct: number; yPct: number; sizePct: number; ok?: boolean }[] {
  if (!viewW || !viewH || !imgW || !imgH || !markers.length) return [];

  const scale = Math.max(viewW / imgW, viewH / imgH);
  const renderedW = imgW * scale;
  const renderedH = imgH * scale;
  const offsetX = (viewW - renderedW) / 2;
  const offsetY = (viewH - renderedH) / 2;

  return markers.map((m) => {
    const cx = m.xNorm * imgW;
    const cy = m.yNorm * imgH;
    const sx = offsetX + cx * scale;
    const sy = offsetY + cy * scale;
    const diameter = m.radiusNorm * Math.min(imgW, imgH) * 2 * scale;
    return {
      xPct: (sx / viewW) * 100,
      yPct: (sy / viewH) * 100,
      sizePct: Math.min(24, Math.max(7, (diameter / viewW) * 100)),
      ok: m.ok,
    };
  });
}