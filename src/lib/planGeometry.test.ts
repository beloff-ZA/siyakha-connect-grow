import { describe, expect, it } from "vitest";
import {
  containRect,
  pointerToNorm,
  zoomAbout,
  wheelZoomFactor,
  clampUnit,
  bearingBetween,
  bearingFromDelta,
  bearingToRotation,
  normalizeBearing,
  cardinalLabel,
  bearingText,
  aimOffsetPx,
  normDistancePx,
  CARDINAL_LABELS,
  selectedCoverageMode,
  coverageKind,
  coverageHelpText,
  AIM_DEADZONE_PX,
  type Size,
} from "./planGeometry";
import { rackItemsFor } from "./rackEquipment";

describe("containRect", () => {
  it("letterboxes a wide image in a square container", () => {
    const r = containRect({ width: 1000, height: 1000 }, { width: 2000, height: 1000 });
    expect(r).toEqual({ left: 0, top: 250, width: 1000, height: 500 });
  });

  it("pillarboxes a tall image in a wide container", () => {
    const r = containRect({ width: 1000, height: 500 }, { width: 500, height: 1000 });
    expect(r).toEqual({ left: 375, top: 0, width: 250, height: 500 });
  });

  it("falls back to the container when the natural size is unknown", () => {
    const r = containRect({ width: 800, height: 600 }, { width: 0, height: 0 });
    expect(r).toEqual({ left: 0, top: 0, width: 800, height: 600 });
  });
});

describe("pointerToNorm", () => {
  const content = { left: 0, top: 250, width: 1000, height: 500 };
  const containerRect = { left: 20, top: 40 };

  it("maps the image centre to 0.5/0.5 at zoom 1", () => {
    const p = pointerToNorm({
      clientX: 20 + 500,
      clientY: 40 + 500,
      containerRect,
      offset: { x: 0, y: 0 },
      zoom: 1,
      content,
    });
    expect(p.x).toBeCloseTo(0.5);
    expect(p.y).toBeCloseTo(0.5);
  });

  it("is invariant to pan and zoom for the same architectural point", () => {
    const base = pointerToNorm({
      clientX: 20 + 250,
      clientY: 40 + 375,
      containerRect,
      offset: { x: 0, y: 0 },
      zoom: 1,
      content,
    });
    // same local point under zoom 2 and pan (-100,-60)
    const zoom = 2;
    const offset = { x: -100, y: -60 };
    const p = pointerToNorm({
      clientX: 20 + (250 * zoom + offset.x),
      clientY: 40 + (375 * zoom + offset.y),
      containerRect,
      offset,
      zoom,
      content,
    });
    expect(p.x).toBeCloseTo(base.x, 6);
    expect(p.y).toBeCloseTo(base.y, 6);
  });

  it("clamps outside the image bounds", () => {
    const p = pointerToNorm({
      clientX: -5000,
      clientY: -5000,
      containerRect,
      offset: { x: 0, y: 0 },
      zoom: 1,
      content,
    });
    expect(p).toEqual({ x: 0, y: 0 });
  });

  it("normalised coords are independent of container size (responsive stability)", () => {
    const small = containRect({ width: 400, height: 400 }, { width: 2000, height: 1000 });
    const large = containRect({ width: 1200, height: 1200 }, { width: 2000, height: 1000 });
    const target = { x: 0.3, y: 0.7 };
    const at = (c: ReturnType<typeof containRect>) =>
      pointerToNorm({
        clientX: c.left + target.x * c.width,
        clientY: c.top + target.y * c.height,
        containerRect: { left: 0, top: 0 },
        offset: { x: 0, y: 0 },
        zoom: 1,
        content: c,
      });
    const a = at(small);
    const b = at(large);
    expect(a.x).toBeCloseTo(b.x, 6);
    expect(a.y).toBeCloseTo(b.y, 6);
  });
});

describe("zoomAbout", () => {
  it("keeps the anchor point stationary", () => {
    const { zoom, offset } = zoomAbout({
      zoom: 1,
      next: 2,
      offset: { x: 0, y: 0 },
      px: 300,
      py: 200,
    });
    // local point that was under (300,200) must still be under it
    const local = { x: 300, y: 200 };
    expect(local.x * zoom + offset.x).toBeCloseTo(300);
    expect(local.y * zoom + offset.y).toBeCloseTo(200);
  });
});

