import React from "react";
import { Camera, Radio, Server } from "lucide-react";
import { RACK_HUE } from "@/lib/floorPlans";
import { routeColor } from "@/lib/cableRoutes";
import { type RackEquipment } from "@/lib/rackEquipment";
import {
  RISER_DISCLAIMER,
  ROOFTOP_HOLD,
  backboneSummary,
  levelCode,
  statusText,
  type FloorSummary,
} from "@/lib/buildingView";

const cyan = routeColor("wifi_ap");
const amber = routeColor("camera");
const violet = `hsl(${RACK_HUE})`;

const Bar: React.FC<{ used: number; total: number; tone: string }> = ({ used, total, tone }) => (
  <div className="h-1.5 w-full bg-muted">
    <div
      className="h-full"
      style={{ width: `${total ? Math.min(100, (used / total) * 100) : 0}%`, background: tone }}
    />
  </div>
);

/** Mode C — schematic infrastructure section / riser. Not an architectural claim. */
const BuildingRiser: React.FC<{
  occupied: FloorSummary[];
  rooftop: FloorSummary[];
  equipment: RackEquipment[];
  selectedId: string | null;
  onSelect: (floorId: string) => void;
}> = ({ occupied, rooftop, equipment, selectedId, onSelect }) => {
  const backbone = backboneSummary([...occupied, ...rooftop], equipment);
  const rows = [
    ...[...rooftop].sort((a, b) => b.level - a.level),
    ...[...occupied].sort((a, b) => b.level - a.level),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Racks on occupied floors", occupied.filter((s) => s.racks > 0).length],
          [
            "Planned fibre uplinks",
            `${backbone.used} / ${backbone.portCount} SFP+ · ${backbone.spare} spare`,
          ],
          ["Rooftop racks", rooftop.reduce((t, s) => t + s.racks, 0)],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-light tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border">
        <ol>
          {rows.map((s) => {
            const active = s.floor.id === selectedId;
            const isGround = s.level === 0;
            return (
              <li key={s.floor.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(s.floor.id)}
                  aria-pressed={active}
                  className={[
                    "grid w-full gap-4 p-4 text-left md:grid-cols-[110px_1fr_260px] md:items-center",
                    active ? "bg-muted" : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                      {levelCode(s.level)}
                    </span>
                    {s.racks > 0 ? (
                      <Server className="h-4 w-4" strokeWidth={1.5} style={{ color: violet }} />
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        no rack
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">{s.floor.display_name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                      <span style={{ color: cyan }} className="inline-flex items-center gap-1">
                        <Radio className="h-3 w-3" strokeWidth={1.5} /> {s.aps} AP · {s.wifiRoutes} routes
                      </span>
                      <span style={{ color: amber }} className="inline-flex items-center gap-1">
                        <Camera className="h-3 w-3" strokeWidth={1.5} /> {s.cameras} CCTV ·{" "}
                        {s.cameraRoutes} routes
                      </span>
                      <span className="text-muted-foreground">{statusText[s.status]}</span>
                    </div>
                    {/* Riser spine */}
                    <div className="flex items-center gap-2">
                      <span
                        className="block h-[3px] flex-1"
                        style={{
                          background: s.racks > 0 && !s.isRooftop ? violet : "hsl(var(--border))",
                        }}
                      />
                      <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {s.isRooftop
                          ? "riser route pending"
                          : isGround
                            ? "fibre aggregation"
                            : "1 × fibre uplink to L00"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {s.switchModel ? (
                      <>
                        <p className="text-xs">
                          {s.switchModel}
                          {s.switchQty > 1 ? ` × ${s.switchQty}` : ""}
                          {s.hasAggregation ? " + GWN7832 aggregation" : ""}
                        </p>
                        {s.portCount ? (
                          <>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>
                                PoE ports {s.portsUsed} / {s.portCount}
                              </span>
                              <span>{s.portsSpare} spare</span>
                            </div>
                            <Bar used={s.portsUsed} total={s.portCount} tone={cyan} />
                          </>
                        ) : null}
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {s.rackUsedU}U used · {s.rackFreeU}U free
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        {s.isRooftop ? ROOFTOP_HOLD : "No rack equipment recorded"}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-4 border border-border p-4 text-[10px] uppercase tracking-[0.18em]">
        <span className="text-muted-foreground">Legend</span>
        <span className="inline-flex items-center gap-2" style={{ color: violet }}>
          <span className="block h-[3px] w-6" style={{ background: violet }} /> Fibre backbone / rack
        </span>
        <span className="inline-flex items-center gap-2" style={{ color: cyan }}>
          <span className="block h-[3px] w-6" style={{ background: cyan }} /> Wi-Fi / PoE
        </span>
        <span className="inline-flex items-center gap-2" style={{ color: amber }}>
          <span className="block h-[3px] w-6" style={{ background: amber }} /> CCTV / PoE
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{RISER_DISCLAIMER}</p>
    </div>
  );
};

export default BuildingRiser;
