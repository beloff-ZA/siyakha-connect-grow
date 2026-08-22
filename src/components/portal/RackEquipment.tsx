import React from "react";
import { Cpu, Network, Server } from "lucide-react";
import { RACK_HUE, type FloorMarker, type PortalFloor } from "@/lib/floorPlans";
import { RackEquipmentEditor } from "@/components/portal/RackEquipmentEditor";
import { routeColor } from "@/lib/cableRoutes";
import {
  ACCESS_SWITCH_MODEL,
  AGGREGATION_SWITCH_MODEL,
  BACKBONE_DISCLAIMER,
  BACKBONE_UPLINK_LEVELS,
  EQUIPMENT_DISCLAIMER,
  RACK_CAPACITY_U,
  accessPortUtilisation,
  backbonePortUtilisation,
  equipmentTotals,
  equipmentPurpose,
  equipmentTypeLabel,
  TBC,
  rackUtilisation,
  type RackEquipment as RackEquipmentRow,
} from "@/lib/rackEquipment";

const violet = `hsl(${RACK_HUE})`;

const Badge: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone }) => (
  <span
    className="border px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
    style={{ borderColor: tone ?? "hsl(var(--border))", color: tone ?? undefined }}
  >
    {children}
  </span>
);

const Bar: React.FC<{ used: number; total: number; tone: string }> = ({ used, total, tone }) => (
  <div className="h-1.5 w-full bg-muted">
    <div
      className="h-full transition-all"
      style={{ width: `${total ? Math.min(100, (used / total) * 100) : 0}%`, background: tone }}
    />
  </div>
);

