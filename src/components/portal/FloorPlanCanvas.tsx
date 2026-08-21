import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { clamp01, kindShort, type FloorMarker } from "@/lib/floorPlans";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 8;

type Props = {
  imageUrl: string | null;
  markers: FloorMarker[];
  selectedId?: string | null;
  onSelect?: (marker: FloorMarker) => void;
  /** Admin-only: click on empty plan to place a marker at normalised coords. */
  onPlace?: (x: number, y: number) => void;
  /** Admin-only: drag a marker to new normalised coords. */
  onMove?: (markerId: string, x: number, y: number) => void;
  placing?: boolean;
  height?: string;
  emptyLabel?: string;
};

const statusRing: Record<string, string> = {
  planned: "border-dashed",
  installed: "border-solid",
  tested: "border-solid",
  active: "border-solid",
};

const FloorPlanCanvas: React.FC<Props> = ({
  imageUrl,
  markers,
  selectedId,
  onSelect,
  onPlace,
  onMove,
  placing = false,
  height = "h-[60vh] md:h-[70vh]",
  emptyLabel = "Plan image not available yet.",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stateRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  stateRef.current = { zoom, offset };

  const dragRef = useRef<
    | { mode: "pan"; startX: number; startY: number; ox: number; oy: number; moved: boolean }
    | { mode: "marker"; id: string; startX: number; startY: number; moved: boolean }
    | null
  >(null);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [imageUrl, reset]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
    const k = next / z;
    setZoom(next);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
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

  const stageCoords = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0.5, y: 0.5 };
    const r = stage.getBoundingClientRect();
    return { x: clamp01((clientX - r.left) / r.width), y: clamp01((clientY - r.top) / r.height) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const markerId = target.closest("[data-marker-id]")?.getAttribute("data-marker-id");
    if (markerId) {
      dragRef.current = { mode: "marker", id: markerId, startX: e.clientX, startY: e.clientY, moved: false };
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
    const far = Math.abs(e.clientX - d.startX) > 3 || Math.abs(e.clientY - d.startY) > 3;
    if (far) d.moved = true;
    if (d.mode === "pan") {
      setOffset({ x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) });
    } else if (onMove && d.moved) {
      const { x, y } = stageCoords(e.clientX, e.clientY);
      onMove(d.id, x, y);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.mode === "marker") {
      if (!d.moved) {
        const m = markers.find((x) => x.id === d.id);
        if (m) onSelect?.(m);
      }
      return;
    }
    if (!d.moved && placing && onPlace) {
      const { x, y } = stageCoords(e.clientX, e.clientY);
      onPlace(x, y);
    }
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Scroll or pinch to zoom · drag to pan
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
        onClick={handleClick}
        className={`relative overflow-hidden border border-border bg-muted/30 ${height} ${
          placing ? "cursor-crosshair" : "cursor-grab"
        }`}
        style={{ touchAction: "none" }}
      >
        {imageUrl ? (
          <div
            className="absolute left-0 top-0 w-full h-full"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            <div ref={stageRef} className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Building floor plan"
                draggable={false}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
              {markers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-marker-id={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(m);
                  }}
                  title={`${m.label} · ${m.status}`}
                  className={[
                    "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border bg-background/90 text-[7px] font-medium tracking-tight",
                    statusRing[m.status] ?? "border-solid",
                    selectedId === m.id
                      ? "border-foreground ring-2 ring-foreground/40"
                      : "border-foreground/70 hover:border-foreground",
                    m.marker_type === "camera" ? "rounded-none" : "rounded-full",
                  ].join(" ")}
                  style={{
                    left: `${Number(m.x_norm) * 100}%`,
                    top: `${Number(m.y_norm) * 100}%`,
                    width: `${Math.max(14, 22 / zoom)}px`,
                    height: `${Math.max(14, 22 / zoom)}px`,
                    fontSize: `${Math.max(5, 8 / zoom)}px`,
                  }}
                >
                  {kindShort(m.marker_type)}
                </button>
              ))}
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
