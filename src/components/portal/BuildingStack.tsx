import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Cable, Maximize2, Minus, Plus, RotateCcw, Radio, Server } from "lucide-react";
import { RACK_HUE } from "@/lib/floorPlans";
import { routeColor } from "@/lib/cableRoutes";
import {
  ARCHITECTURAL_CAPTION,
  OCCUPANCY_LABEL,
  ROOFTOP_HOLD,
  TYPICAL_PLAN_NOTE,
  floorUseLabel,
  levelCode,
  statusText,
  type FloorSummary,
} from "@/lib/buildingView";
import { useIsMobile } from "@/hooks/use-mobile";

const cyan = routeColor("wifi_ap");
const amber = routeColor("camera");
const violet = `hsl(${RACK_HUE})`;

export type StackFilters = {
  wifi_ap: boolean;
  camera: boolean;
  rack: boolean;
  cable_route: boolean;
  backbone: boolean;
};

export const DEFAULT_FILTERS: StackFilters = {
  wifi_ap: true,
  camera: true,
  rack: true,
  cable_route: true,
  backbone: true,
};

export const FILTER_OPTIONS: { key: keyof StackFilters; label: string; tone: string }[] = [
  { key: "wifi_ap", label: "Wi-Fi APs", tone: cyan },
  { key: "camera", label: "CCTV", tone: amber },
  { key: "rack", label: "Racks", tone: violet },
  { key: "cable_route", label: "Cable routes", tone: "hsl(var(--foreground))" },
  { key: "backbone", label: "Fibre backbone", tone: violet },
];

const Chip: React.FC<{ tone: string; children: React.ReactNode }> = ({ tone, children }) => (
  <span
    className="inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] whitespace-nowrap"
    style={{ borderColor: tone, color: tone }}
  >
    {children}
  </span>
);

/** Live per-floor indicator chips, honouring the layer toggles. */
export const FloorChips: React.FC<{ s: FloorSummary; filters: StackFilters }> = ({ s, filters }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {filters.wifi_ap && (
      <Chip tone={cyan}>
        <Radio className="h-3 w-3" strokeWidth={1.5} /> {s.aps} AP
      </Chip>
    )}
    {filters.camera && (
      <Chip tone={amber}>
        <Camera className="h-3 w-3" strokeWidth={1.5} /> {s.cameras} CCTV
      </Chip>
    )}
    {filters.rack && (
      <Chip tone={violet}>
        <Server className="h-3 w-3" strokeWidth={1.5} /> {s.racks} rack
      </Chip>
    )}
    {filters.cable_route && (
      <Chip tone="hsl(var(--muted-foreground))">
        <Cable className="h-3 w-3" strokeWidth={1.5} /> {s.routes} routes
      </Chip>
    )}
    {filters.backbone && s.switchModel && (
      <Chip tone="hsl(var(--muted-foreground))">
        {s.switchModel}
        {s.switchQty > 1 ? ` × ${s.switchQty}` : ""}
        {s.portCount ? ` · ${s.portsUsed}/${s.portCount} ports · ${s.portsSpare} spare` : ""}
      </Chip>
    )}
  </div>
);

const SlabFace: React.FC<{
  s: FloorSummary;
  planUrl?: string;
  active: boolean;
}> = ({ s, planUrl, active }) => (
  <div
    className="relative h-[54px] w-full border transition-colors"
    style={{
      borderColor: active ? "hsl(var(--foreground))" : "hsl(var(--border))",
      background: active ? "hsl(var(--muted))" : "hsl(var(--background))",
    }}
  >
    {planUrl && (
      <img
        src={planUrl}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.22] grayscale"
      />
    )}
    <div className="relative flex h-full items-center justify-between gap-4 px-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          {levelCode(s.level)}
        </span>
        <span className="text-xs">{floorUseLabel(s.floor.floor_use)}</span>
      </div>
      <div className="hidden items-center gap-3 text-[10px] uppercase tracking-[0.16em] sm:flex">
        <span style={{ color: cyan }}>{s.aps} AP</span>
        <span style={{ color: amber }}>{s.cameras} CAM</span>
        <span style={{ color: violet }}>{s.racks} RK</span>
      </div>
    </div>
    <span
      className="absolute inset-x-0 -bottom-[6px] block h-[6px]"
      style={{ background: active ? "hsl(var(--foreground) / 0.5)" : "hsl(var(--border))" }}
    />
  </div>
);

