import { describe, expect, it } from "vitest";
import {
  ACCEPTANCE_TERMS,
  BOQ_NOT_ISSUED_MESSAGE,
  CLIENT_BOQ_LINE_KEYS,
  PREVIOUS_REVISION_MESSAGE,
  acceptanceState,
  assertAcceptanceAllowed,
  clientBoqAllowlistIsSafe,
  clientBoqTotals,
  groupBoqSections,
  isClientVisibleBoq,
  isValidEmail,
  noteRateExceeded,
  normalizeEmail,
  registrationIsValid,
  revisionFingerprint,
  sanitizeNoteBody,
  scopeThreads,
  toClientBoqLines,
  validateNote,
  validateRegistration,
  viewerMatchesScope,
} from "./deckViewer";
import { findSensitiveKeys } from "./reporting";
import {
  MODEL_CAPABILITIES,
  RETENTION_PENDING,
  benefitCards,
  capabilitiesFor,
  equipmentSummary,
  retentionEstimate,
} from "./deliverySummary";

const registration = { first_name: "Ayanda", surname: "Mkhize", email: "Ayanda@Client.co.za ", consent: true };

describe("viewer registration gate", () => {
  it("requires both names, a valid email and explicit consent", () => {
    expect(registrationIsValid(registration)).toBe(true);
    expect(Object.keys(validateRegistration({ ...registration, consent: false }))).toContain("consent");
    expect(Object.keys(validateRegistration({ ...registration, email: "nope" }))).toContain("email");
    expect(Object.keys(validateRegistration({ ...registration, first_name: " " }))).toContain("first_name");
    expect(registrationIsValid({})).toBe(false);
  });

  it("never asks for a password and normalises the email", () => {
    expect(Object.keys(registration)).not.toContain("password");
    expect(normalizeEmail(registration.email)).toBe("ayanda@client.co.za");
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("scopes a viewer record to one project and share link", () => {
    const viewer = { project_id: "p1", share_link_id: "s1" };
    expect(viewerMatchesScope(viewer, { project_id: "p1", share_link_id: "s1" })).toBe(true);
    expect(viewerMatchesScope(viewer, { project_id: "p2", share_link_id: "s1" })).toBe(false);
    expect(viewerMatchesScope(viewer, { project_id: "p1", share_link_id: "s2" })).toBe(false);
  });
});

describe("client-safe BOQ view", () => {
  const rows = [
    {
      id: "1",
      item_code: "NET-003",
      description: "Grandstream GCC6020 gateway",
      quantity: 1,
      unit: "ea",
      customer_unit_rate: 7265,
      line_total: 7265,
      section: "Core Network",
      supplier_name: "Dunamis",
      supplier_cost: 6000,
      markup_percent: 21,
      margin: 1265,
      internal_notes: "call rep",
      banking_details: "acct 123",
    },
  ];

  it("allowlists only non-sensitive customer fields", () => {
    expect(clientBoqAllowlistIsSafe()).toBe(true);
    expect(findSensitiveKeys(CLIENT_BOQ_LINE_KEYS as unknown as string[])).toEqual([]);
    const [line] = toClientBoqLines(rows);
    const keys = Object.keys(line);
    for (const banned of ["supplier_name", "supplier_cost", "markup_percent", "margin", "internal_notes", "banking_details"])
      expect(keys).not.toContain(banned);
    expect(line.customer_unit_rate).toBe(7265);
  });

  it("groups sections and totals with 15% VAT", () => {
    const sections = groupBoqSections(toClientBoqLines(rows));
    expect(sections).toHaveLength(1);
    expect(sections[0].subtotal).toBe(7265);
    const totals = clientBoqTotals(toClientBoqLines(rows), { vat_enabled: true, vat_rate: 15 });
    expect(totals.subtotal).toBe(7265);
    expect(Math.round(totals.vat * 100) / 100).toBe(1089.75);
    expect(Math.round(totals.total * 100) / 100).toBe(8354.75);
  });

  it("is truthful when nothing has been issued to the client", () => {
    expect(isClientVisibleBoq({ status: "draft" })).toBe(false);
    expect(isClientVisibleBoq({ status: "approved" })).toBe(true);
    expect(isClientVisibleBoq(null)).toBe(false);
    expect(BOQ_NOT_ISSUED_MESSAGE).toMatch(/not yet issued/i);
  });
});

describe("BOQ acceptance", () => {
  const base = {
    boq_id: "b1",
    revision_label: "Rev 1",
    version_no: 1,
    line_count: 88,
    subtotal: 949800,
    vat: 142470,
    total: 1092270,
  };
  const hash = revisionFingerprint(base);

  it("fingerprints the exact revision and totals", () => {
    expect(revisionFingerprint(base)).toBe(hash);
    expect(revisionFingerprint({ ...base, subtotal: 949801 })).not.toBe(hash);
    expect(revisionFingerprint({ ...base, line_count: 89 })).not.toBe(hash);
  });

  it("viewing or registering never accepts anything", () => {
    expect(acceptanceState([], hash)).toBe("none");
    expect(() => assertAcceptanceAllowed({ confirmed: false, revision_hash: hash, boq_id: "b1" })).toThrow();
  });

  it("requires a deliberate confirmation tied to the current revision", () => {
    expect(() =>
      assertAcceptanceAllowed({ confirmed: true, revision_hash: hash, boq_id: "b1" }),
    ).not.toThrow();
    expect(() =>
      assertAcceptanceAllowed({ confirmed: true, revision_hash: "", boq_id: "b1" }),
    ).toThrow();
  });

  it("never transfers an acceptance to a new revision", () => {
    const accepted = [{ revision_hash: hash, accepted_at: "2026-08-01T09:00:00Z" }];
    expect(acceptanceState(accepted, hash)).toBe("accepted");
    expect(acceptanceState(accepted, revisionFingerprint({ ...base, subtotal: 960000 }))).toBe("previous_revision");
    expect(PREVIOUS_REVISION_MESSAGE).toMatch(/new acceptance required/i);
    expect(ACCEPTANCE_TERMS).toMatch(/accept it as the basis for the next project stage/i);
  });
});

describe("client notes", () => {
  it("validates, limits and safely renders plain text", () => {
    expect(validateNote("hi")).toBeTruthy();
    expect(validateNote("A".repeat(5000))).toBeTruthy();
    expect(validateNote("Please confirm the riser route.")).toBeNull();
    expect(sanitizeNoteBody("<script>alert(1)</script> hello")).not.toContain("<script");
  });

  it("rate limits bursts of notes", () => {
    const now = Date.now();
    expect(noteRateExceeded([now, now, now, now, now], now)).toBe(true);
    expect(noteRateExceeded([now - 10 * 60_000], now)).toBe(false);
  });

  it("cannot cross projects or tokens", () => {
    const threads = [
      { id: "t1", project_id: "p1", share_link_id: "s1" },
      { id: "t2", project_id: "p2", share_link_id: "s1" },
      { id: "t3", project_id: "p1", share_link_id: "s2" },
    ];
    expect(scopeThreads(threads, { project_id: "p1", share_link_id: "s1" }).map((t) => t.id)).toEqual(["t1"]);
  });
});

describe("dynamic equipment summary and retention", () => {
  const summary = equipmentSummary({
    markers: [
      { marker_type: "wifi_ap", model: "GWN7660" },
      { marker_type: "wifi_ap", model: "GWN7660" },
      { marker_type: "camera", model: "cam" },
      { marker_type: "rack", model: "rack" },
    ],
    rack: [
      { equipment_type: "access_switch", model: "GWN7813P", equipment_name: "Grandstream GWN7813P", quantity: 2, copper_ports: 48 },
      { equipment_type: "aggregation_switch", model: "GWN7832", equipment_name: "Grandstream GWN7832", sfp_plus_ports: 4 },
    ],
    boqLines: [
      { item_code: "CCTV-010", description: "Hikvision NVR 64CH recorder", quantity: 1 },
      { item_code: "CCTV-011", description: "WD 16tb surveillance-grade hard drive", quantity: 4 },
      { item_code: "PWR-001", description: "Deye 8.8kW hybrid inverter", quantity: 1, section: "Connectivity Power Solution" },
    ],
  });

  it("reads real counts and models, and never invents an absent item", () => {
    expect(summary.access_points).toBe(2);
    expect(summary.cameras).toBe(1);
    expect(summary.racks).toBe(1);
    expect(summary.gateway).toBeNull();
    expect(summary.nvr?.channels).toBe(64);
    expect(summary.storage?.raw_tb).toBe(16);
    expect(summary.storage?.drives).toBe(4);
    expect(summary.fibre.missing.length).toBeGreaterThan(0);
  });

  it("only claims capabilities the stored model supports", () => {
    expect(capabilitiesFor("GWN7660")).toContain("Wi-Fi 6");
    expect(capabilitiesFor("Unknown-AP-9000")).toEqual([]);
    const cards = benefitCards(summary, null);
    const wifi = cards.find((c) => c.title === "Wi-Fi access points");
    expect(wifi?.points).toContain("WPA3");
    expect(cards.some((c) => c.title === "Gateway and firewall")).toBe(false);
    expect(Object.keys(MODEL_CAPABILITIES)).toContain("GCC6020");
  });

  it("computes retention from the documented formula and falls back truthfully", () => {
    const est = retentionEstimate({
      camera_count: 63,
      raw_capacity_tb: 64,
      usable_capacity_factor: 0.9,
      average_bitrate_kbps: 4096,
      recording_duty_cycle: 1,
    });
    expect(est.ok).toBe(true);
    if (est.ok) {
      const expected = (64 * 1e12 * 0.9 * 8) / (63 * 4096 * 1000) / 86400;
      expect(est.days).toBeCloseTo(Math.round(expected * 10) / 10, 1);
      expect(est.label).toMatch(/Estimated/);
    }
    const pending = retentionEstimate({ camera_count: 63 });
    expect(pending.ok).toBe(false);
    if (pending.ok === false) {
      expect(pending.reason).toBe(RETENTION_PENDING);
      expect(pending.missing).toContain("average bitrate");
    }
  });

  it("keeps the power runtime statement conditional", () => {
    const card = benefitCards(summary, null).find((c) => c.title === "Resilient power");
    expect(card?.points.join(" ")).toMatch(/subject to/i);
    expect(card?.points.join(" ")).not.toMatch(/guarantee/i);
  });
});
