/**
 * Rack equipment register for the Virtual Building Plans module.
 *
 * Equipment records live in `portal_rack_equipment`, one row per rack + model.
 * Port utilisation is ALWAYS derived from live data (cable routes on the same
 * floor as the rack) — never hard-coded device counts.
 */

export type RackEquipment = {
  id: string;
  project_id: string;
  rack_marker_id: string;
  equipment_type: string;
  manufacturer: string;
  model: string;
  description: string | null;
  rack_units: number;
  quantity: number;
  port_count: number | null;
  port_type: string | null;
  poe_capable: boolean;
  layer3_capable: boolean;
  sort_order: number;
  status: string;
  client_visible: boolean;
  notes: string | null;
};

/** Every rack in this project is a 6U wall-mount enclosure. */
export const RACK_CAPACITY_U = 6;

/** Model of the per-level Layer 3 PoE access switch. */
export const ACCESS_SWITCH_MODEL = "GWN7813P";

/** Model of the ground-floor Layer 3 fibre aggregation switch. */
export const AGGREGATION_SWITCH_MODEL = "GWN7832";

/** Planned fibre uplinks into the ground-floor aggregation switch (Levels 1–10). */
export const BACKBONE_UPLINK_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const BACKBONE_DISCLAIMER =
  "Preliminary backbone design — fibre type, transceivers, riser routing and cable lengths remain TBC after the riser and site survey.";

export const EQUIPMENT_DISCLAIMER =
  "Preliminary rack build — final elevation, patching and port allocation are confirmed during installation and commissioning.";

export const equipmentTypeLabel = (t: string) =>
  t === "access_switch"
    ? "Access switch"
    : t === "aggregation_switch"
      ? "Fibre aggregation switch"
      : t === "switch"
        ? "Switch"
        : t.replace(/_/g, " ");

/** Used / free rack units for a single rack, from its equipment records. */
export function rackUtilisation(items: RackEquipment[]) {
  const usedU = items.reduce((sum, e) => sum + e.rack_units * e.quantity, 0);
  return {
    capacityU: RACK_CAPACITY_U,
    usedU,
    freeU: Math.max(0, RACK_CAPACITY_U - usedU),
  };
}

/**
 * Access-switch port utilisation on a level: one port per cable route landing on
 * that floor (Wi-Fi AP + CCTV), derived live from the routing data.
 */
export function accessPortUtilisation(
  portCount: number,
  routes: { floor_id: string; service_type: string }[],
  floorId: string,
) {
  const onFloor = routes.filter((r) => r.floor_id === floorId);
  const used = onFloor.length;
  return {
    portCount,
    used,
    wifi: onFloor.filter((r) => r.service_type === "wifi_ap").length,
    camera: onFloor.filter((r) => r.service_type === "camera").length,
    spare: Math.max(0, portCount - used),
    over: Math.max(0, used - portCount),
  };
}

/** Fibre uplink utilisation for the ground-floor aggregation switch. */
export function backbonePortUtilisation(portCount: number, uplinks = BACKBONE_UPLINK_LEVELS.length) {
  return { portCount, used: uplinks, spare: Math.max(0, portCount - uplinks) };
}

/** Project-wide equipment totals for the schedule. */
export function equipmentTotals(items: RackEquipment[]) {
  const qty = (model: string) =>
    items.filter((e) => e.model === model).reduce((s, e) => s + e.quantity, 0);
  return {
    records: items.length,
    accessSwitches: qty(ACCESS_SWITCH_MODEL),
    aggregationSwitches: qty(AGGREGATION_SWITCH_MODEL),
    totalUnits: items.reduce((s, e) => s + e.quantity, 0),
  };
}
