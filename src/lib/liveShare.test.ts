import { describe, expect, it } from "vitest";
import { isLiveView, keepSelection, nextLiveState, updatedLabel, LIVE_REFRESH_MS } from "./liveShare";

describe("live share mode detection", () => {
  it("only treats confirmed live project packs as live", () => {
    expect(isLiveView({ state: "ok", link: { resource_type: "project_pack", live_project_view: true } })).toBe(true);
    expect(isLiveView({ state: "ok", link: { resource_type: "project_pack", live_project_view: false } })).toBe(false);
    expect(isLiveView({ state: "ok", link: { resource_type: "proposal", live_project_view: true } })).toBe(false);
    expect(isLiveView({ state: "expired", link: { resource_type: "project_pack", live_project_view: true } })).toBe(
      false,
    );
    expect(isLiveView(null)).toBe(false);
  });

  it("refreshes every 30 seconds", () => {
    expect(LIVE_REFRESH_MS).toBe(30_000);
  });
});

describe("background refresh resilience", () => {
  const ok: { state: string; snapshot?: unknown } = { state: "ok", snapshot: { a: 1 } };
  const fresh: { state: string; snapshot?: unknown } = { state: "ok", snapshot: { a: 2 } };

  it("adopts a successful refresh", () => {
    expect(nextLiveState(ok, fresh)).toEqual({ data: fresh, stale: false });
  });

  it("keeps the last valid view when a refresh fails", () => {
    expect(nextLiveState(ok, null)).toEqual({ data: ok, stale: true });
    expect(nextLiveState(ok, { state: "unavailable" })).toEqual({ data: ok, stale: true });
  });

  it("surfaces the failure state on first load", () => {
    expect(nextLiveState(null, { state: "expired" })).toEqual({ data: { state: "expired" }, stale: false });
  });
});

describe("selection stability across refreshes", () => {
  it("keeps a still-present marker and drops a removed one", () => {
    expect(keepSelection("m1", ["m1", "m2"])).toBe("m1");
    expect(keepSelection("m9", ["m1", "m2"])).toBeNull();
    expect(keepSelection(null, ["m1"])).toBeNull();
  });
});

describe("updated label", () => {
  const now = new Date("2026-08-22T12:00:00Z").getTime();
  it("formats recent and older timestamps", () => {
    expect(updatedLabel("2026-08-22T11:59:50Z", now)).toBe("Updated just now");
    expect(updatedLabel("2026-08-22T11:55:00Z", now)).toBe("Updated 5 min ago");
    expect(updatedLabel("2026-08-22T09:00:00Z", now)).toBe("Updated 3 h ago");
    expect(updatedLabel(null, now)).toBe("Updated just now");
    expect(updatedLabel("not-a-date", now)).toBe("Updated just now");
  });
});
