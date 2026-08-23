import { describe, expect, it } from "vitest";
import {
  buildFloorLevels,
  floorPlanScopeLabel,
  railHeading,
  resolveSelectedLevel,
  type FloorLike,
} from "./floorLevels";

const anton: FloorLike[] = [
  { id: "f0", level_number: 0, display_name: "Entry / ground", floor_use: "entry_ground" },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `f${i + 1}`,
    level_number: i + 1,
    display_name: `Level ${i + 1}`,
    floor_use: "accommodation",
  })),
  { id: "roof", level_number: 11, display_name: "Rooftop / service", floor_use: "rooftop_service" },
];

describe("floor level display mapping", () => {
  const levels = buildFloorLevels(anton);

  it("presents 12 plan records as exactly 11 display floors plus a rooftop plan", () => {
    expect(levels.floorCount).toBe(11);
    expect(levels.rooftopCount).toBe(1);
    expect(railHeading(levels.floorCount)).toBe("FLOORS · 11");
  });

  it("maps underlying level 0 to display L1 and level 10 to L11", () => {
    expect(levels.floors[0].shortLabel).toBe("L1");
    expect(levels.floors[0].floor.level_number).toBe(0);
    expect(levels.floors[10].shortLabel).toBe("L11");
    expect(levels.floors[10].floor.level_number).toBe(10);
  });

  it("keeps the rooftop plan available but unnumbered and out of the floor list", () => {
    expect(levels.rooftop[0].displayIndex).toBeNull();
    expect(levels.rooftop[0].shortLabel).toBe("ROOF");
    expect(levels.floors.some((l) => l.isRooftop)).toBe(false);
    expect(levels.all).toHaveLength(12);
    expect(levels.all[11].isRooftop).toBe(true);
  });

  it("orders the rail ascending by underlying level number", () => {
    expect(levels.floors.map((l) => l.floor.level_number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("derives rooftop generically without hard-coded levels", () => {
    const other = buildFloorLevels([
      { id: "a", level_number: 1, display_name: "Shop", floor_use: "other" },
      { id: "b", level_number: 2, display_name: "Plant", floor_use: " ROOFTOP_SERVICE " },
    ]);
    expect(other.floorCount).toBe(1);
    expect(other.rooftopCount).toBe(1);
  });
});

describe("selection", () => {
  const levels = buildFloorLevels(anton);

  it("preserves an existing selection across reloads", () => {
    expect(resolveSelectedLevel(levels, "f5")).toBe("f5");
    expect(resolveSelectedLevel(levels, "roof")).toBe("roof");
  });

  it("falls back to the first occupiable floor, never the rooftop", () => {
    expect(resolveSelectedLevel(levels, null)).toBe("f0");
    expect(resolveSelectedLevel(levels, "gone")).toBe("f0");
  });
});

describe("report wording", () => {
  it("never describes the rooftop plan as a floor", () => {
    expect(floorPlanScopeLabel(anton)).toBe("11 floors + rooftop service plan");
    expect(floorPlanScopeLabel(anton)).not.toContain("12");
  });

  it("omits the rooftop clause when there is none", () => {
    expect(floorPlanScopeLabel([anton[1]])).toBe("1 floor");
    expect(floorPlanScopeLabel([])).toBe("0 floors");
  });
});
