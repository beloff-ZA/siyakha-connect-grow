import { describe, expect, it } from "vitest";
import { activeRoutes, routeStats, type CableRoute } from "./cableRoutes";

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
