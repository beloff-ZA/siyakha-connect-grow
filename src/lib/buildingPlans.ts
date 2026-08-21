export type BuildingLevel = {
  id: string;
  project_id: string;
  name: string;
  level_code: string | null;
  storey_type: string;
  sort_order: number;
  plan_image_path: string | null;
  plan_reference: string | null;
  drawing_date: string | null;
  status: string;
  notes: string | null;
};

export type DeviceMarker = {
  id: string;
  level_id: string;
  project_id: string;
  device_type: string;
  label: string;
  model: string | null;
  x_pct: number;
  y_pct: number;
  mounting: string | null;
  status: string;
  notes: string | null;
  sort_order: number;
};

export const DEVICE_TYPES = [
  { value: "wifi_ap", label: "Wi-Fi access point", short: "AP" },
  { value: "camera", label: "Surveillance camera", short: "CAM" },
  { value: "switch", label: "Network switch", short: "SW" },
  { value: "cabinet", label: "Cabinet / rack", short: "RACK" },
  { value: "ap_bridge", label: "Wireless bridge", short: "BR" },
  { value: "other", label: "Other device", short: "DEV" },
] as const;

export const MARKER_STATUSES = ["preliminary", "confirmed", "installed"] as const;

export const STOREY_TYPES = [
  { value: "site", label: "Site / context" },
  { value: "basement", label: "Basement" },
  { value: "ground", label: "Ground storey" },
  { value: "storey", label: "Storey" },
  { value: "roof", label: "Roof" },
  { value: "other", label: "Other" },
] as const;

export const deviceLabel = (value: string) =>
  DEVICE_TYPES.find((d) => d.value === value)?.label ?? value;

export const deviceShort = (value: string) =>
  DEVICE_TYPES.find((d) => d.value === value)?.short ?? "DEV";

/** Counts markers per device type for a set of markers. */
export function countByType(markers: DeviceMarker[]) {
  return markers.reduce<Record<string, number>>((acc, m) => {
    acc[m.device_type] = (acc[m.device_type] ?? 0) + 1;
    return acc;
  }, {});
}

export const clampPct = (value: number) => Math.min(100, Math.max(0, Math.round(value * 1000) / 1000));
