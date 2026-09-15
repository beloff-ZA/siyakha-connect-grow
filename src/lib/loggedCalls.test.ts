import { describe, expect, it } from "vitest";
import { customerName, formatDuration, signoffReadiness, statusLabel, timeOnSiteMinutes, totalKm, type LoggedCall } from "./loggedCalls";

describe("totalKm", () => {
  it("returns the difference", () => expect(totalKm(1000, 1120)).toBe(120));
  it("is null when incomplete", () => {
    expect(totalKm(null, 100)).toBeNull();
    expect(totalKm(100, null)).toBeNull();
  });
  it("is null when closing is lower than opening", () => expect(totalKm(500, 400)).toBeNull());
});

describe("timeOnSiteMinutes", () => {
  it("computes minutes", () =>
    expect(timeOnSiteMinutes("2026-09-15T11:45:00Z", "2026-09-15T13:15:00Z")).toBe(90));
  it("is null when departure precedes arrival", () =>
    expect(timeOnSiteMinutes("2026-09-15T13:00:00Z", "2026-09-15T11:00:00Z")).toBeNull());
  it("is null when missing", () => expect(timeOnSiteMinutes(null, null)).toBeNull());
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => expect(formatDuration(90)).toBe("1 hrs 30 min"));
  it("handles null", () => expect(formatDuration(null)).toBe("—"));
});

describe("statusLabel", () => {
  it("humanises statuses", () => expect(statusLabel("awaiting_signoff")).toBe("Awaiting Signoff"));
});

describe("customerName", () => {
  it("joins names", () =>
    expect(customerName({ end_customer_first_name: "Julian", end_customer_last_name: "Julian" })).toBe("Julian Julian"));
  it("tolerates missing parts", () =>
    expect(customerName({ end_customer_first_name: null, end_customer_last_name: "Parkies" })).toBe("Parkies"));
});

describe("signoffReadiness", () => {
  const base = {
    fault_solution: "Router installed, link up, speed test passed.",
    arrival_at: "2026-09-15T11:45:00Z",
    departure_at: "2026-09-15T13:15:00Z",
  } as LoggedCall;

  it("is ready when work and times are captured", () => {
    expect(signoffReadiness(base)).toEqual({ ready: true, missing: [] });
  });

  it("lists every missing field", () => {
    const res = signoffReadiness({ fault_solution: "  ", arrival_at: null, departure_at: null } as LoggedCall);
    expect(res.ready).toBe(false);
    expect(res.missing).toHaveLength(3);
  });
});
