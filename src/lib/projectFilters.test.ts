import { describe, expect, it } from "vitest";
import { inferClientType, inferRegion } from "./projectFilters";

describe("project filters", () => {
  it("leaves an unknown venue unassigned rather than claiming South Africa", () => {
    expect(inferRegion("")).toBe("");
    expect(inferRegion("  ")).toBe("");
  });
  it("retains established region mappings for existing projects", () => {
    expect(inferRegion("Cape Town")).toBe("South Africa");
    expect(inferRegion("North West, South Africa")).toBe("South Africa");
    expect(inferRegion("Dubai")).toBe("GCC");
    expect(inferRegion("London")).toBe("UK");
  });
  it("classifies Events & Conferences as Events", () => {
    expect(inferClientType("Events & Conferences")).toBe("Events");
  });
});