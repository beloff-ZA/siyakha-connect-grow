import { describe, expect, it } from "vitest";
import { BACKBONE_UPLINK_LEVELS, backbonePortUtilisation } from "@/lib/rackEquipment";
import { backboneSummary, type FloorSummary } from "@/lib/buildingView";

describe("backbone uplinks", () => {
  it("plans one uplink per level 1–11, including the rooftop / service rack", () => {
    expect(BACKBONE_UPLINK_LEVELS).toHaveLength(11);
    expect(BACKBONE_UPLINK_LEVELS[BACKBONE_UPLINK_LEVELS.length - 1]).toBe(11);
  });

  it("leaves one spare port on the 12-port aggregation switch", () => {
    const ports = backbonePortUtilisation(12);
    expect(ports.used).toBe(11);
    expect(ports.spare).toBe(1);
  });
});

const summary = (level: number, isRooftop: boolean, racks: number): FloorSummary =>
  ({ level, isRooftop, racks }) as unknown as FloorSummary;

describe("backboneSummary", () => {
  it("counts the rooftop rack as an uplink and excludes the ground aggregation level", () => {
    const rows: FloorSummary[] = [
      summary(0, false, 1),
      ...Array.from({ length: 10 }, (_, i) => summary(i + 1, false, 1)),
      summary(11, true, 1),
    ];
    const b = backboneSummary(rows, []);
    expect(b.uplinkLevels).toHaveLength(11);
    expect(b.used).toBe(11);
    expect(b.spare).toBe(1);
  });

  it("ignores levels without a rack", () => {
    const b = backboneSummary([summary(0, false, 1), summary(1, false, 0), summary(2, false, 1)], []);
    expect(b.uplinkLevels).toEqual([2]);
  });
});