describe("wheelZoomFactor", () => {
  it("scales with delta magnitude and normalises deltaMode", () => {
    expect(wheelZoomFactor(-100, 0)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100, 0)).toBeLessThan(1);
    expect(wheelZoomFactor(1, 1)).toBeCloseTo(wheelZoomFactor(16, 0), 10);
  });
});

describe("clampUnit", () => {
  it("clamps to 0..1", () => {
    expect(clampUnit(-1)).toBe(0);
    expect(clampUnit(2)).toBe(1);
    expect(clampUnit(0.42)).toBe(0.42);
  });
});

describe("camera bearings", () => {
  const square = { width: 1000, height: 1000 };
  const c = { x: 0.5, y: 0.5 };

  it("maps cardinal and intercardinal directions to the plan convention", () => {
    expect(bearingBetween(c, { x: 0.5, y: 0.1 }, square)).toBe(0); // up = N
    expect(bearingBetween(c, { x: 0.9, y: 0.1 }, square)).toBe(45); // NE
    expect(bearingBetween(c, { x: 0.9, y: 0.5 }, square)).toBe(90); // E
    expect(bearingBetween(c, { x: 0.9, y: 0.9 }, square)).toBe(135); // SE
    expect(bearingBetween(c, { x: 0.5, y: 0.9 }, square)).toBe(180); // S
    expect(bearingBetween(c, { x: 0.1, y: 0.9 }, square)).toBe(225); // SW
    expect(bearingBetween(c, { x: 0.1, y: 0.5 }, square)).toBe(270); // W
    expect(bearingBetween(c, { x: 0.1, y: 0.1 }, square)).toBe(315); // NW
  });

  it("corrects for non-square plans when converting to bearings", () => {
    const wide = { width: 2000, height: 1000 };
    // equal normalised deltas are NOT 45 degrees on a wide plan
    expect(bearingBetween(c, { x: 0.6, y: 0.4 }, wide)).toBe(63);
    // matching pixel deltas are
    expect(bearingBetween(c, { x: 0.55, y: 0.4 }, wide)).toBe(45);
  });

  it("normalises bearings into 0..359", () => {
    expect(normalizeBearing(-90)).toBe(270);
    expect(normalizeBearing(360)).toBe(0);
    expect(normalizeBearing(719.6)).toBe(0);
    expect(normalizeBearing(44.4)).toBe(44);
  });

  it("labels the 8 compass points and rounds to the nearest", () => {
    expect(CARDINAL_LABELS.map((_, i) => cardinalLabel(i * 45))).toEqual([...CARDINAL_LABELS]);
    expect(cardinalLabel(22)).toBe("N");
    expect(cardinalLabel(23)).toBe("NE");
    expect(cardinalLabel(350)).toBe("N");
    expect(bearingText(135)).toBe("135° SE");
  });

  it("renders the aim handle on the bearing it reports back", () => {
    for (const deg of [0, 45, 90, 135, 180, 225, 270, 315, 17, 203]) {
      const { dx, dy } = aimOffsetPx(deg, 40);
      expect(bearingFromDelta(dx, dy)).toBe(normalizeBearing(deg));
      expect(bearingToRotation(deg)).toBe(normalizeBearing(deg));
      expect(Math.hypot(dx, dy)).toBeCloseTo(40, 6);
    }
  });

  it("keeps the rendered handle direction stable across zoom and resize", () => {
    const handleAt = (content: Size, dist: number, deg: number) => {
      const { dx, dy } = aimOffsetPx(deg, dist);
      return bearingBetween(c, { x: c.x + dx / content.width, y: c.y + dy / content.height }, content);
    };
    expect(handleAt({ width: 800, height: 600 }, 30, 118)).toBe(118);
    expect(handleAt({ width: 1600, height: 1200 }, 60, 118)).toBe(118);
    expect(handleAt({ width: 360, height: 900 }, 12, 118)).toBe(118);
  });

  it("measures drag distance in image pixels for the aim deadzone", () => {
    expect(normDistancePx(c, { x: 0.5, y: 0.5 }, square)).toBe(0);
    expect(normDistancePx(c, { x: 0.53, y: 0.54 }, square)).toBeCloseTo(50, 6);
    expect(AIM_DEADZONE_PX).toBeGreaterThan(0);
  });
});

