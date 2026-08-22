/**
 * Pure reporting rules for the dedicated project workspace ("Reports & share").
 *
 * The workspace reuses the existing proposal, project-pack, print and secure
 * share-link engines. This module only holds the rules that must be provable
 * without a database: URL project scoping, client-safe allowlisting and the
 * requirement that no proposal / report / share record is ever created as a
 * side effect of rendering a page.
 */

export const REPORT_VIEWS = [
  { value: "proposal", label: "Client proposal" },
  { value: "report", label: "Full project report" },
  { value: "link", label: "Secure view link" },
] as const;

export type ReportView = (typeof REPORT_VIEWS)[number]["value"];

export const DEFAULT_REPORT_VIEW: ReportView = "proposal";

export function parseReportView(value: string | null | undefined): ReportView {
  const match = REPORT_VIEWS.find((v) => v.value === value);
  return match ? match.value : DEFAULT_REPORT_VIEW;
}

/* --------------------------------------------------- URL project scoping */

export type ScopedProjectLike = { id: string };

/**
 * Reports always follow the project id in the URL — never a remembered or
 * "first available" project. An unknown id resolves to null so the workspace
 * shows a not-found state instead of reporting on the wrong project.
 */
export function resolveScopedProject<T extends ScopedProjectLike>(
  projectId: string | null | undefined,
  projects: readonly T[],
): T | null {
  const id = (projectId ?? "").trim();
  if (!id) return null;
  return projects.find((p) => p.id === id) ?? null;
}

/** Filters any project-scoped collection down to the URL project. */
export function scopeToProject<T extends { project_id: string }>(rows: readonly T[], projectId: string): T[] {
  return projectId ? rows.filter((r) => r.project_id === projectId) : [];
}

/* ------------------------------------------------ client-safe allowlisting */

/**
 * Keys that must never reach a client document, snapshot or share payload.
 * Matching is done on the key name so a new column cannot silently leak.
 */
export const SENSITIVE_KEY_PATTERNS = [
  /supplier/i,
  /markup/i,
  /margin/i,
  /(^|_)cost($|_)/i,
  /unit_cost/i,
  /cost_total/i,
  /gross_profit/i,
  /internal/i,
  /po_reference/i,
  /purchase_date/i,
  /private/i,
  /admin_note/i,
] as const;

export const isSensitiveKey = (key: string) => SENSITIVE_KEY_PATTERNS.some((re) => re.test(key));

/** Deep scan that returns every offending key path found in a payload. */
export function findSensitiveKeys(value: unknown, path = "$", seen = new Set<unknown>()): string[] {
  if (value === null || typeof value !== "object") return [];
  if (seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value)) return value.flatMap((v, i) => findSensitiveKeys(v, `${path}[${i}]`, seen));

  const hits: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) hits.push(`${path}.${key}`);
    hits.push(...findSensitiveKeys(child, `${path}.${key}`, seen));
  }
  return hits;
}

/** Throws before anything client-facing is issued, shared or printed. */
export function assertClientSafe(value: unknown, label = "document"): void {
  const hits = findSensitiveKeys(value);
  if (hits.length) throw new Error(`${label} contains internal commercial fields: ${hits.slice(0, 5).join(", ")}`);
}

/** Removes sensitive keys recursively, preserving everything else. */
export function stripSensitive<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => stripSensitive(v)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) continue;
    out[key] = stripSensitive(child);
  }
  return out as T;
}

/** Only client-visible site images may appear in a client report. */
export function clientVisibleOnly<T extends { client_visible?: boolean | null }>(rows: readonly T[]): T[] {
  return rows.filter((r) => r.client_visible === true);
}

/* --------------------------------------------- explicit-action requirement */

export type ActionTrigger = "user" | "mount" | "effect" | "render";

/**
 * Guard placed in front of every write path (create draft, generate/issue,
 * create share link). Rendering the workspace passes "mount"/"effect" and is
 * rejected, so no record can be created just by opening the page.
 */
