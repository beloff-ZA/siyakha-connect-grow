/**
 * Read-only derivation layer for the "Building view" module of the
 * 353 Anton Lembede Street client portal.
 *
 * Everything here is derived LIVE from portal_floors, portal_floor_markers,
 * portal_cable_routes and portal_rack_equipment. Nothing in this file may
 * hard-code device, rack or route counts, and nothing here writes data.
 */

import { type FloorMarker, type PortalFloor } from "@/lib/floorPlans";
import { type CableRoute } from "@/lib/cableRoutes";
import {
  ACCESS_SWITCH_MODEL,
  AGGREGATION_SWITCH_MODEL,
  accessPortUtilisation,
  backbonePortUtilisation,
  rackUtilisation,
  type RackEquipment,
} from "@/lib/rackEquipment";

/** Highest level that counts as an occupied storey. Level 11 is the rooftop/service cap. */
export const TOP_OCCUPIED_LEVEL = 10;
export const ROOFTOP_LEVEL = 11;

export const OCCUPANCY_LABEL = "11 occupied levels + rooftop/service level";

export const TYPICAL_PLAN_NOTE =
  "Typical accommodation architecture — independent device plan";

export const ARCHITECTURAL_CAPTION =
  "Architectural reference — infrastructure overlays remain preliminary.";

export const ELEVATION_SOURCE =
  "Council Submission LTK 207_353 · LA-101 / LA-102 · 12 August 2026.";

export const RISER_DISCLAIMER =
  "Preliminary infrastructure section — confirm riser, containment, cable lengths and rooftop routes during the site survey.";

export const ROOFTOP_HOLD =
  "Final riser/home-rack route pending — rooftop devices have no local rack.";

export const BAND_NOTE = "Preliminary alignment";

export type ImplementationStatus =
  | "no_devices"
  | "planned"
  | "in_progress"
  | "commissioned";

export const statusText: Record<ImplementationStatus, string> = {
  no_devices: "No devices recorded",
  planned: "Planned",
  installed: "Installed",
  in_progress: "Installation in progress",
  commissioned: "Tested / active",
} as unknown as Record<ImplementationStatus, string>;

export type FloorSummary = {
  floor: PortalFloor;
  level: number;
  isRooftop: boolean;
  aps: number;
  cameras: number;
  racks: number;
  otherDevices: number;
  routes: number;
  wifiRoutes: number;
  cameraRoutes: number;
  rackMarkers: FloorMarker[];
  equipment: RackEquipment[];
  switchModel: string | null;
  switchQty: number;
  hasAggregation: boolean;
  portCount: number | null;
  portsUsed: number;
  portsSpare: number;
  rackUsedU: number;
  rackFreeU: number;
  status: ImplementationStatus;
};

const deviceStatus = (markers: FloorMarker[]): ImplementationStatus => {
  const devices = markers.filter((m) => m.marker_type !== "cable_route");
  if (devices.length === 0) return "no_devices";
  if (devices.every((m) => m.status === "tested" || m.status === "active")) return "commissioned";
  if (devices.some((m) => m.status !== "planned")) return "in_progress";
  return "planned";
};

export function summariseFloor(
  floor: PortalFloor,
  markers: FloorMarker[],
  routes: CableRoute[],
  equipment: RackEquipment[],
): FloorSummary {
  const fm = markers.filter((m) => m.floor_id === floor.id);
  const fr = routes.filter((r) => r.floor_id === floor.id);
  const rackMarkers = fm.filter((m) => m.marker_type === "rack");
  const rackIds = new Set(rackMarkers.map((r) => r.id));
  const equip = equipment.filter((e) => rackIds.has(e.rack_marker_id));
  const access = equip.find((e) => e.model === ACCESS_SWITCH_MODEL) ?? null;
  const agg = equip.find((e) => e.model === AGGREGATION_SWITCH_MODEL) ?? null;
  const util = rackUtilisation(equip);
  const ports = access
    ? accessPortUtilisation(access.port_count ?? 24, fr, floor.id)
    : null;

  return {
    floor,
    level: floor.level_number,
    isRooftop: floor.level_number > TOP_OCCUPIED_LEVEL,
    aps: fm.filter((m) => m.marker_type === "wifi_ap").length,
    cameras: fm.filter((m) => m.marker_type === "camera").length,
    racks: rackMarkers.length,
    otherDevices: fm.filter((m) => m.marker_type === "other").length,
    routes: fr.length,
    wifiRoutes: fr.filter((r) => r.service_type === "wifi_ap").length,
    cameraRoutes: fr.filter((r) => r.service_type === "camera").length,
    rackMarkers,
    equipment: equip,
    switchModel: access?.model ?? agg?.model ?? null,
    switchQty: equip.reduce((s, e) => s + e.quantity, 0),
    hasAggregation: Boolean(agg),
    portCount: ports?.portCount ?? null,
    portsUsed: ports?.used ?? 0,
    portsSpare: ports?.spare ?? 0,
    rackUsedU: util.usedU,
    rackFreeU: util.freeU,
    status: deviceStatus(fm),
  };
}

export function summariseBuilding(
  floors: PortalFloor[],
  markers: FloorMarker[],
  routes: CableRoute[],
  equipment: RackEquipment[],
) {
  const summaries = floors
    .map((f) => summariseFloor(f, markers, routes, equipment))
    .sort((a, b) => a.level - b.level);
  const occupied = summaries.filter((s) => !s.isRooftop);
  const rooftop = summaries.filter((s) => s.isRooftop);
  const sum = (list: FloorSummary[], key: keyof FloorSummary) =>
    list.reduce((t, s) => t + (Number(s[key]) || 0), 0);

  return {
    summaries,
    occupied,
    rooftop,
    occupiedLevels: occupied.length,
    rooftopLevels: rooftop.length,
    totals: {
      aps: sum(summaries, "aps"),
      cameras: sum(summaries, "cameras"),
      racks: sum(summaries, "racks"),
      routes: sum(summaries, "routes"),
      equipment: equipment.reduce((s, e) => s + e.quantity, 0),
    },
  };
}

/** Aggregation switch fibre uplink picture, derived from live equipment + racks. */
export function backboneSummary(summaries: FloorSummary[], equipment: RackEquipment[]) {
  const agg = equipment.find((e) => e.model === AGGREGATION_SWITCH_MODEL) ?? null;
  const uplinkLevels = summaries
    .filter((s) => s.level > 0 && !s.isRooftop && s.racks > 0)
    .map((s) => s.level);
  const ports = backbonePortUtilisation(agg?.port_count ?? 12, uplinkLevels.length);
  return { agg, uplinkLevels, ...ports };
}

/**
 * Approximate FFL position of a level on the LA-101 / LA-102 elevation sheets,
 * as a fraction of the sheet height. Navigation aid only — labelled
 * "Preliminary alignment" wherever it is drawn.
 */
export const fflFraction = (level: number) => 0.215 + (ROOFTOP_LEVEL - level) * 0.0525;

/** Vertical band (top/height fractions) representing the storey at `level`. */
export function levelBand(level: number) {
  const bottom = fflFraction(level);
  const top = fflFraction(level + 1);
  return { top, height: bottom - top };
}

export type ElevationSheet = {
  id: string;
  label: string;
  drawing: string;
  url: string;
  alt: string;
};

export const floorUseLabel = (use: string) =>
  use === "entry_ground"
    ? "Entry / ground floor"
    : use === "accommodation"
      ? "Accommodation"
      : use === "rooftop_service"
        ? "Rooftop / service level"
        : use.replace(/_/g, " ");

export const levelCode = (level: number) => `L${String(level).padStart(2, "0")}`;
