import { describe, expect, it } from "vitest";
import { parseExifDateString, readExifCaptureTime } from "@/lib/exifDate";
import { complianceFlags, evidenceState, type EvidenceState } from "@/lib/siteDelivery";
import { evidenceSummary, type DraftPhoto } from "@/lib/siteDeliveryClient";

const update = (over: Record<string, unknown> = {}) =>
  ({
    id: "u1",
    photo_evidence_required: true,
    photo_evidence_override_reason: null,
    approval_status: "submitted",
    client_visible: false,
    published_at: null,
    ...over,
  }) as never;

const photo = (over: Record<string, unknown> = {}) =>
  ({ update_id: "u1", timestamp_confirmed: true, ...over }) as never;

const draft = (over: Partial<DraftPhoto> = {}): DraftPhoto => ({
  localId: Math.random().toString(),
  status: "ready",
  storage_path: "a.jpg",
  category: "during",
  title: "Test photo",
  caption: "",
  floor_id: null,
  timestamp_confirmed: true,
  ...over,
});

describe("EXIF capture time", () => {
  it("parses an EXIF date string", () => {
    expect(parseExifDateString("2026:09:15 07:42:11")).toMatch(/^2026-09-15/);
  });

  it("never invents a time for non-dates or non-JPEG bytes", () => {
    expect(parseExifDateString("not a date")).toBeNull();
    expect(readExifCaptureTime(new Uint8Array([1, 2, 3, 4]).buffer)).toBeNull();
  });
});

describe("evidence state", () => {
  it("is unsatisfied with no photos", () => {
    const state = evidenceState(update(), [], "u1");
    expect(state.photoCount).toBe(0);
    expect(state.satisfied).toBe(false);
  });

  it("is satisfied once photos exist", () => {
    const state = evidenceState(update(), [photo(), photo({ timestamp_confirmed: false })], "u1");
    expect(state.photoCount).toBe(2);
    expect(state.confirmedCount).toBe(1);
    expect(state.satisfied).toBe(true);
  });

  it("is satisfied by a recorded override reason", () => {
    const state = evidenceState(update({ photo_evidence_override_reason: "Access denied by casino security" }), [], "u1");
    expect(state.overridden).toBe(true);
    expect(state.satisfied).toBe(true);
  });

  it("ignores photos belonging to another day", () => {
    expect(evidenceState(update(), [photo({ update_id: "other" })], "u1").photoCount).toBe(0);
  });
});

describe("compliance flags", () => {
  it("tracks the four daily milestones", () => {
    const state: EvidenceState = { photoCount: 2, confirmedCount: 2, required: true, overridden: false, satisfied: true };
    const flags = complianceFlags(update({ approval_status: "approved", client_visible: true, published_at: "now" }), state);
    expect(flags.map((f) => f.done)).toEqual([true, true, true, true]);
    expect(flags[1].label).toBe("Timestamped photos received");
  });

  it("shows a waiver when photos were never received", () => {
    const state: EvidenceState = { photoCount: 0, confirmedCount: 0, required: true, overridden: true, satisfied: true };
    expect(complianceFlags(update(), state)[1].label).toBe("Photo evidence waived");
  });
});

describe("field evidence summary", () => {
  it("counts confirmed and unconfirmed uploads", () => {
    const summary = evidenceSummary([draft(), draft({ timestamp_confirmed: false }), draft({ status: "failed" })]);
    expect(summary.total).toBe(3);
    expect(summary.ready).toBe(2);
    expect(summary.timestampConfirmed).toBe(1);
    expect(summary.timestampUnconfirmed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.hasEvidence).toBe(true);
  });

  it("reports no evidence for an empty update", () => {
    expect(evidenceSummary([]).hasEvidence).toBe(false);
  });
});