export function assertExplicitAction(trigger: ActionTrigger, action = "This action"): void {
  if (trigger !== "user")
    throw new Error(`${action} requires an explicit Generate or Create click (received "${trigger}").`);
}

/* ---------------------------------------------------- device roll-up rules */

export type CountableMarker = { marker_type: string; is_placed?: boolean | null };

const GROUPS: Record<string, RegExp> = {
  access_points: /^wifi_ap$/,
  cameras: /^camera$/,
  racks: /^rack$/,
  switches: /^(switch|fibre_agg_switch)$/,
  nvrs: /^nvr$/,
  data_points: /^data_point$/,
  cable_routes: /^cable_route$/,
};

export type DeviceTotals = {
  total: number;
  placed: number;
  access_points: number;
  cameras: number;
  racks: number;
  switches: number;
  nvrs: number;
  data_points: number;
  cable_routes: number;
  byType: { type: string; count: number }[];
};

/** Client-safe quantity roll-up used by both the proposal and the full report. */
export function deviceTotals(markers: readonly CountableMarker[]): DeviceTotals {
  const totals: DeviceTotals = {
    total: markers.length,
    placed: markers.filter((m) => m.is_placed).length,
    access_points: 0,
    cameras: 0,
    racks: 0,
    switches: 0,
    nvrs: 0,
    data_points: 0,
    cable_routes: 0,
    byType: [],
  };
  const byType = new Map<string, number>();
  markers.forEach((m) => {
    byType.set(m.marker_type, (byType.get(m.marker_type) ?? 0) + 1);
    for (const [group, re] of Object.entries(GROUPS)) {
      if (re.test(m.marker_type)) (totals as unknown as Record<string, number>)[group] += 1;
    }
  });
  totals.byType = Array.from(byType.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
  return totals;
}

/* ------------------------------------------------------ share-link defaults */

/** View-only by default: no downloads, comments or approvals. */
export const VIEW_ONLY_SHARE_DEFAULTS = {
  permission_scope: "view" as const,
  download_allowed: false,
  comments_allowed: false,
  approval_allowed: false,
};

/* ---------------------------------------------- floor vs rooftop semantics */

/**
 * Floor-count semantics shared by every report, proposal and pack surface.
 *
 * A project's plan records include non-storey areas (rooftop / service plans).
 * Those plans, their devices and their cable routes stay fully available, but
 * they must never be added to a "Floors" / "Levels" / "Storeys" headline.
 * Nothing here is hard-coded to a specific building.
 */
export const ROOFTOP_FLOOR_USE = "rooftop_service";

export const ROOFTOP_SECTION_TITLE = "Rooftop / service area";
export const ROOFTOP_EXCLUDED_NOTE = "Excluded from floor count";

export type FloorUseLike = { floor_use?: string | null };

export const isRooftopArea = (floor: FloorUseLike) =>
  (floor.floor_use ?? "").trim().toLowerCase() === ROOFTOP_FLOOR_USE;

/** Splits plan records into occupied floors and rooftop / service areas. */
export function splitFloorAreas<T extends FloorUseLike>(rows: readonly T[]): { floors: T[]; rooftop: T[] } {
  return {
    floors: rows.filter((r) => !isRooftopArea(r)),
    rooftop: rows.filter((r) => isRooftopArea(r)),
  };
}

export type FloorCounts = { floors: number; rooftopAreas: number; planRecords: number };

export function floorCounts(rows: readonly FloorUseLike[]): FloorCounts {
  const { floors, rooftop } = splitFloorAreas(rows);
  return { floors: floors.length, rooftopAreas: rooftop.length, planRecords: rows.length };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** e.g. "11 floors + 1 rooftop/service area" — never "12 floors". */
export function floorCountLabel(rows: readonly FloorUseLike[]): string {
  const { floors, rooftopAreas } = floorCounts(rows);
  const base = plural(floors, "floor");
  if (!rooftopAreas) return base;
  return `${base} + ${rooftopAreas} rooftop/service area${rooftopAreas === 1 ? "" : "s"}`;
}
