/**
 * Preliminary cable routing between a floor's 6U rack and the Wi-Fi / CCTV
 * devices on that same floor.
 *
 * Geometry rules (mirrored in the database):
 * - Only INTERMEDIATE waypoints are stored. The start and end of a route are
 *   always resolved from `rack_marker_id` / `device_marker_id`, so moving a rack
 *   or a device re-renders the route without rewriting it.
 * - Waypoints use exactly the same normalised (0..1) architectural-image
 *   coordinate space as device markers.
 */

export type CableServiceType = "wifi_ap" | "camera";

export type Waypoint = { x: number; y: number };

export type CableRoute = {
  id: string;
  project_id: string;
  floor_id: string;
  rack_marker_id: string;
  device_marker_id: string;
  route_label: string;
  cable_type: string;
  service_type: CableServiceType;
  status: string;
  waypoints: Waypoint[];
  client_visible: boolean;
  notes: string | null;
};

/** How much of the routing layer is drawn on the selected level. */
export type RouteDisplayMode = "off" | "selected" | "all";

export const ROUTE_DISPLAY_OPTIONS: { value: RouteDisplayMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "selected", label: "Selected route" },
  { value: "all", label: "All on this level" },
];

/** Wi-Fi routes are cyan/blue, CCTV routes amber/orange — matching the device identities. */
export const ROUTE_HUE: Record<CableServiceType, string> = {
  wifi_ap: "196 100% 45%",
  camera: "32 100% 50%",
};

export const routeColor = (t: CableServiceType) => `hsl(${ROUTE_HUE[t]})`;

export const ROUTE_LEGEND: { service: CableServiceType; label: string }[] = [
  { service: "wifi_ap", label: "Wi-Fi AP data / PoE" },
  { service: "camera", label: "CCTV data / PoE" },
];

export const CABLE_ROUTE_DISCLAIMER =
  "Preliminary cable routing only — confirm containment, ceiling access and measured cable length during the site survey.";

export const CABLE_LENGTH_PENDING = "Pending site measurement";

export const serviceLabel = (t: CableServiceType) =>
  t === "camera" ? "CCTV camera" : "Wi-Fi access point";

/** Normalise the jsonb payload into a clean waypoint array. */
export function parseWaypoints(value: unknown): Waypoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((w) => {
      const o = w as { x?: unknown; y?: unknown };
      return { x: Number(o?.x), y: Number(o?.y) };
    })
    .filter((w) => Number.isFinite(w.x) && Number.isFinite(w.y))
    .map((w) => ({ x: clamp01(w.x), y: clamp01(w.y) }));
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, Math.round(v * 10000) / 10000));

/**
 * Snap a dragged waypoint onto a 90° run relative to its neighbours, so the
 * preliminary path stays orthogonal while the client reshapes it.
 */
export function snapOrthogonal(
  point: Waypoint,
  prev: Waypoint | undefined,
  next: Waypoint | undefined,
  content: { width: number; height: number },
): Waypoint {
  const w = content.width || 1;
  const h = content.height || 1;
  let best: Waypoint = point;
  let bestDist = Infinity;
  for (const ref of [prev, next]) {
    if (!ref) continue;
    const dx = Math.abs(point.x - ref.x) * w;
    const dy = Math.abs(point.y - ref.y) * h;
    const candidate = dx < dy ? { x: ref.x, y: point.y } : { x: point.x, y: ref.y };
    const dist = Math.min(dx, dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return { x: clamp01(best.x), y: clamp01(best.y) };
}

/** Insert a waypoint into `segment` (0 = between the rack and the first waypoint). */
export function insertWaypoint(list: Waypoint[], segment: number, point: Waypoint): Waypoint[] {
  const i = Math.max(0, Math.min(list.length, segment));
  return [...list.slice(0, i), { x: clamp01(point.x), y: clamp01(point.y) }, ...list.slice(i)];
}

export const removeWaypoint = (list: Waypoint[], index: number) =>
  list.filter((_, i) => i !== index);

/** CSV export, matching the project's existing schedule export conventions. */
export function routesToCsv(
  rows: {
    floor: string;
    rack: string;
    destination: string;
    service: string;
    cable: string;
    status: string;
    waypoints: number;
    label: string;
  }[],
): string {
  const head = [
    "Route",
    "Level",
    "Source rack",
    "Destination",
    "Service",
    "Cable",
    "Status",
    "Waypoints",
    "Length",
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.label,
        r.floor,
        r.rack,
        r.destination,
        r.service,
        r.cable,
        r.status,
        r.waypoints,
        CABLE_LENGTH_PENDING,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Counts kept deliberately separate from AP / CCTV / rack device counts. */
export function routeStats(routes: CableRoute[]) {
  return {
    total: routes.length,
    wifi: routes.filter((r) => r.service_type === "wifi_ap").length,
    camera: routes.filter((r) => r.service_type === "camera").length,
    planned: routes.filter((r) => r.status === "planned").length,
    installed: routes.filter((r) => r.status === "installed").length,
    testedActive: routes.filter((r) => r.status === "tested" || r.status === "active").length,
  };
}
