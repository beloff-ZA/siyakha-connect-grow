/**
 * Siyakha Connect — reusable project registers.
 *
 * These helpers are deliberately project-agnostic: every register is derived
 * live from `portal_floor_markers`, `portal_nvrs`, `portal_cable_routes` and
 * `portal_rack_equipment` for the selected project. Nothing is hard-coded per
 * client or per site.
 */

import { supabase } from "@/integrations/supabase/client";

export type RegisterMarker = {
  id: string;
  floor_id: string;
  project_id: string;
  marker_type: string;
  label: string;
  equipment: string | null;
  model: string | null;
  status: string;
  area: string | null;
  description: string | null;
  notes: string | null;
  design_hold: string | null;
  is_placed: boolean;
  x_norm: number | null;
  y_norm: number | null;
  nvr_id: string | null;
  nvr_channel: number | null;
  mounting_height_m: number | null;
  environment: string | null;
  lens_model: string | null;
  mount_type: string | null;
  radio_band: string | null;
  ssid: string | null;
  vlan: string | null;
  switch_port: number | null;
  capacity_u: number | null;
  sort_order: number;
};

export type RegisterNvr = {
  id: string;
  project_id: string;
  rack_marker_id: string | null;
  label: string;
  manufacturer: string;
  model: string | null;
  channel_count: number;
  channel_from: number | null;
  channel_to: number | null;
  status: string;
  notes: string | null;
  sort_order: number;
};

export type RegisterCable = {
  id: string;
  project_id: string;
  floor_id: string;
  route_label: string;
  cable_type: string;
  service_type: string;
  route_kind: string;
  status: string;
  source_label: string | null;
  destination_label: string | null;
  estimated_length_m: number | null;
  measured_length_m: number | null;
  max_length_m: number;
  test_result: string | null;
  patch_panel: string | null;
  patch_panel_port: number | null;
  switch_port: number | null;
  fibre_strands: number | null;
  sfp_detail: string | null;
  notes: string | null;
};

export type RegisterEquipment = {
  id: string;
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
  sort_order: number;
  status: string;
  notes: string | null;
};

export type ProjectRegisters = {
  markers: RegisterMarker[];
  nvrs: RegisterNvr[];
  cables: RegisterCable[];
  equipment: RegisterEquipment[];
};

const MARKER_COLUMNS =
  "id, floor_id, project_id, marker_type, label, equipment, model, status, area, description, notes, design_hold, is_placed, x_norm, y_norm, nvr_id, nvr_channel, mounting_height_m, environment, lens_model, mount_type, radio_band, ssid, vlan, switch_port, capacity_u, sort_order";

/** Loads every register for one project through the existing RLS policies. */
export async function loadProjectRegisters(projectId: string): Promise<ProjectRegisters> {
  const [m, n, c, e] = await Promise.all([
    supabase.from("portal_floor_markers").select(MARKER_COLUMNS).eq("project_id", projectId).order("sort_order"),
    supabase.from("portal_nvrs").select("*").eq("project_id", projectId).order("sort_order"),
    supabase.from("portal_cable_routes").select("*").eq("project_id", projectId).order("route_label"),
    supabase.from("portal_rack_equipment").select("*").eq("project_id", projectId).order("sort_order"),
  ]);

  const firstError = m.error ?? n.error ?? c.error ?? e.error;
  if (firstError) throw firstError;

  return {
    markers: (m.data ?? []) as unknown as RegisterMarker[],
    nvrs: (n.data ?? []) as unknown as RegisterNvr[],
    cables: (c.data ?? []) as unknown as RegisterCable[],
    equipment: (e.data ?? []) as unknown as RegisterEquipment[],
  };
}

export const DEVICE_GROUPS: { type: string; label: string; short: string }[] = [
  { type: "camera", label: "CCTV cameras", short: "CAM" },
  { type: "wifi_ap", label: "Wi-Fi access points", short: "AP" },
  { type: "data_point", label: "Operational data / POS points", short: "DATA" },
  { type: "access_control", label: "Access-control devices", short: "ACS" },
  { type: "rack", label: "Racks", short: "RK" },
  { type: "switch", label: "Network switches", short: "SW" },
  { type: "nvr", label: "Recorders", short: "NVR" },
  { type: "router_firewall", label: "Routers / firewalls", short: "RTR" },
  { type: "patch_panel", label: "Patch panels", short: "PP" },
  { type: "fibre_agg_switch", label: "Fibre aggregation switches", short: "AGG" },
  { type: "fibre_liu", label: "Fibre LIU / ODF", short: "LIU" },
  { type: "fibre_splice", label: "Fibre splice points", short: "SPL" },
  { type: "note_marker", label: "Notes / risks / issues", short: "NOTE" },
  { type: "other", label: "Other devices", short: "DEV" },
];

export const deviceGroupLabel = (type: string) =>
  DEVICE_GROUPS.find((g) => g.type === type)?.label ?? type.replace(/_/g, " ");

/** Per-device-type placed / unplaced / design-hold counts. */
export function deviceRegisterStats(markers: RegisterMarker[]) {
  const groups = DEVICE_GROUPS.map((g) => {
    const rows = markers.filter((m) => m.marker_type === g.type);
    return {
      ...g,
      total: rows.length,
      placed: rows.filter((m) => m.is_placed).length,
      unplaced: rows.filter((m) => !m.is_placed).length,
      holds: rows.filter((m) => !!m.design_hold).length,
    };
  }).filter((g) => g.total > 0);

  return {
    groups,
    total: markers.length,
    placed: markers.filter((m) => m.is_placed).length,
    unplaced: markers.filter((m) => !m.is_placed).length,
    holds: markers.filter((m) => !!m.design_hold).length,
  };
}

