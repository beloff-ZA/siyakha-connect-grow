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

export const COVERAGE_DISCLAIMER =
  "Indicative coverage only — final placement and signal levels require an on-site wireless survey.";
