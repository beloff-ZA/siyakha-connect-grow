import { describe, expect, it } from "vitest";
import { buildSiteReport, historyLabel, NOT_REPORTED, reportHistory } from "@/lib/dailyReport";

const update = (over: Partial<any> = {}): any => ({
  id: "u1",
  project_id: "p1",
  floor_id: "f1",
  area_label: null,
  shift_date: "2026-09-15",
  submitted_at: "2026-09-16T06:10:00.000Z",
  submitted_by_name: "Michael (Mike)",
  source: "field",
  category: "Cabling",
  photos_outstanding: false,
  baseline_category: null,
  backdated: true,
  photo_evidence_required: true,
  photo_evidence_override_reason: null,
  photo_evidence_override_by: null,
  photo_evidence_override_at: null,
  work_completed: "Pulled cable on first floor",
  work_outstanding: null,
  blockers: "Ceiling access locked",
  materials_required: null,
  team_onsite: null,
  progress_pct: 20,
  next_shift_plan: null,
  notes: "Site note text",
  internal_notes: "INTERNAL ONLY office comment",
  client_visible: true,
  approval_status: "approved",
  approved_at: "2026-09-16T07:00:00.000Z",
  published_at: "2026-09-16T07:00:00.000Z",
  locked_at: null,
  ...over,
});

const photo = (over: Partial<any> = {}): any => ({
  id: "ph1",
  update_id: "u1",
  issue_id: null,
  floor_id: "f1",
  category: "during",
  title: "First floor cable tray",
  caption: "Tray installed",
  storage_path: "path/a.jpg",
  original_storage_path: null,
  original_filename: null,
  original_file_size: null,
  exif_captured_at: null,
  uploaded_at: "2026-09-15T12:00:00.000Z",
  timestamp_confirmed: true,
  taken_at: "2026-09-15T12:00:00.000Z",
  client_visible: true,
  sort_order: 1,
  ...over,
});

const base = (over: Partial<any> = {}) => ({
  project: { title: "DIGICONNECT C/O SUN INTERNATIONAL", reference: "01_01_2026_33", address: "Sun International" },
  client_name: "Digiconnect",
  from: "2026-09-15",
  floors: [{ id: "f1", display_name: "First Floor" }],
  updates: [update()],
  photos: [photo()],
  issues: [],
  scopeChanges: [],
  nextSteps: [],
  progress: [],
  ...over,
});

describe("buildSiteReport", () => {
  it("uses only recorded data and groups by work date, not submission date", () => {
    const r = buildSiteReport(base() as any);
    expect(r.days).toHaveLength(1);
    expect(r.days[0].work_date).toBe("2026-09-15");
    expect(r.days[0].submitted_at.startsWith("2026-09-16")).toBe(true);
    expect(r.days[0].work_completed).toBe("Pulled cable on first floor");
    expect(r.days[0].work_outstanding).toBeNull();
    expect(r.days[0].photos[0]).toMatchObject({ title: "First floor cable tray", floor: "First Floor", timestamp_confirmed: true });
  });

  it("never exposes internal notes or any commercial field", () => {
    const json = JSON.stringify(buildSiteReport(base() as any));
    expect(json).not.toContain("INTERNAL ONLY");
    const keys = Object.keys(JSON.parse(json)).join(" ");
    expect(keys).not.toMatch(/price|cost|\brate\b|margin|markup|vat|total/i);
  });

  it("omits hidden photos and hidden additional works, and shows client-visible ones", () => {
    const r = buildSiteReport(
      base({
        photos: [photo({ client_visible: false })],
        scopeChanges: [
          { id: "s1", work_date: "2026-09-15", title: "Extra route", description: null, trigger_reason: null, status: "under_review", floor_id: "f1", area_label: null, client_visible: true },
          { id: "s2", work_date: "2026-09-15", title: "Hidden item", description: null, trigger_reason: null, status: "identified", floor_id: null, area_label: null, client_visible: false },
        ],
      }) as any,
    );
    expect(r.photos).toHaveLength(0);
    expect(r.scope_items.map((s) => s.id)).toEqual(["s1"]);
  });

  it("falls back to Not reported for missing team and reports no progress when none recorded", () => {
    const r = buildSiteReport(base({ updates: [update({ submitted_by_name: "", team_onsite: null })] }) as any);
    expect(r.days[0].team).toBe(NOT_REPORTED);
    expect(r.overall_progress).toBeNull();
  });

  it("supports a date range so a weekly report reuses the same structure", () => {
    const r = buildSiteReport(
      base({ from: "2026-09-14", to: "2026-09-15", updates: [update(), update({ id: "u2", shift_date: "2026-09-14" })] }) as any,
    );
    expect(r.days.map((d) => d.work_date)).toEqual(["2026-09-14", "2026-09-15"]);
  });
});

describe("reportHistory", () => {
  it("lists work dates newest first with publication state", () => {
    const rows = reportHistory([update(), update({ id: "u2", shift_date: "2026-09-14", client_visible: false, published_at: null })]);
    expect(rows.map((r) => r.date)).toEqual(["2026-09-15", "2026-09-14"]);
    expect(historyLabel(rows[0])).toBe("Client report published");
    expect(historyLabel(rows[1])).toBe("Internal only — not published");
  });
});
