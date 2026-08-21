import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Maximize2, Minus, Plus, Server, Video } from "lucide-react";
import { kindShort, type FloorMarker } from "@/lib/floorPlans";
import {
  AIM_DEADZONE_PX,
  CAMERA_RANGE_RADIUS,
  COVERAGE_BANDS,
  aimOffsetPx,
  bearingBetween,
  bearingText,
  bearingToRotation,
  containRect,
  normDistancePx,
  normalizeBearing,
  pointerInContent,
  pointerToNorm,
  wheelZoomFactor,
  zoomAbout,
  type Rect,
} from "@/lib/planGeometry";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 8;
const DRAG_THRESHOLD = 4;

export type CoverageMode = "off" | "selected" | "all";

/**
 * A cable route ready to draw. Endpoints are resolved by the caller from the
 * CURRENT rack / device marker positions, so moving a marker moves the route.
 */
export type CanvasRoute = {
  id: string;
  service_type: "wifi_ap" | "camera";
  from: { x: number; y: number };
  to: { x: number; y: number };
  waypoints: { x: number; y: number }[];
  /** False when the route status is progressed and its geometry is locked. */
  editable?: boolean;
};

type Props = {
  imageUrl: string | null;
  markers: FloorMarker[];
  selectedId?: string | null;
  onSelect?: (marker: FloorMarker | null) => void;
  /**
   * Click (or click-drag-to-aim) on empty plan to place a marker at normalised
   * coords. `direction` is the plan bearing the pointer was dragged toward, or
   * undefined when the gesture was a plain tap.
   */
  onPlace?: (x: number, y: number, direction?: number) => void;
  /** Drag a marker to new normalised coords. */
  onMove?: (markerId: string, x: number, y: number) => void;
  /** Called once when a marker drag finishes, to persist the position. */
  onMoveEnd?: (markerId: string) => void;
  /** Drag the aim handle of a selected camera to change its bearing (0–359). */
  onAim?: (markerId: string, deg: number) => void;

  /** When false for a marker, dragging is blocked and a lock badge is shown in edit mode. */
  canDrag?: (marker: FloorMarker) => boolean;
  /** Visual affordances for reposition mode. */
  editing?: boolean;
  placing?: boolean;
  /** Marker ids that exist only as local unsaved drafts. */
  unsavedIds?: string[];
  /** Coverage overlay: off, selected device only, or all APs on this floor. */
  coverage?: CoverageMode;

  /** Cable routes to draw on this level (already filtered by the caller). */
  routes?: CanvasRoute[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string | null) => void;
  /** Waypoint editing mode — only then are route handles interactive. */
  editingRoutes?: boolean;
  onMoveWaypoint?: (routeId: string, index: number, x: number, y: number) => void;
  onAddWaypoint?: (routeId: string, segment: number, x: number, y: number) => void;
  onRemoveWaypoint?: (routeId: string, index: number) => void;

  height?: string;
  emptyLabel?: string;
};

/**
 * Clip path for a true circular sector of `fov` degrees, centred on the box centre
 * and pointing UP at rest — so a CSS `rotate(bearing)` aims it on the plan bearing.
 */
