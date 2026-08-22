/**
 * Coordinate helpers for the Virtual Building Plans canvas.
 *
 * Marker x_norm / y_norm are ALWAYS normalised (0..1) against the rendered
 * architectural image content rectangle — never the outer container. The image
 * is drawn with `object-fit: contain` semantics, so the content rectangle is
 * letterboxed inside the container and must be computed explicitly.
 */

export type Size = { width: number; height: number };
export type Rect = { left: number; top: number; width: number; height: number };

/** Content rectangle of a `contain`-fitted image inside a container (unscaled/local px). */
export function containRect(container: Size, natural: Size): Rect {
  if (
    !container.width ||
    !container.height ||
    !natural.width ||
    !natural.height
  ) {
    return { left: 0, top: 0, width: container.width || 0, height: container.height || 0 };
  }
  const scale = Math.min(container.width / natural.width, container.height / natural.height);
  const width = natural.width * scale;
  const height = natural.height * scale;
  return {
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
    width,
    height,
  };
}

export const clampUnit = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Invert the active pan/zoom transform and the image content rect to get
 * normalised image coordinates from a viewport pointer position.
 *
 * `containerRect` is the untransformed container's bounding box (screen px).
 * `offset`/`zoom` are the transform applied as `translate(offset) scale(zoom)`
 * about origin 0 0. `content` is the image rect in local (pre-transform) px.
 */
export function pointerToNorm(args: {
  clientX: number;
  clientY: number;
  containerRect: { left: number; top: number };
  offset: { x: number; y: number };
  zoom: number;
  content: Rect;
}): { x: number; y: number } {
  const { clientX, clientY, containerRect, offset, zoom, content } = args;
  const px = clientX - containerRect.left;
  const py = clientY - containerRect.top;
  // undo translate + scale -> local container space
  const lx = (px - offset.x) / zoom;
  const ly = (py - offset.y) / zoom;
  if (!content.width || !content.height) return { x: 0.5, y: 0.5 };
  return {
    x: clampUnit((lx - content.left) / content.width),
    y: clampUnit((ly - content.top) / content.height),
  };
}

/** Zoom about a fixed anchor point, keeping the anchored content stationary. */
export function zoomAbout(args: {
  zoom: number;
  next: number;
  offset: { x: number; y: number };
  px: number;
  py: number;
}) {
  const { zoom, next, offset, px, py } = args;
  const k = next / zoom;
  return { zoom: next, offset: { x: px - (px - offset.x) * k, y: py - (py - offset.y) * k } };
}

/** Normalised wheel delta -> multiplicative zoom factor. */
export function wheelZoomFactor(deltaY: number, deltaMode: number, intensity = 0.0018) {
  const dy = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 100 : 1);
  return Math.exp(-dy * intensity);
}

/** Coverage band radii as a fraction of the image content rect's smaller side. */
export const COVERAGE_BANDS = [
  { key: "strong", label: "Strong", radius: 0.055 },
  { key: "good", label: "Good", radius: 0.095 },
  { key: "edge", label: "Edge", radius: 0.14 },
] as const;

/** Indicative CCTV cone radius as a fraction of the image content rect's smaller side. */
export const CAMERA_RANGE_RADIUS: Record<string, number> = {
  small: 0.1,
  medium: 0.16,
  large: 0.24,
};

/**
 * Coverage overlay mode for the currently selected device: only Wi-Fi APs and
 * cameras have a meaningful coverage preview, every other marker type is off.
 */
export function selectedCoverageMode(markerType?: string | null): "off" | "selected" {
  return markerType === "wifi_ap" || markerType === "camera" ? "selected" : "off";
}

/** Short helper line shown under the plan for the selected device's coverage preview. */
export function coverageHelpText(markerType?: string | null): string | null {
  if (markerType === "wifi_ap") return "Wi-Fi coverage preview — strong, good and edge signal bands.";
  if (markerType === "camera")
    return "Camera view preview — drag the orange handle to aim the light cone.";
  return null;
}

/** True when a viewport pointer lies inside the (transformed) image content rect. */
export function pointerInContent(args: {
  clientX: number;
  clientY: number;
  containerRect: { left: number; top: number };
  offset: { x: number; y: number };
  zoom: number;
  content: Rect;
}): boolean {
  const { clientX, clientY, containerRect, offset, zoom, content } = args;
  if (!content.width || !content.height) return false;
  const lx = (clientX - containerRect.left - offset.x) / zoom;
  const ly = (clientY - containerRect.top - offset.y) / zoom;
  return (
    lx >= content.left &&
    lx <= content.left + content.width &&
    ly >= content.top &&
    ly <= content.top + content.height
  );
}

export const COVERAGE_DISCLAIMER =
  "Indicative coverage only — final camera angles, focal lengths and signal levels require an on-site survey.";


/**
 * Plan bearing convention — used by every camera direction value in this module,
 * in the database (`portal_floor_markers.direction_deg`) and in the UI:
 *   0° = up / north on the plan image
 *  90° = right / east
 * 180° = down / south
 * 270° = left / west
 * Angles increase clockwise.
 */
export const normalizeBearing = (deg: number) => {
  const r = Math.round(deg) % 360;
  return r < 0 ? r + 360 : r;
};

/** Bearing from a pixel delta measured in image-content pixels (y grows downward). */
export function bearingFromDelta(dx: number, dy: number): number {
  if (dx === 0 && dy === 0) return 0;
  return normalizeBearing((Math.atan2(dx, -dy) * 180) / Math.PI);
}

/**
 * Bearing from one normalised point to another. Normalised units are converted to
 * image-content pixels first, so the angle is correct on non-square plans.
 */
export function bearingBetween(
  from: { x: number; y: number },
  to: { x: number; y: number },
  content: Size,
): number {
  return bearingFromDelta(
    (to.x - from.x) * (content.width || 1),
    (to.y - from.y) * (content.height || 1),
  );
}

/** Distance in image-content pixels between two normalised points. */
export function normDistancePx(
  from: { x: number; y: number },
  to: { x: number; y: number },
  content: Size,
): number {
  const dx = (to.x - from.x) * (content.width || 1);
  const dy = (to.y - from.y) * (content.height || 1);
  return Math.hypot(dx, dy);
}

/**
 * CSS rotation (deg, clockwise) for a glyph or cone drawn pointing UP at rest.
 * Identity by design — kept explicit so renderers never re-derive the mapping.
 */
export const bearingToRotation = (deg: number) => normalizeBearing(deg);

/** Offset in px from a marker centre to a point `dist` px away along the bearing. */
export function aimOffsetPx(deg: number, dist: number): { dx: number; dy: number } {
  const rad = (normalizeBearing(deg) * Math.PI) / 180;
  return { dx: Math.sin(rad) * dist, dy: -Math.cos(rad) * dist };
}

export const CARDINAL_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

/** Nearest 8-point compass label for a bearing. */
export function cardinalLabel(deg: number): string {
  const d = normalizeBearing(deg);
  return CARDINAL_LABELS[Math.round(d / 45) % 8];
}

/** Human-readable bearing, e.g. "135° SE". */
export const bearingText = (deg: number) => `${normalizeBearing(deg)}° ${cardinalLabel(deg)}`;

/** Minimum drag distance (image px) before a placement drag is treated as aiming. */
export const AIM_DEADZONE_PX = 8;
