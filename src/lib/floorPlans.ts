export type MarkerKind = "wifi_ap" | "camera" | "rack" | "cable_route" | "other";
export type MarkerState = "planned" | "installed" | "tested" | "active";

export type PortalFloor = {
  id: string;
  project_id: string;
  level_number: number;
  display_name: string;
  floor_use: string;
  plan_image_path: string | null;
  plan_type: string;
  notes: string | null;
  sort_order: number;
  client_visible: boolean;
};

export type CameraRange = "small" | "medium" | "large";

export type FloorMarker = {
  id: string;
  floor_id: string;
  project_id: string;
  marker_type: MarkerKind;
  x_norm: number;
  y_norm: number;
  label: string;
  equipment: string | null;
  model: string | null;
  status: MarkerState;
  client_visible: boolean;
  description: string | null;
  notes: string | null;
  installed_on: string | null;
  tested_on: string | null;
  serial_number: string | null;
  mac_address: string | null;
  evidence_path: string | null;
  evidence_note: string | null;
  sort_order: number;
  /** Camera aim — 0 = up/north on the plan image. */
  direction_deg?: number;
  /** Camera field of view in degrees (60 | 90 | 110). */
  fov_deg?: number;
  /** Indicative camera range band. */
  coverage_range?: CameraRange;
};

export const FOV_PRESETS: { value: number; label: string }[] = [
  { value: 60, label: "60° Narrow" },
  { value: 90, label: "90° Standard" },
  { value: 110, label: "110° Wide" },
];

export const CAMERA_RANGES: { value: CameraRange; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];


export const MARKER_KINDS: { value: MarkerKind; label: string; short: string; layer: string }[] = [
  { value: "wifi_ap", label: "Wi-Fi access point", short: "AP", layer: "Wi-Fi Access Points" },
  { value: "camera", label: "CCTV camera", short: "CAM", layer: "CCTV Cameras" },
  { value: "rack", label: "Rack / cabinet", short: "RK", layer: "Racks" },
  { value: "cable_route", label: "Cable route", short: "CR", layer: "Cable Routes" },
  { value: "other", label: "Other device", short: "DEV", layer: "Other" },
];

export const MARKER_STATES: { value: MarkerState; label: string }[] = [
  { value: "planned", label: "Planned / not installed" },
  { value: "installed", label: "Installed" },
  { value: "tested", label: "Tested" },
  { value: "active", label: "Active" },
];

export const FLOOR_USES = [
  { value: "entry_ground", label: "Entry / ground floor" },
  { value: "accommodation", label: "Accommodation" },
  { value: "rooftop_service", label: "Rooftop / service level" },
  { value: "other", label: "Other" },
];

export const kindLabel = (v: string) => MARKER_KINDS.find((k) => k.value === v)?.label ?? v;
export const kindShort = (v: string) => MARKER_KINDS.find((k) => k.value === v)?.short ?? "DEV";
export const stateLabel = (v: string) => MARKER_STATES.find((s) => s.value === v)?.label ?? v;

export const SURVEY_DISCLAIMER =
  "Preliminary placement – subject to final site survey and approval.";

export function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
}

export function markerStats(markers: FloorMarker[]) {
  const byType = countBy(markers.map((m) => m.marker_type));
  const byStatus = countBy(markers.map((m) => m.status));
  const apMarkers = markers.filter((m) => m.marker_type === "wifi_ap");
  const cameraMarkers = markers.filter((m) => m.marker_type === "camera");
  const rackMarkers = markers.filter((m) => m.marker_type === "rack");
  const apStatus = countBy(apMarkers.map((m) => m.status));
  const camStatus = countBy(cameraMarkers.map((m) => m.status));
  const rackStatus = countBy(rackMarkers.map((m) => m.status));
  return {
    /** All markers, regardless of type. Never label this as "APs". */
    total: markers.length,
    aps: apMarkers.length,
    cameras: cameraMarkers.length,
    racks: rackMarkers.length,
    cableRoutes: byType.cable_route ?? 0,
    other: byType.other ?? 0,
    /** Status counts across all device types. */
    planned: byStatus.planned ?? 0,
    installed: byStatus.installed ?? 0,
    testedActive: (byStatus.tested ?? 0) + (byStatus.active ?? 0),
    plannedAps: apStatus.planned ?? 0,
    installedAps: apStatus.installed ?? 0,
    testedActiveAps: (apStatus.tested ?? 0) + (apStatus.active ?? 0),
    plannedCameras: camStatus.planned ?? 0,
    installedCameras: camStatus.installed ?? 0,
    testedActiveCameras: (camStatus.tested ?? 0) + (camStatus.active ?? 0),
    plannedRacks: rackStatus.planned ?? 0,
    installedRacks: rackStatus.installed ?? 0,
    testedActiveRacks: (rackStatus.tested ?? 0) + (rackStatus.active ?? 0),
  };
}

/** Shown on provisional rack markers so the client knows to reposition them. */
export const RACK_MOVE_HINT =
  "Move this provisional marker to the approved communications/rack position, then save.";

/** Violet identity for rack markers — never reuse AP cyan or CCTV amber. */
export const RACK_HUE = "268 85% 58%";


export const clamp01 = (v: number) => Math.min(1, Math.max(0, Math.round(v * 10000) / 10000));

export const floorShortLabel = (f: PortalFloor) => `L${String(f.level_number).padStart(2, "0")}`;