/** Channel allocation across every recorder, derived from camera assignments. */
export function nvrAllocation(nvrs: RegisterNvr[], markers: RegisterMarker[]) {
  const cameras = markers.filter((m) => m.marker_type === "camera");
  const rows = nvrs.map((n) => {
    const assigned = cameras
      .filter((c) => c.nvr_id === n.id)
      .sort((a, b) => (a.nvr_channel ?? 0) - (b.nvr_channel ?? 0));
    return {
      nvr: n,
      cameras: assigned,
      used: assigned.length,
      spare: Math.max(0, n.channel_count - assigned.length),
      over: Math.max(0, assigned.length - n.channel_count),
      unplaced: assigned.filter((c) => !c.is_placed).length,
    };
  });
  const capacity = nvrs.reduce((s, n) => s + n.channel_count, 0);
  return {
    rows,
    capacity,
    allocated: cameras.filter((c) => !!c.nvr_id).length,
    unallocated: cameras.filter((c) => !c.nvr_id).length,
    cameras: cameras.length,
    fullyAllocated: cameras.length > 0 && cameras.every((c) => !!c.nvr_id),
  };
}

/** Copper permanent-link design limit checks plus fibre/containment splits. */
export function cableStats(cables: RegisterCable[]) {
  const copper = cables.filter((c) => c.route_kind === "copper");
  const overLimit = cables.filter((c) => {
    const len = c.measured_length_m ?? c.estimated_length_m;
    return len != null && len > (c.max_length_m ?? 90);
  });
  return {
    total: cables.length,
    copper: copper.length,
    fibre: cables.filter((c) => c.route_kind === "fibre").length,
    containment: cables.filter((c) => c.route_kind === "containment").length,
    measured: cables.filter((c) => c.measured_length_m != null).length,
    tested: cables.filter((c) => !!c.test_result).length,
    pendingLength: cables.filter((c) => c.measured_length_m == null && c.estimated_length_m == null).length,
    overLimit,
    byService: cables.reduce<Record<string, number>>((acc, c) => {
      acc[c.service_type] = (acc[c.service_type] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

export const serviceTypeLabel = (t: string) =>
  t === "camera"
    ? "CCTV"
    : t === "wifi_ap"
      ? "Wi-Fi"
      : t === "data"
        ? "Operational data"
        : t.replace(/_/g, " ");

export type RackValidation = {
  message: string;
  severity: "warning" | "info";
};

/**
 * Rack capacity and service validation for one rack: rack units, switch ports,
 * PoE demand, recorder channels and patch-panel terminations.
 */
export function validateRack(opts: {
  capacityU: number;
  equipment: RegisterEquipment[];
  cables: RegisterCable[];
  nvrs: RegisterNvr[];
  cameras: number;
}) {
  const { capacityU, equipment, cables, nvrs, cameras } = opts;
  const usedU = equipment.reduce((s, e) => s + e.rack_units * e.quantity, 0);

  const switchPorts = equipment
    .filter((e) => e.equipment_type.includes("switch"))
    .reduce((s, e) => s + (e.port_count ?? 0) * e.quantity, 0);
  const panelPorts = equipment
    .filter((e) => e.equipment_type === "patch_panel")
    .reduce((s, e) => s + (e.port_count ?? 0) * e.quantity, 0);
  const channels = nvrs.reduce((s, n) => s + n.channel_count, 0);
  const links = cables.filter((c) => c.route_kind === "copper").length;
  const poeLinks = cables.filter((c) => c.service_type === "camera" || c.service_type === "wifi_ap").length;

  const issues: RackValidation[] = [];
  if (usedU > capacityU) {
    issues.push({ severity: "warning", message: `Rack build needs ${usedU}U but only ${capacityU}U is available.` });
  }
  if (links > switchPorts) {
    issues.push({
      severity: "warning",
      message: `${links} structured cabling links against ${switchPorts} switch ports — ${links - switchPorts} additional ports required.`,
    });
  }
  if (links > panelPorts) {
    issues.push({
      severity: "warning",
      message: `${links} links against ${panelPorts} patch-panel terminations — additional panel capacity required.`,
    });
  }
  if (cameras > channels) {
    issues.push({
      severity: "warning",
      message: `${cameras} cameras against ${channels} recorder channels — ${cameras - channels} channels short.`,
    });
  }
  if (poeLinks > 0) {
    issues.push({
      severity: "info",
      message: `${poeLinks} PoE-powered devices — confirm the switch PoE budget covers the final camera and access-point models.`,
    });
  }

  return {
    capacityU,
    usedU,
    freeU: Math.max(0, capacityU - usedU),
    switchPorts,
    panelPorts,
    channels,
    links,
    poeLinks,
    spareSwitchPorts: Math.max(0, switchPorts - links),
    sparePanelPorts: Math.max(0, panelPorts - links),
    spareChannels: Math.max(0, channels - cameras),
    issues,
  };
}

export const REGISTER_DISCLAIMER =
  "Preliminary design register — device positions, cable routes and measured lengths are confirmed during the site survey, installation and commissioning.";

export const COPPER_LIMIT_NOTE =
  "Maximum copper permanent-link design length is 90 m. Routes without a measured length remain pending site measurement.";

/* ------------------------------- CSV export ------------------------------ */

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function toCsv(headers: string[], rows: (string | number | null)[][]) {
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const safeFileName = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "register";
