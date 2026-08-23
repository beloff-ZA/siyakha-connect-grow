import { describe, expect, it } from "vitest";
import { activeRoutes, resolveCanvasRoutes, routeStats, type CableRoute } from "./cableRoutes";

const route = (over: Partial<CableRoute>): CableRoute => ({
  id: over.id ?? "r1",
  project_id: "p1",
  floor_id: over.floor_id ?? "f1",
  rack_marker_id: "rack",
  device_marker_id: "dev",
  route_label: over.route_label ?? "R-01",
  cable_type: "cat6",
  service_type: over.service_type ?? "wifi_ap",
  status: over.status ?? "planned",
  waypoints: [],
  client_visible: true,
  notes: null,
  archived_at: over.archived_at ?? null,
  archived_by: null,
  ...over,
});

describe("activeRoutes", () => {
  it("drops archived routes and keeps live ones", () => {
    const rows = [
      route({ id: "a" }),
      route({ id: "b", archived_at: "2026-01-01T00:00:00Z" }),
      route({ id: "c" }),
    ];
    expect(activeRoutes(rows).map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("leaves a fully live list untouched", () => {
    const rows = [route({ id: "a" }), route({ id: "b" })];
    expect(activeRoutes(rows)).toHaveLength(2);
  });
});

describe("route counters use active routes only", () => {
  it("never counts archived routes in the totals", () => {
    const rows = [
      route({ id: "a", service_type: "wifi_ap" }),
      route({ id: "b", service_type: "camera" }),
      route({ id: "c", service_type: "camera", archived_at: "2026-02-02T00:00:00Z" }),
    ];
    const stats = routeStats(activeRoutes(rows));
    expect(stats.total).toBe(2);
    expect(stats.wifi).toBe(1);
    expect(stats.camera).toBe(1);
    expect(routeStats(rows).total).toBe(3); // raw list would over-count
  });
});

describe("canvas route resolution", () => {
  const rows = [
    route({ id: "a", floor_id: "f1", service_type: "wifi_ap" }),
    route({ id: "b", floor_id: "f1", service_type: "camera", status: "installed" }),
    route({ id: "c", floor_id: "f2" }),
    { ...route({ id: "d", floor_id: "f1" }), archived_at: "2026-01-01" },
    { ...route({ id: "e", floor_id: "f1" }), device_marker_id: "gone" },
  ];
  const pos: Record<string, { x: number; y: number }> = {
    rack: { x: 0.1, y: 0.1 },
    dev: { x: 0.8, y: 0.8 },
  };
  const resolved = resolveCanvasRoutes(rows, "f1", (id) => pos[id] ?? null);

  it("only draws active routes on the current level with both endpoints resolved", () => {
    expect(resolved.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("uses live marker coordinates for the endpoints", () => {
    expect(resolved[0].from).toEqual({ x: 0.1, y: 0.1 });
    expect(resolved[0].to).toEqual({ x: 0.8, y: 0.8 });
  });

  it("marks only planned routes editable", () => {
    expect(resolved[0].editable).toBe(true);
    expect(resolved[1].editable).toBe(false);
  });

  it("prefers local draft waypoints when supplied", () => {
    const draft = resolveCanvasRoutes(rows, "f1", (id) => pos[id] ?? null, () => [{ x: 0.5, y: 0.5 }]);
    expect(draft[0].waypoints).toEqual([{ x: 0.5, y: 0.5 }]);
  });

  it("returns nothing without a selected level", () => {
    expect(resolveCanvasRoutes(rows, "", (id) => pos[id] ?? null)).toEqual([]);
  });
});
