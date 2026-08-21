import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Maximize2, Minus, Plus, Video } from "lucide-react";
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
  height?: string;
  emptyLabel?: string;
};

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

  /** Bearing in degrees from a marker centre to a pointer, 0 = up/north. */
  const aimDeg = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const m = markers.find((x) => x.id === id);
      if (!m) return 0;
      const { x, y } = toNorm(clientX, clientY);
      const c = contentRef.current;
      const dx = (x - Number(m.x_norm)) * (c.width || 1);
      const dy = (y - Number(m.y_norm)) * (c.height || 1);
      const deg = Math.round((Math.atan2(dx, -dy) * 180) / Math.PI);
      return ((deg % 360) + 360) % 360;
    },
    [markers, toNorm],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const aimId = target.closest("[data-aim-for]")?.getAttribute("data-aim-for");
    const markerId = target.closest("[data-marker-id]")?.getAttribute("data-marker-id");
    if (aimId) {
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

    if (!d.moved) {
      if (placing && onPlace) {
        // Clicks in the letterboxed area around the plan must never create a device.
        if (!insideImage(e.clientX, e.clientY)) return;
        const { x, y } = toNorm(e.clientX, e.clientY);
        onPlace(x, y);
      } else {
        onSelect?.(null);
      }
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
          {editing
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
                    const dir = Number(m.direction_deg ?? 0);
                    const fov = Number(m.fov_deg ?? 90);
                    const r = coverageBase * (CAMERA_RANGE_RADIUS[m.coverage_range ?? "medium"] ?? 0.16);

                    return (
                      <div
                        key={`cov-${m.id}`}
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
                          background:
                            "radial-gradient(circle, hsl(32 100% 50% / 0.38) 0%, hsl(32 100% 50% / 0.16) 60%, hsl(32 100% 50% / 0) 100%)",
                          clipPath: `polygon(50% 50%, ${50 - Math.tan((Math.min(fov, 170) / 2) * (Math.PI / 180)) * 50}% 0%, ${50 + Math.tan((Math.min(fov, 170) / 2) * (Math.PI / 180)) * 50}% 0%)`,
                        }}
                      />
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
                const showAim = isCamera && isSelected && !!onAim && draggable;
                const handleDist = markerPx * 1.9;
                return (
                  <React.Fragment key={m.id}>
                    <button
                      type="button"
                      data-marker-id={m.id}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      title={
                        locked
                          ? `${m.label} · ${m.status} — position locked. Only devices with a Planned status can be repositioned.`
                          : isDraft
                            ? `${m.label} · unsaved draft — drag to reposition, then save`
                            : editing
                              ? `${m.label} · ${m.status} — drag to reposition`
                              : `${m.label} · ${m.status}`
                      }
                      aria-label={
                        locked
                          ? `${m.label}, position locked (${m.status})`
                          : `${m.label}, ${isDraft ? "unsaved draft" : m.status}`
                      }
                      aria-pressed={isSelected}
                      className={[
                        "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border bg-background/90 text-[7px] font-medium tracking-tight",
                        statusRing[m.status] ?? "border-solid",
                        isDraft
                          ? "border-dashed border-[hsl(32_100%_50%)] ring-1 ring-[hsl(32_100%_50%)] animate-pulse"
                          : isSelected
                            ? selectedRing(m.marker_type)
                            : "border-foreground/70 hover:border-foreground",
                        isCamera ? "rounded-none" : "rounded-full",
                        isDraft ? "cursor-move" : editing ? (draggable ? "cursor-move" : "cursor-not-allowed opacity-70") : "",
                      ].join(" ")}
                      style={{
                        left: `${Number(m.x_norm) * 100}%`,
                        top: `${Number(m.y_norm) * 100}%`,
                        width: `${markerPx}px`,
                        height: `${markerPx}px`,
                        fontSize: `${Math.max(5, 8 / zoom)}px`,
                        color: isCamera ? "hsl(32 100% 42%)" : undefined,
                        zIndex: isSelected ? 30 : isDraft ? 20 : 10,
                      }}
                    >
                      {locked ? (
                        <Lock style={{ width: "60%", height: "60%" }} strokeWidth={2} />
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
                        aria-valuenow={Number(m.direction_deg ?? 0)}
                        aria-valuemin={0}
                        aria-valuemax={359}
                        title={`Drag to aim ${m.label}`}
                        className="absolute flex items-center justify-center rounded-full border cursor-grab"
                        style={{
                          left: `calc(${Number(m.x_norm) * 100}% + ${Math.sin((Number(m.direction_deg ?? 0) * Math.PI) / 180) * handleDist}px)`,
                          top: `calc(${Number(m.y_norm) * 100}% - ${Math.cos((Number(m.direction_deg ?? 0) * Math.PI) / 180) * handleDist}px)`,
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
                        <RotateCw style={{ width: "62%", height: "62%" }} strokeWidth={2.5} />
                      </span>
                    )}
                  </React.Fragment>
                );
              })}

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
