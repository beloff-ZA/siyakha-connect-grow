/**
 * Display semantics for building levels.
 *
 * Underlying plan records keep their stored `level_number` for ever (a project
 * may start at level 0 "Entry / ground"). Everything a person reads — the level
 * rail, the client deck, the reports — presents the occupiable floors as a
 * simple 1..n list, and keeps non-storey plans (rooftop / service) separate so
 * they are never counted as a floor.
 *
 * Nothing here is hard-coded to a specific building.
 */

import { ROOFTOP_FLOOR_USE } from "@/lib/reporting";

export type FloorLike = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use?: string | null;
  plan_image_path?: string | null;
};

export type RailLevel<T extends FloorLike> = {
  floor: T;
  /** 1-based position in the occupiable-floor list, null for rooftop/service plans. */
  displayIndex: number | null;
  /** Short rail label, e.g. "L1" or "ROOF". */
  shortLabel: string;
  /** Readable label, e.g. "L1 · Entry / ground" or "Rooftop / service plan". */
  longLabel: string;
  isRooftop: boolean;
};

export const ROOFTOP_SHORT_LABEL = "ROOF";
export const ROOFTOP_LONG_LABEL = "Rooftop / service plan";

export const isRooftopFloor = (f: FloorLike) =>
  (f.floor_use ?? "").trim().toLowerCase() === ROOFTOP_FLOOR_USE;

const byLevel = <T extends FloorLike>(a: T, b: T) =>
  a.level_number - b.level_number || a.display_name.localeCompare(b.display_name);

export type FloorLevels<T extends FloorLike> = {
  /** Occupiable floors in ascending order, displayed as L1..Ln. */
  floors: RailLevel<T>[];
  /** Rooftop / service plans, always presented separately and unnumbered. */
  rooftop: RailLevel<T>[];
  /** Every level in rail order (floors first, rooftop last). */
  all: RailLevel<T>[];
  floorCount: number;
  rooftopCount: number;
};

export function buildFloorLevels<T extends FloorLike>(rows: readonly T[]): FloorLevels<T> {
  const sorted = [...rows].sort(byLevel);

  const floors = sorted
    .filter((f) => !isRooftopFloor(f))
    .map((floor, i) => ({
      floor,
      displayIndex: i + 1,
      shortLabel: `L${i + 1}`,
      longLabel: `L${i + 1} · ${floor.display_name}`,
      isRooftop: false,
    }));

  const rooftop = sorted
    .filter((f) => isRooftopFloor(f))
    .map((floor) => ({
      floor,
      displayIndex: null,
      shortLabel: ROOFTOP_SHORT_LABEL,
      longLabel: ROOFTOP_LONG_LABEL,
      isRooftop: true,
    }));

  return {
    floors,
    rooftop,
    all: [...floors, ...rooftop],
    floorCount: floors.length,
    rooftopCount: rooftop.length,
  };
}

/** Rail heading — counts occupiable floors only, so it can never read one too many. */
export const railHeading = (floorCount: number) => `FLOORS · ${floorCount}`;

/** Report wording: "11 floors + rooftop service plan", never "12 floors". */
export function floorPlanScopeLabel(rows: readonly FloorLike[] | { floor_use?: string | null }[]): string {
  const list = rows as readonly FloorLike[];
  const floors = list.filter((f) => !isRooftopFloor(f)).length;
  const rooftop = list.length - floors;
  const base = `${floors} floor${floors === 1 ? "" : "s"}`;
  if (!rooftop) return base;
  return `${base} + rooftop service plan${rooftop === 1 ? "" : "s"}`;
}

/** Label for one level, used by rails and captions. */
export function levelLabel<T extends FloorLike>(levels: FloorLevels<T>, floorId: string): string {
  return levels.all.find((l) => l.floor.id === floorId)?.longLabel ?? "";
}

/**
 * Keeps the current selection when the level list reloads, otherwise falls back
 * to the first occupiable floor (never silently to the rooftop plan).
 */
export function resolveSelectedLevel<T extends FloorLike>(
  levels: FloorLevels<T>,
  current: string | null | undefined,
): string {
  if (current && levels.all.some((l) => l.floor.id === current)) return current;
  return levels.floors[0]?.floor.id ?? levels.rooftop[0]?.floor.id ?? "";
}