function sectorClipPath(fov: number, steps = 24) {
  const half = Math.min(Math.max(fov, 10), 170) / 2;
  const pts = ["50% 50%"];
  for (let i = 0; i <= steps; i++) {
    const a = ((-half + (2 * half * i) / steps) * Math.PI) / 180;
    pts.push(`${(50 + Math.sin(a) * 50).toFixed(3)}% ${(50 - Math.cos(a) * 50).toFixed(3)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

const statusRing: Record<string, string> = {
  planned: "border-dashed",
  installed: "border-solid",
  tested: "border-solid",
  active: "border-solid",
};

/** Selected-marker highlight, distinct from status styling and legible in both themes. */
const selectedRing = (kind: string) =>
  kind === "camera"
    ? "border-[hsl(32_100%_50%)] ring-2 ring-[hsl(32_100%_50%)] shadow-[0_0_0_4px_hsl(32_100%_50%/0.28),0_0_16px_hsl(32_100%_50%/0.55)]"
    : kind === "rack"
      ? "border-[hsl(268_85%_58%)] ring-2 ring-[hsl(268_85%_58%)] shadow-[0_0_0_4px_hsl(268_85%_58%/0.3),0_0_18px_hsl(268_85%_58%/0.6)]"
      : "border-[hsl(190_100%_45%)] ring-2 ring-[hsl(190_100%_45%)] shadow-[0_0_0_4px_hsl(190_100%_45%/0.28),0_0_16px_hsl(190_100%_45%/0.55)]";



const FloorPlanCanvas: React.FC<Props> = ({
  imageUrl,
  markers,
  selectedId,
  onSelect,
  onPlace,
  onMove,
  onMoveEnd,
  onAim,
  canDrag,
  editing = false,
  placing = false,
  unsavedIds,
  coverage = "off",
  routes,
  selectedRouteId = null,
  onSelectRoute,
  editingRoutes = false,
  onMoveWaypoint,
  onAddWaypoint,
  onRemoveWaypoint,
  height = "h-[60vh] md:h-[70vh]",
  emptyLabel = "Plan image not available yet.",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });

  const unsaved = useMemo(() => new Set(unsavedIds ?? []), [unsavedIds]);

  const stateRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  stateRef.current = { zoom, offset };

  /** Image content rectangle in local (pre-transform) px — the marker coordinate space. */
  const content: Rect = useMemo(
    () => containRect(containerSize, natural),
    [containerSize, natural],
  );
  const contentRef = useRef(content);
  contentRef.current = content;

  const dragRef = useRef<
    | { mode: "pan"; startX: number; startY: number; ox: number; oy: number; moved: boolean }
    | { mode: "marker"; id: string; startX: number; startY: number; moved: boolean; draggable: boolean }
    | { mode: "aim"; id: string; startX: number; startY: number; moved: boolean }
    | {
        mode: "place";
        startX: number;
        startY: number;
        anchor: { x: number; y: number };
        moved: boolean;
      }
    | { mode: "wp"; id: string; index: number; startX: number; startY: number; moved: boolean }
    | { mode: "seg"; id: string; index: number; startX: number; startY: number; moved: boolean }
    | null
  >(null);

  /** Live preview of a placement gesture: where it started and where it aims. */
  const [placePreview, setPlacePreview] = useState<
    { x: number; y: number; deg: number | null } | null
  >(null);



  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    setNatural({ width: 0, height: 0 });
    reset();
  }, [imageUrl, reset]);

  // Track container size so the content rect stays correct on resize / breakpoint change.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageUrl]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
    if (next === z) return;
    const r = zoomAbout({ zoom: z, next, offset: o, px, py });
    setZoom(r.zoom);
    setOffset(r.offset);
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(wheelZoomFactor(e.deltaY, e.deltaMode), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const toNorm = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const rect = el.getBoundingClientRect();
    const { zoom: z, offset: o } = stateRef.current;
    return pointerToNorm({
      clientX,
      clientY,
      containerRect: { left: rect.left, top: rect.top },
      offset: o,
      zoom: z,
      content: contentRef.current,
    });
  }, []);

  /** Guard: only pointer positions over the architectural image may create markers. */
  const insideImage = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const { zoom: z, offset: o } = stateRef.current;
    return pointerInContent({
      clientX,
      clientY,
      containerRect: { left: rect.left, top: rect.top },
      offset: o,
      zoom: z,
      content: contentRef.current,
    });
  }, []);

  /** Bearing from a marker centre to a pointer, using the plan convention (0° = up). */
  const aimDeg = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const m = markers.find((x) => x.id === id);
      if (!m) return 0;
      return bearingBetween(
        { x: Number(m.x_norm), y: Number(m.y_norm) },
        toNorm(clientX, clientY),
        contentRef.current,
      );
    },
    [markers, toNorm],
  );

  /** Bearing from a fixed normalised anchor to a pointer; null inside the deadzone. */
  const aimFrom = useCallback(
    (anchor: { x: number; y: number }, clientX: number, clientY: number) => {
      const p = toNorm(clientX, clientY);
      const c = contentRef.current;
      if (normDistancePx(anchor, p, c) < AIM_DEADZONE_PX) return null;
      return bearingBetween(anchor, p, c);
    },
    [toNorm],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    const aimId = target.closest("[data-aim-for]")?.getAttribute("data-aim-for");
    const markerId = target.closest("[data-marker-id]")?.getAttribute("data-marker-id");
    const wpEl = target.closest("[data-wp-route]");
    const segEl = target.closest("[data-seg-route]");
    const routeEl = target.closest("[data-route-id]");
    if (wpEl) {
      dragRef.current = {
        mode: "wp",
        id: wpEl.getAttribute("data-wp-route") ?? "",
        index: Number(wpEl.getAttribute("data-wp-index") ?? 0),
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };
    } else if (segEl) {
      dragRef.current = {
        mode: "seg",
        id: segEl.getAttribute("data-seg-route") ?? "",
        index: Number(segEl.getAttribute("data-seg-index") ?? 0),
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };
    } else if (routeEl) {
      onSelectRoute?.(routeEl.getAttribute("data-route-id"));
      dragRef.current = null;
      return;
    } else if (aimId) {
      dragRef.current = { mode: "aim", id: aimId, startX: e.clientX, startY: e.clientY, moved: false };
    } else if (markerId) {
      const m = markers.find((x) => x.id === markerId);
      dragRef.current = {
        mode: "marker",
        id: markerId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        draggable: !!m && (canDrag ? canDrag(m) : true),
      };
    } else if (placing && onPlace && insideImage(e.clientX, e.clientY)) {
      // Placement mode: this press fixes the position, the drag aims the camera.
      const anchor = toNorm(e.clientX, e.clientY);
      dragRef.current = {
        mode: "place",
        startX: e.clientX,
        startY: e.clientY,
        anchor,
        moved: false,
      };
      setPlacePreview({ x: anchor.x, y: anchor.y, deg: null });
    } else {
      dragRef.current = {
        mode: "pan",
        startX: e.clientX,
        startY: e.clientY,
        ox: offset.x,
        oy: offset.y,
        moved: false,
      };
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const far =
      Math.abs(e.clientX - d.startX) > DRAG_THRESHOLD ||
      Math.abs(e.clientY - d.startY) > DRAG_THRESHOLD;
    if (far) d.moved = true;
    if (d.mode === "pan") {
      if (!d.moved) return;
      setOffset({ x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) });
    } else if (d.mode === "aim") {
      if (onAim) onAim(d.id, aimDeg(d.id, e.clientX, e.clientY));
    } else if (d.mode === "place") {
      const deg = aimFrom(d.anchor, e.clientX, e.clientY);
      setPlacePreview({ x: d.anchor.x, y: d.anchor.y, deg });
    } else if (d.mode === "wp") {
      if (!onMoveWaypoint) return;
      const { x, y } = toNorm(e.clientX, e.clientY);
      onMoveWaypoint(d.id, d.index, x, y);
    } else if (d.mode === "seg") {
      // nothing to preview; the waypoint is inserted on release
    } else if (onMove && d.moved && d.draggable) {
      const { x, y } = toNorm(e.clientX, e.clientY);
      onMove(d.id, x, y);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.mode === "aim") return;
    if (d.mode === "marker") {
      if (d.moved && d.draggable) onMoveEnd?.(d.id);
      else if (!d.moved) {
        const m = markers.find((x) => x.id === d.id);
        if (m) onSelect?.(m);
      }
      return;
    }
    if (d.mode === "place") {
      setPlacePreview(null);
      const deg = aimFrom(d.anchor, e.clientX, e.clientY);
      onPlace?.(d.anchor.x, d.anchor.y, deg ?? undefined);
      return;
    }
    if (d.mode === "wp") return;
    if (d.mode === "seg") {
      const { x, y } = toNorm(e.clientX, e.clientY);
      onAddWaypoint?.(d.id, d.index, x, y);
      return;
    }

    if (!d.moved) {
      onSelect?.(null);
    }
  };




  const coverageMarkers = useMemo(() => {
    if (coverage === "off") return [];
    if (coverage === "selected") {
      const m = markers.find((x) => x.id === selectedId);
      return m ? [m] : [];
    }
    return markers.filter((m) => m.marker_type === "wifi_ap" || m.marker_type === "camera");
  }, [coverage, markers, selectedId]);

  const coverageBase = Math.min(content.width, content.height) || 0;
  const markerPx = Math.max(14, 22 / zoom);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {placing
            ? "Click to place, then drag toward the area the camera must face"
            : editing
              ? "Drag planned devices · scroll or pinch to zoom · drag the plan to pan"
              : "Scroll or pinch to zoom · drag to pan"}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              zoomAt(1 / 1.4, el.clientWidth / 2, el.clientHeight / 2);
            }}
            className="border border-border p-2 hover:bg-muted transition-colors"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              zoomAt(1.4, el.clientWidth / 2, el.clientHeight / 2);
            }}
            className="border border-border p-2 hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Fit
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative overflow-hidden border border-border bg-muted/30 ${height} ${
          placing ? "cursor-crosshair" : "cursor-grab"
        }`}
        style={{ touchAction: "none" }}
      >
        {imageUrl ? (
          <div
            className="absolute left-0 top-0"
            style={{
              width: containerSize.width || "100%",
              height: containerSize.height || "100%",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Image content rectangle: the single coordinate space shared by the
                plan image, coverage overlays and markers. */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: content.left,
                top: content.top,
                width: content.width || undefined,
                height: content.height || undefined,
              }}
            >
              <img
                src={imageUrl}
                alt="Building floor plan"
                draggable={false}
                onLoad={(e) =>
                  setNatural({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight,
                  })
                }
                className="block w-full h-full select-none pointer-events-none"
              />

              {/* Coverage overlays — clipped to the plan image, never interactive. */}
              {coverageBase > 0 &&
                coverageMarkers.map((m) => {
                  const cx = `${Number(m.x_norm) * 100}%`;
                  const cy = `${Number(m.y_norm) * 100}%`;
                  if (m.marker_type === "camera") {
                    const dir = bearingToRotation(Number(m.direction_deg ?? 0));
                    const fov = Number(m.fov_deg ?? 90);
                    const r = coverageBase * (CAMERA_RANGE_RADIUS[m.coverage_range ?? "medium"] ?? 0.16);

                    return (
                      <React.Fragment key={`cov-${m.id}`}>
                        {/* Sector: apex exactly at the camera centre, centreline on the bearing. */}
                        <div
                          aria-hidden
                          className="absolute pointer-events-none"
                          style={{
                            left: cx,
                            top: cy,
                            width: r * 2,
                            height: r * 2,
                            marginLeft: -r,
                            marginTop: -r,
                            transform: `rotate(${dir}deg)`,
                            transformOrigin: "50% 50%",
                            background:
                              "radial-gradient(circle, hsl(32 100% 50% / 0.38) 0%, hsl(32 100% 50% / 0.16) 60%, hsl(32 100% 50% / 0) 100%)",
                            clipPath: sectorClipPath(fov),
                          }}
                        />
                        {/* Lens centreline, so the aim is unambiguous at any zoom. */}
                        <div
                          aria-hidden
                          className="absolute pointer-events-none"
                          style={{
                            left: cx,
                            top: cy,
                            width: 0,
                            height: r,
                            borderLeft: "1px dashed hsl(32 100% 45% / 0.85)",
                            transform: `rotate(${dir}deg) translateY(${-r}px)`,
                            transformOrigin: "0 0",
                          }}
                        />
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={`cov-${m.id}`}>
                      {[...COVERAGE_BANDS]
                        .slice()
                        .reverse()
                        .map((band) => {
                          const r = coverageBase * band.radius;
                          const alpha =
                            band.key === "strong" ? 0.3 : band.key === "good" ? 0.18 : 0.1;
                          return (
                            <div
                              key={`${m.id}-${band.key}`}
                              aria-hidden
                              className="absolute rounded-full pointer-events-none"
                              style={{
                                left: cx,
                                top: cy,
                                width: r * 2,
                                height: r * 2,
                                marginLeft: -r,
                                marginTop: -r,
                                background: `radial-gradient(circle, hsl(190 100% 45% / ${alpha}) 0%, hsl(190 100% 45% / ${alpha * 0.5}) 70%, hsl(190 100% 45% / 0) 100%)`,
                                border: `1px solid hsl(190 100% 45% / ${alpha + 0.15})`,
                              }}
                            />
                          );
                        })}
                    </React.Fragment>
                  );
                })}

              {markers.map((m) => {
                const draggable = canDrag ? canDrag(m) : true;
                const locked = editing && !draggable;
                const isSelected = selectedId === m.id;
                const isDraft = unsaved.has(m.id);
                const isCamera = m.marker_type === "camera";
                const isRack = m.marker_type === "rack";
                const dir = normalizeBearing(Number(m.direction_deg ?? 0));
                const showAim = isCamera && isSelected && !!onAim && draggable;
                const handleDist = markerPx * 1.9;
                const handle = aimOffsetPx(dir, handleDist);
                return (
                  <React.Fragment key={m.id}>
                    {/* Aim line from the camera centre to the handle. */}
                    {showAim && (
                      <div
                        aria-hidden
                        className="absolute pointer-events-none"
                        style={{
                          left: `${Number(m.x_norm) * 100}%`,
                          top: `${Number(m.y_norm) * 100}%`,
                          width: 0,
                          height: handleDist,
                          borderLeft: "2px solid hsl(32 100% 45%)",
                          transform: `rotate(${bearingToRotation(dir)}deg) translateY(${-handleDist}px)`,
                          transformOrigin: "0 0",
                          zIndex: 35,
                        }}
                      />
                    )}

                    <button
                      type="button"
                      data-marker-id={m.id}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      title={
                        locked
                          ? `${m.label} · ${m.status} — position locked. Only devices with a Planned status can be repositioned.`
                          : isCamera
                            ? `${m.label} · ${isDraft ? "unsaved draft" : m.status} · aim ${bearingText(dir)}${draggable ? " — drag to reposition, drag the handle to aim" : ""}`
                            : isRack
                              ? `${m.label} · ${m.model ?? "6U"} network rack · ${m.status}${draggable ? " — drag to the approved rack position, then save" : ""}`
                              : isDraft
                                ? `${m.label} · unsaved draft — drag to reposition, then save`
                                : editing
                                  ? `${m.label} · ${m.status} — drag to reposition`
                                  : `${m.label} · ${m.status}`
                      }
                      aria-label={
                        locked
                          ? `${m.label}, position locked (${m.status})`
                          : isCamera
                            ? `${m.label}, ${isDraft ? "unsaved draft" : m.status}, facing ${bearingText(dir)}`
                            : isRack
                              ? `${m.label}, ${m.model ?? "6U"} network rack, ${m.status}`
                              : `${m.label}, ${isDraft ? "unsaved draft" : m.status}`
                      }
                      aria-pressed={isSelected}
                      className={[
                        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center border bg-background/90 text-[7px] font-medium tracking-tight leading-none",
                        statusRing[m.status] ?? "border-solid",
                        isDraft
                          ? "border-dashed border-[hsl(32_100%_50%)] ring-1 ring-[hsl(32_100%_50%)]"
                          : isSelected
                            ? selectedRing(m.marker_type)
                            : isRack
                              ? "border-[hsl(268_85%_58%)] hover:border-[hsl(268_85%_45%)]"
                              : "border-foreground/70 hover:border-foreground",
                        isCamera || isRack ? "rounded-none" : "rounded-full",
                        isDraft ? "cursor-move" : editing ? (draggable ? "cursor-move" : "cursor-not-allowed opacity-70") : "",
                      ].join(" ")}
                      style={{
                        left: `${Number(m.x_norm) * 100}%`,
                        top: `${Number(m.y_norm) * 100}%`,
                        width: `${markerPx}px`,
                        height: `${markerPx}px`,
                        fontSize: `${Math.max(5, 8 / zoom)}px`,
                        color: isCamera
                          ? "hsl(32 100% 42%)"
                          : isRack
                            ? "hsl(268 85% 45%)"
                            : undefined,
                        background: isRack ? "hsl(268 85% 58% / 0.16)" : undefined,
                        zIndex: isSelected ? 30 : isDraft ? 20 : 10,
                      }}
                    >
                      {locked ? (
                        <Lock style={{ width: "60%", height: "60%" }} strokeWidth={2} />
                      ) : isCamera ? (
                        // Only the lens glyph rotates; the marker box stays upright.
                        <Video
                          aria-hidden
                          style={{
                            width: "72%",
                            height: "72%",
                            transform: `rotate(${bearingToRotation(dir - 90)}deg)`,
                            transformOrigin: "50% 50%",
                          }}
                          strokeWidth={2}
                        />
                      ) : isRack ? (
                        <>
                          <Server aria-hidden style={{ width: "52%", height: "52%" }} strokeWidth={2} />
                          <span style={{ fontSize: `${Math.max(4, 6 / zoom)}px` }}>
                            {m.model ?? "6U"}
                          </span>
                        </>
                      ) : (
                        kindShort(m.marker_type)
                      )}
                    </button>


                    {showAim && (
                      <span
                        data-aim-for={m.id}
                        role="slider"
                        tabIndex={-1}
                        aria-label={`Aim ${m.label}`}
                        aria-valuenow={dir}
                        aria-valuetext={bearingText(dir)}
                        aria-valuemin={0}
                        aria-valuemax={359}
                        title={`Drag to aim ${m.label} — currently ${bearingText(dir)}`}
                        className="absolute flex items-center justify-center rounded-full border cursor-grab"
                        style={{
                          left: `calc(${Number(m.x_norm) * 100}% + ${handle.dx}px)`,
                          top: `calc(${Number(m.y_norm) * 100}% + ${handle.dy}px)`,
                          width: `${markerPx * 0.85}px`,
                          height: `${markerPx * 0.85}px`,
                          marginLeft: `${-markerPx * 0.425}px`,
                          marginTop: `${-markerPx * 0.425}px`,
                          background: "hsl(32 100% 50%)",
                          borderColor: "hsl(32 100% 35%)",
                          color: "hsl(0 0% 100%)",
                          zIndex: 40,
                          touchAction: "none",
                        }}
                      >
                        <Video
                          aria-hidden
                          style={{
                            width: "62%",
                            height: "62%",
                            transform: `rotate(${bearingToRotation(dir - 90)}deg)`,
                          }}
                          strokeWidth={2.5}
                        />
                      </span>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Live placement gesture: position pinned, aim following the pointer. */}
              {placePreview && (
                <>
                  <div
                    aria-hidden
                    className="absolute -translate-x-1/2 -translate-y-1/2 border border-dashed rounded-none"
                    style={{
                      left: `${placePreview.x * 100}%`,
                      top: `${placePreview.y * 100}%`,
                      width: `${markerPx}px`,
                      height: `${markerPx}px`,
                      borderColor: "hsl(32 100% 45%)",
                      background: "hsl(32 100% 50% / 0.2)",
                      zIndex: 45,
                    }}
                  />
                  {placePreview.deg !== null && coverageBase > 0 && (
                    <>
                      <div
                        aria-hidden
                        className="absolute pointer-events-none"
                        style={{
                          left: `${placePreview.x * 100}%`,
                          top: `${placePreview.y * 100}%`,
                          width: coverageBase * 0.32,
                          height: coverageBase * 0.32,
                          marginLeft: -coverageBase * 0.16,
                          marginTop: -coverageBase * 0.16,
                          transform: `rotate(${bearingToRotation(placePreview.deg)}deg)`,
                          transformOrigin: "50% 50%",
                          background:
                            "radial-gradient(circle, hsl(32 100% 50% / 0.3) 0%, hsl(32 100% 50% / 0.12) 60%, hsl(32 100% 50% / 0) 100%)",
                          clipPath: sectorClipPath(90),
                          zIndex: 44,
                        }}
                      />
                      <div
                        aria-hidden
                        className="absolute pointer-events-none"
                        style={{
                          left: `${placePreview.x * 100}%`,
                          top: `${placePreview.y * 100}%`,
                          width: 0,
                          height: coverageBase * 0.16,
                          borderLeft: "2px solid hsl(32 100% 45%)",
                          transform: `rotate(${bearingToRotation(placePreview.deg)}deg) translateY(${-coverageBase * 0.16}px)`,
                          transformOrigin: "0 0",
                          zIndex: 46,
                        }}
                      />
                    </>
                  )}
                </>
              )}


            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
