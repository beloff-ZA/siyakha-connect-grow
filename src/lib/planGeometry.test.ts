import { describe, expect, it } from "vitest";
import { containRect, pointerToNorm, zoomAbout, wheelZoomFactor, clampUnit } from "./planGeometry";

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
