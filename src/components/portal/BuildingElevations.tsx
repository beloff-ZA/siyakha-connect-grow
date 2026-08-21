import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import {
  ARCHITECTURAL_CAPTION,
  BAND_NOTE,
  ELEVATION_SOURCE,
  levelBand,
  levelCode,
  type ElevationSheet,
  type FloorSummary,
} from "@/lib/buildingView";

type View = { zoom: number; x: number; y: number };
const RESET: View = { zoom: 1, x: 0, y: 0 };
const FOCUS: View = { zoom: 1.35, x: -30, y: -60 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Mode B — architect's LA-101 / LA-102 sheets with preliminary level bands. */
const BuildingElevations: React.FC<{
  sheets: ElevationSheet[];
  levels: FloorSummary[];
  selectedId: string | null;
  onSelect: (floorId: string) => void;
  onOpenPlan: (floorId: string) => void;
}> = ({ sheets, levels, selectedId, onSelect, onOpenPlan }) => {
  const [sheetId, setSheetId] = useState(sheets[0]?.id ?? "");
  const [view, setView] = useState<View>(RESET);
  const [bands, setBands] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const sheet = sheets.find((s) => s.id === sheetId) ?? sheets[0] ?? null;
  const selected = levels.find((l) => l.floor.id === selectedId) ?? null;

  const applyWheel = useCallback((e: WheelEvent) => {
    const box = boxRef.current;
    if (!box) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const rect = box.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setView((v) => {
      const next = clamp(v.zoom * Math.exp(-dy * 0.0015), 0.5, 6);
      const k = next / v.zoom;
      return { zoom: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyWheel(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyWheel]);

  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Elevation sheets">
          {sheets.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === sheet?.id}
              onClick={() => {
                setSheetId(s.id);
                setView(RESET);
              }}
              className={[
                "border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors",
                s.id === sheet?.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted",
              ].join(" ")}
            >
              {s.label} · {s.drawing}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setBands((b) => !b)}
            aria-pressed={bands}
            className={[
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]",
              bands ? "border-foreground bg-muted" : "border-border hover:bg-muted",
            ].join(" ")}
          >
            Level bands
          </button>
          <button
            type="button"
            onClick={() => setView(RESET)}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] hover:bg-muted"
          >
            <Maximize2 className="h-3 w-3" strokeWidth={1.5} /> Full sheet
          </button>
          <button
            type="button"
            onClick={() => setView(FOCUS)}
            className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] hover:bg-muted"
          >
            Focus elevation
          </button>
          <button
            type="button"
            onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom - 0.25, 0.5, 6) }))}
            aria-label="Zoom out"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <Minus className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <span className="w-10 text-center text-[10px] tabular-nums text-muted-foreground">
            {Math.round(view.zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom + 0.25, 0.5, 6) }))}
            aria-label="Zoom in"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setView(RESET)}
            aria-label="Reset view"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className="relative h-[460px] overflow-hidden border border-border bg-background md:h-[620px]"
        style={{ touchAction: "none", cursor: drag.current ? "grabbing" : "grab" }}
        onPointerDown={(e) => {
          drag.current = { id: e.pointerId, x: e.clientX - view.x, y: e.clientY - view.y };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          setView((v) => ({ ...v, x: e.clientX - d.x, y: e.clientY - d.y }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {sheet && (
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
              transformOrigin: "0 0",
            }}
          >
            <div className="relative">
              <img
                src={sheet.url}
                alt={sheet.alt}
                className="block w-full select-none"
                draggable={false}
              />
              {bands && (
                <div className="absolute inset-0">
                  {levels.map((l) => {
                    const band = levelBand(l.level);
                    const active = l.floor.id === selectedId;
                    return (
                      <button
                        key={l.floor.id}
                        type="button"
                        onClick={() => onSelect(l.floor.id)}
                        aria-pressed={active}
                        title={`${l.floor.display_name} — ${BAND_NOTE}`}
                        className="absolute left-0 flex w-full items-center gap-2 border-y px-2 text-left transition-colors"
                        style={{
                          top: `${band.top * 100}%`,
                          height: `${band.height * 100}%`,
                          borderColor: active ? "hsl(var(--foreground))" : "transparent",
                          background: active
                            ? "hsl(var(--foreground) / 0.10)"
                            : "hsl(var(--foreground) / 0.02)",
                        }}
                      >
                        <span
                          className="border bg-background/85 px-1 font-mono text-[8px] tracking-[0.12em]"
                          style={{ borderColor: "hsl(var(--border))" }}
                        >
                          {levelCode(l.level)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Floor bands · {BAND_NOTE} — navigation aid only
        </p>
        {selected && (
          <button
            type="button"
            onClick={() => onOpenPlan(selected.floor.id)}
            className="border border-foreground px-4 py-2 text-[10px] uppercase tracking-[0.18em] hover:bg-foreground hover:text-background"
          >
            Open floor plan · {selected.floor.display_name}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Source: {ELEVATION_SOURCE} {ARCHITECTURAL_CAPTION}
      </p>
    </div>
  );
};

export default BuildingElevations;