/** 6U elevation + live port utilisation for one rack. */
export const RackContents: React.FC<{
  rack: FloorMarker;
  floor: PortalFloor | null;
  items: RackEquipmentRow[];
  routes: { floor_id: string; service_type: string }[];
  canManage?: boolean;
  onSaved?: () => void;
}> = ({ rack, floor, items, routes, canManage = false, onSaved }) => {
  const ordered = [...items].sort(
    (a, b) => (a.rack_position ?? a.sort_order) - (b.rack_position ?? b.sort_order),
  );
  const util = rackUtilisation(ordered);


  return (
    <div className="mt-6 border border-border p-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Rack contents · {RACK_CAPACITY_U}U elevation
        </p>
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: violet }}>
          {util.usedU}U used / {util.freeU}U free
        </span>
      </div>

      {ordered.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No equipment recorded in {rack.label} yet.
        </p>
      ) : (
        <>
          {/* Elevation */}
          <ol className="border border-border divide-y divide-border">
            {ordered.map((e, i) => {
              const isAgg = e.model === AGGREGATION_SWITCH_MODEL;
              const tone = isAgg ? routeColor("camera") : routeColor("wifi_ap");
              const access = accessPortUtilisation(
                e.copper_ports ?? e.port_count ?? 24,
                routes,
                rack.floor_id,
              );
              const ports = isAgg
                ? backbonePortUtilisation(e.sfp_plus_ports ?? e.port_count ?? 12)
                : access;
              return (
                <li key={e.id} className="p-3 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 border border-border px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        U{e.rack_position ?? i + 1}
                      </span>
                      <div>
                        <p className="text-sm">
                          {e.equipment_name ?? `${e.manufacturer} ${e.model}`}
                          {e.quantity > 1 ? ` × ${e.quantity}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.role ?? e.description ?? equipmentTypeLabel(e.equipment_type)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {equipmentPurpose(e.model)}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5">
                          Serial {e.serial_number ?? TBC} · MAC {e.mac_address ?? TBC}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isAgg ? (
                        <Cpu className="h-3.5 w-3.5" strokeWidth={1.5} />
                      ) : (
                        <Network className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                      <Badge>{e.rack_units}U</Badge>
                      {e.copper_ports ? <Badge>{e.copper_ports} × Gigabit copper</Badge> : null}
                      {e.sfp_plus_ports ? <Badge>{e.sfp_plus_ports} × SFP+</Badge> : null}
                      {e.poe_capable && <Badge tone={tone}>PoE</Badge>}
                      <Badge tone={tone}>{e.network_layer ?? (e.layer3_capable ? "Layer 3" : "Layer 2")}</Badge>
                      <Badge>{e.status}</Badge>
                      {canManage && <RackEquipmentEditor item={e} onSaved={onSaved} />}
                    </div>
                  </div>


                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>
                        {isAgg ? "Planned fibre uplinks" : "Connected device routes"}:{" "}
                        <span className="text-foreground">
                          {ports.used} / {ports.portCount} {isAgg ? "SFP+" : "ports"}
                        </span>
                      </span>
                      <span>
                        {ports.spare} spare
                        {!isAgg && ` · ${access.wifi} Wi-Fi · ${access.camera} CCTV`}
                      </span>
                    </div>
                    <Bar used={ports.used} total={ports.portCount} tone={tone} />
                    {!isAgg && access.over > 0 && (
                      <p className="text-[11px] text-foreground">
                        {access.over} device route(s) beyond a single {e.model} — additional switch
                        capacity to be confirmed during the site survey.
                      </p>
                    )}
                  </div>

                  {e.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{e.notes}</p>
                  )}
                </li>
              );
            })}
            {Array.from({ length: util.freeU }).map((_, i) => (
              <li
                key={`free-${i}`}
                className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                U{util.usedU + i + 1} · Spare
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {floor ? `${floor.display_name} · ` : ""}
            {EQUIPMENT_DISCLAIMER}
          </p>
        </>
      )}
    </div>
  );
};

/** Compact preliminary backbone view: Level 1–10 access switches → ground-floor aggregation. */
export const BuildingBackbone: React.FC<{
  floors: PortalFloor[];
  racks: FloorMarker[];
  equipment: RackEquipmentRow[];
  onSelectFloor?: (floorId: string) => void;
}> = ({ floors, racks, equipment, onSelectFloor }) => {
  const floorOf = new Map(floors.map((f) => [f.id, f]));
  const rackByLevel = new Map<number, FloorMarker>();
  racks.forEach((r) => {
    const f = floorOf.get(r.floor_id);
    if (f) rackByLevel.set(f.level_number, r);
  });
  const agg = equipment.find((e) => e.model === AGGREGATION_SWITCH_MODEL);
  const ports = backbonePortUtilisation(agg?.port_count ?? 12);
  const groundRack = rackByLevel.get(0) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {BACKBONE_UPLINK_LEVELS.map((lvl) => {
            const rack = rackByLevel.get(lvl);
            return (
              <button
                key={lvl}
                type="button"
                disabled={!rack}
                onClick={() => rack && onSelectFloor?.(rack.floor_id)}
                className="border border-border p-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  L{String(lvl).padStart(2, "0")}
                </p>
                <p className="text-xs mt-1">{ACCESS_SWITCH_MODEL}</p>
                <p className="text-[10px] text-muted-foreground">1 × 10G uplink</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center py-2 md:px-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            10 × planned fibre uplinks →
          </span>
        </div>

        <button
          type="button"
          disabled={!groundRack}
          onClick={() => groundRack && onSelectFloor?.(groundRack.floor_id)}
          className="border p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
          style={{ borderColor: violet }}
        >
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" strokeWidth={1.5} style={{ color: violet }} />
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: violet }}>
              Ground floor · backbone hub
            </p>
          </div>
          <p className="mt-2 text-sm">Grandstream {AGGREGATION_SWITCH_MODEL}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Layer 3 fibre aggregation · {ports.used} / {ports.portCount} × 10G SFP+ planned ·{" "}
            {ports.spare} spare
          </p>
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{BACKBONE_DISCLAIMER}</p>
    </div>
  );
};

/** Project-wide rack equipment schedule. */
export const EquipmentSchedule: React.FC<{
  floors: PortalFloor[];
  racks: FloorMarker[];
  equipment: RackEquipmentRow[];
  routes: { floor_id: string; service_type: string }[];
  onSelectFloor?: (floorId: string) => void;
}> = ({ floors, racks, equipment, routes, onSelectFloor }) => {
  const floorOf = new Map(floors.map((f) => [f.id, f]));
  const rackOf = new Map(racks.map((r) => [r.id, r]));
  const totals = equipmentTotals(equipment);
  const rows = [...equipment].sort((a, b) => {
    const fa = floorOf.get(rackOf.get(a.rack_marker_id)?.floor_id ?? "")?.level_number ?? 0;
    const fb = floorOf.get(rackOf.get(b.rack_marker_id)?.floor_id ?? "")?.level_number ?? 0;
    return fa - fb || a.sort_order - b.sort_order;
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Access switches (GWN7813P)", totals.accessSwitches],
          ["Aggregation switches (GWN7832)", totals.aggregationSwitches],
          ["Total equipment records", totals.records],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-light tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <th className="text-left py-3 pr-4">Level</th>
              <th className="text-left py-3 pr-4">Rack</th>
              <th className="text-left py-3 pr-4">Equipment</th>
              <th className="text-left py-3 pr-4">Type</th>
              <th className="text-left py-3 pr-4">Ports</th>
              <th className="text-left py-3 pr-4">Used</th>
              <th className="text-left py-3">U</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const rack = rackOf.get(e.rack_marker_id);
              const f = rack ? floorOf.get(rack.floor_id) : null;
              const isAgg = e.model === AGGREGATION_SWITCH_MODEL;
              const ports = isAgg
                ? backbonePortUtilisation(e.port_count ?? 12)
                : accessPortUtilisation(e.port_count ?? 24, routes, rack?.floor_id ?? "");
              return (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => rack && onSelectFloor?.(rack.floor_id)}
                >
                  <td className="py-3 pr-4 text-muted-foreground">{f?.display_name ?? "—"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{rack?.label ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {e.manufacturer} {e.model}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {equipmentTypeLabel(e.equipment_type)}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {e.port_count ?? "—"} {e.port_type ? `× ${e.port_type}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {ports.used} / {ports.portCount}
                  </td>
                  <td className="py-3 text-muted-foreground">{e.rack_units}U</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{EQUIPMENT_DISCLAIMER}</p>
    </div>
  );
};