describe("camera aim persistence contract", () => {
  const content = { width: 1000, height: 800 };
  const camera = { x: 0.4, y: 0.6 };

  it("persists an integer bearing in 0..359 from the release pointer", () => {
    const release = bearingBetween(camera, { x: 0.4, y: 0.2 }, content);
    const saved = normalizeBearing(release);
    expect(Number.isInteger(saved)).toBe(true);
    expect(saved).toBe(0);
    expect(saved).toBeGreaterThanOrEqual(0);
    expect(saved).toBeLessThan(360);
  });

  it("normalizes out-of-range and negative degree edits typed into the editor", () => {
    expect(normalizeBearing(-1)).toBe(359);
    expect(normalizeBearing(400)).toBe(40);
    expect(normalizeBearing(359.4)).toBe(359);
  });

  it("keeps aiming independent of the camera position", () => {
    const moved = { x: 0.7, y: 0.2 };
    const deg = 118;
    const handleA = aimOffsetPx(deg, 30);
    const handleB = aimOffsetPx(deg, 30);
    expect(handleA).toEqual(handleB);
    expect(bearingBetween(camera, { x: camera.x, y: camera.y - 0.1 }, content)).toBe(0);
    expect(bearingBetween(moved, { x: moved.x, y: moved.y - 0.1 }, content)).toBe(0);
  });

  it("reports a compass label alongside the degrees for the editor", () => {
    expect(bearingText(0)).toBe("0° N");
    expect(bearingText(270)).toBe("270° W");
  });
});

describe("selected coverage mode", () => {
  it("highlights every real device but never racks, routes or notes", () => {
    for (const k of ["wifi_ap", "camera", "switch", "nvr", "fibre_liu", "data_point", "other"]) {
      expect(selectedCoverageMode(k)).toBe("selected");
    }
    for (const k of ["rack", "cable_route", "note_marker", undefined, null]) {
      expect(selectedCoverageMode(k as string | null | undefined)).toBe("off");
    }
  });

  it("classifies the highlight kind per marker type", () => {
    expect(coverageKind("camera")).toBe("camera");
    expect(coverageKind("wifi_ap")).toBe("wifi");
    expect(coverageKind("switch")).toBe("spotlight");
    expect(coverageKind("fibre_agg_switch")).toBe("spotlight");
    expect(coverageKind("rack")).toBeNull();
    expect(coverageKind("cable_route")).toBeNull();
    expect(coverageKind("note_marker")).toBeNull();
    expect(coverageKind(null)).toBeNull();
  });

  it("supplies helper lines for highlighted devices only", () => {
    expect(coverageHelpText("wifi_ap")).toBe(
      "Wi-Fi coverage preview — strong, good and edge signal bands.",
    );
    expect(coverageHelpText("camera")).toBe(
      "Camera view preview — drag the orange handle to aim the light cone.",
    );
    expect(coverageHelpText("switch")).toBe("Selected device highlighted on the plan.");
    expect(coverageHelpText("rack")).toBeNull();
    expect(coverageHelpText("note_marker")).toBeNull();
    expect(coverageHelpText(null)).toBeNull();
  });
});

describe("rack contents filtering", () => {
  it("returns only equipment installed in the selected rack", () => {
    const items = [
      { id: "a", rack_marker_id: "r1" },
      { id: "b", rack_marker_id: "r2" },
      { id: "c", rack_marker_id: null },
    ];
    expect(rackItemsFor(items as never, "r1").map((i) => i.id)).toEqual(["a"]);
    expect(rackItemsFor(items as never, "r2").map((i) => i.id)).toEqual(["b"]);
    expect(rackItemsFor(undefined, "r1")).toEqual([]);
  });
});