/** Mode A — exploded high-rise stack. Read-only navigation; never moves coordinates. */
const BuildingStack: React.FC<{
  occupied: FloorSummary[];
  rooftop: FloorSummary[];
  planUrls: Record<string, string>;
  selectedId: string | null;
  onSelect: (floorId: string) => void;
  filters: StackFilters;
}> = ({ occupied, rooftop, planUrls, selectedId, onSelect, filters }) => {
  const isMobile = useIsMobile();
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const descending = useMemo(() => [...occupied].sort((a, b) => b.level - a.level), [occupied]);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const stack = stackRef.current;
    if (!wrap || !stack) return;
    const h = stack.scrollHeight / (zoom || 1);
    const target = Math.min(1.4, Math.max(0.5, (wrap.clientHeight - 24) / Math.max(1, h)));
    setZoom(Number(target.toFixed(2)));
  }, [zoom]);

  useEffect(() => {
    if (isMobile) setZoom(1);
  }, [isMobile]);

  const rows = [...rooftop.sort((a, b) => b.level - a.level), ...descending];

  const Row: React.FC<{ s: FloorSummary; cap?: boolean }> = ({ s, cap }) => {
    const active = s.floor.id === selectedId;
    return (
      <div className={cap ? "mb-5" : ""}>
        <button
          type="button"
          onClick={() => onSelect(s.floor.id)}
          aria-pressed={active}
          aria-label={`${s.floor.display_name} — ${s.aps} Wi-Fi access points, ${s.cameras} CCTV cameras, ${s.racks} racks, ${s.routes} cable routes`}
          className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          style={{
            transform: isMobile ? undefined : `translateX(${active ? -10 : 0}px)`,
            transition: "transform 240ms ease",
          }}
        >
          <div
            className="origin-left motion-safe:transition-transform"
            style={
              isMobile
                ? undefined
                : { transform: `skewY(-5deg) ${active ? "scale(1.015)" : "scale(1)"}` }
            }
          >
            <SlabFace s={s} planUrl={planUrls[s.floor.id]} active={active} />
          </div>
        </button>
        {cap && (
          <p className="mt-3 pl-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Rooftop / service cap · no rack
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {OCCUPANCY_LABEL}
        </p>
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={fit}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] hover:bg-muted"
          >
            <Maximize2 className="h-3 w-3" strokeWidth={1.5} /> Fit building
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
            aria-label="Zoom out"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <Minus className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <span className="w-10 text-center text-[10px] tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
            aria-label="Zoom in"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
            className="border border-border p-1.5 hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="max-h-[720px] overflow-auto border border-border bg-muted/20 p-5 md:p-8"
      >
        <div
          ref={stackRef}
          className="mx-auto max-w-xl space-y-[10px] origin-top motion-safe:transition-transform"
          style={isMobile ? undefined : { transform: `scale(${zoom})` }}
        >
          {rows.map((s) => (
            <Row key={s.floor.id} s={s} cap={s.isRooftop} />
          ))}
        </div>
      </div>

      {rooftop.length > 0 && (
        <p className="text-xs text-muted-foreground leading-relaxed">{ROOFTOP_HOLD}</p>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {TYPICAL_PLAN_NOTE}. {ARCHITECTURAL_CAPTION} Read-only overview — device positions are
        edited in the Floor plans module only.
      </p>
    </div>
  );
};

export const StatusLine: React.FC<{ s: FloorSummary }> = ({ s }) => (
  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    {statusText[s.status]}
  </span>
);

export default BuildingStack;
