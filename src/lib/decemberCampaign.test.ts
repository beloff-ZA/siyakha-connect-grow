import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildCampaignDescription,
  buildCampaignPayload,
  emptyCampaignForm,
  isCampaignFormValid,
  isCampaignOpen,
  isRequestableDate,
  minRequestDate,
  todaySAST,
  validateCampaignForm,
} from "./decemberCampaign";
import { CAMPAIGN } from "@/content/decemberCleanup";
import { submitLead } from "./leadsApi";

// Mocked transport — no live edge-function calls, no owner emails.
const invokeMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invokeMock(...args) } },
}));

const validForm = () => ({
  ...emptyCampaignForm(),
  scope: "Both — clean-up and maintenance",
  rack_count: "2",
  location: "Durban / KZN",
  city: "Umhlanga",
  preferred_date: "2026-12-08",
  alternate_date: "2026-12-15",
  full_name: "Thabo Mokoena",
  company: "Sandton Property Group",
  work_email: "thabo@sandtonproperty.co.za",
  phone: "+27 82 555 1234",
  notes: "Comms room on the third floor.",
  consent: true,
});

// Fixed "today" values make every boundary test deterministic.
const BEFORE_DEC = "2026-10-23";
const IN_DEC = "2026-12-10";
const AFTER_DEC = "2027-01-05";

describe("SAST today", () => {
  it("resolves the Africa/Johannesburg calendar date", () => {
    // 2026-12-01 00:30 SAST is still 30 Nov UTC — SAST must already be December.
    expect(todaySAST(new Date("2026-11-30T22:30:00.000Z"))).toBe("2026-12-01");
    expect(todaySAST(new Date("2026-10-23T12:00:00.000Z"))).toBe("2026-10-23");
  });
});

describe("December date rules", () => {
  it("accepts the inclusive December 2026 boundaries before December", () => {
    expect(isRequestableDate("2026-12-01", BEFORE_DEC)).toBe(true);
    expect(isRequestableDate("2026-12-31", BEFORE_DEC)).toBe(true);
    expect(isRequestableDate("2026-12-15", BEFORE_DEC)).toBe(true);
  });

  it("rejects out-of-month and malformed dates", () => {
    expect(isRequestableDate("2026-11-30", BEFORE_DEC)).toBe(false);
    expect(isRequestableDate("2027-01-01", BEFORE_DEC)).toBe(false);
    expect(isRequestableDate("2025-12-10", BEFORE_DEC)).toBe(false);
    expect(isRequestableDate("08/12/2026", BEFORE_DEC)).toBe(false);
    expect(isRequestableDate("", BEFORE_DEC)).toBe(false);
  });

  it("once December begins, past days are no longer requestable", () => {
    expect(minRequestDate(IN_DEC)).toBe("2026-12-10");
    expect(isRequestableDate("2026-12-01", IN_DEC)).toBe(false);
    expect(isRequestableDate("2026-12-09", IN_DEC)).toBe(false);
    expect(isRequestableDate("2026-12-10", IN_DEC)).toBe(true);
    expect(isRequestableDate("2026-12-31", IN_DEC)).toBe(true);
  });

  it("before December the minimum is 1 December", () => {
    expect(minRequestDate(BEFORE_DEC)).toBe("2026-12-01");
  });

  it("closes the campaign after December ends", () => {
    expect(isCampaignOpen(AFTER_DEC)).toBe(false);
    expect(isCampaignOpen("2026-12-31")).toBe(true);
    const errors = validateCampaignForm(validForm(), AFTER_DEC);
    expect(errors.preferred_date).toBe("December 2026 bookings have closed.");
  });

  it("blocks identical primary and alternate dates", () => {
    const errors = validateCampaignForm({ ...validForm(), alternate_date: "2026-12-08" }, BEFORE_DEC);
    expect(errors.alternate_date).toBeTruthy();
  });

  it("allows a blank alternate date", () => {
    expect(validateCampaignForm({ ...validForm(), alternate_date: "" }, BEFORE_DEC).alternate_date).toBeUndefined();
  });
});

describe("campaign form validation", () => {
  it("accepts a complete booking request", () => {
    expect(validateCampaignForm(validForm(), BEFORE_DEC)).toEqual({});
    expect(isCampaignFormValid(validForm(), BEFORE_DEC)).toBe(true);
  });

  it("requires scope, region, city and a December preferred date", () => {
    const errors = validateCampaignForm(emptyCampaignForm(), BEFORE_DEC);
    expect(errors.scope).toBeTruthy();
    expect(errors.location).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.preferred_date).toBeTruthy();
    expect(errors.consent).toBeTruthy();
  });

  it("rejects invalid email and phone", () => {
    const errors = validateCampaignForm({ ...validForm(), work_email: "nope", phone: "abc" }, BEFORE_DEC);
    expect(errors.work_email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it("keeps rack count optional but sane", () => {
    expect(validateCampaignForm({ ...validForm(), rack_count: "" }, BEFORE_DEC).rack_count).toBeUndefined();
    expect(validateCampaignForm({ ...validForm(), rack_count: "0" }, BEFORE_DEC).rack_count).toBeTruthy();
    expect(validateCampaignForm({ ...validForm(), rack_count: "2.5" }, BEFORE_DEC).rack_count).toBeTruthy();
  });
});

describe("campaign payload mapping", () => {
  it("maps to the existing lead schema with the campaign source", () => {
    const payload = buildCampaignPayload(validForm(), {});
    expect(payload.source).toBe("december-cleanup-2026");
    expect(payload.service).toBe("Office Networking & Structured Cabling");
    expect(payload.location).toBe("Durban / KZN");
    expect(payload.timeline).toContain("2026-12-08");
    expect(payload.timeline).toContain("not confirmed");
    expect(payload.consent).toBe(true);
  });

  it("persists labelled campaign details inside project_description", () => {
    const description = buildCampaignDescription(validForm());
    expect(description).toContain("Scope requested: Both — clean-up and maintenance");
    expect(description).toContain("City / suburb: Umhlanga");
    expect(description).toContain("Cabinets / racks: 2");
    expect(description).toContain("Alternate date (request only): 2026-12-15");
    expect(description).toContain("Client notes: Comms room on the third floor.");
    expect(description.length).toBeLessThanOrEqual(4000);
  });

  it("marks the preferred date as a request, never confirmed availability", () => {
    const description = buildCampaignDescription(validForm());
    expect(description).toContain("Preferred service date (request only): 2026-12-08");
    expect(description).not.toContain("confirmed booking");
  });

  it("carries the honeypot through to the payload", () => {
    expect(buildCampaignPayload(validForm(), {}).honeypot).toBe("");
    expect(buildCampaignPayload({ ...validForm(), honeypot: "spammy" }, {}).honeypot).toBe("spammy");
  });

  it("keeps the description within payload limits even with long notes", () => {
    const description = buildCampaignDescription({ ...validForm(), notes: "x".repeat(1500) });
    expect(description.length).toBeLessThanOrEqual(4000);
  });
});

describe("submitLead transport contract (mocked)", () => {
  beforeEach(() => invokeMock.mockReset());

  it("reports success only with a confirmed lead_id", async () => {
    invokeMock.mockResolvedValue({ data: { lead_id: "abc-123", status: "stored" }, error: null });
    const result = await submitLead(buildCampaignPayload(validForm(), {}));
    expect(result).toEqual({ ok: true, leadId: "abc-123", duplicate: false, emailDelivered: false });
  });

  it("treats a missing lead_id as failure even on HTTP 200", async () => {
    invokeMock.mockResolvedValue({ data: { status: "stored" }, error: null });
    const result = await submitLead(buildCampaignPayload(validForm(), {}));
    expect(result.ok).toBe(false);
  });

  it("a photo quote requires confirmed photo storage as well as a lead ID", async () => {
    const payload = { ...buildCampaignPayload(validForm(), {}), cabinet_photo: { mime: "image/png", base64: "mock" } };
    invokeMock.mockResolvedValue({ data: { lead_id: "test-id", status: "stored" }, error: null });
    expect((await submitLead(payload)).ok).toBe(false);
    invokeMock.mockResolvedValue({ data: { lead_id: "test-id", photo_stored: true, notification_status: "failed", email_delivered: false }, error: null });
    expect(await submitLead(payload)).toMatchObject({ ok: true, photoStored: true, emailDelivered: false, notificationStatus: "failed" });
  });

  it("surfaces backend failures without marking success", async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error("FunctionsHttpError: 500") });
    const result = await submitLead(buildCampaignPayload(validForm(), {}));
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("surfaces network failures without marking success", async () => {
    // supabase-js resolves network failures as { data: null, error }.
    invokeMock.mockResolvedValue({ data: null, error: new Error("FunctionsFetchError: Failed to fetch") });
    const result = await submitLead(buildCampaignPayload(validForm(), {}));
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("flags duplicate submissions as stored, not as a new lead", async () => {
    invokeMock.mockResolvedValue({ data: { lead_id: "abc-123", duplicate: true }, error: null });
    const result = await submitLead(buildCampaignPayload(validForm(), {}));
    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(true);
  });

  it("sends the payload to the existing submit-lead function unchanged", async () => {
    invokeMock.mockResolvedValue({ data: { lead_id: "x" }, error: null });
    const payload = buildCampaignPayload(validForm(), {});
    await submitLead(payload);
    expect(invokeMock).toHaveBeenCalledWith("submit-lead", { body: payload });
  });
});

describe("campaign constants", () => {
  it("never invents prices, deadlines or scarcity", () => {
    const text = JSON.stringify(CAMPAIGN).toLowerCase();
    expect(text).not.toMatch(/from r\d/);
    expect(text).not.toContain("countdown");
    expect(text).not.toContain("only 3 slots");
    expect(text).not.toContain("limited slots");
    expect(text).not.toContain("hurry");
    expect(text).not.toContain("deadline");
  });

  it("carries the exact draft offer wording and CTA", () => {
    expect(CAMPAIGN.offerHeadline).toBe(
      "20% off server clean-up and network-maintenance labour for December bookings.",
    );
    expect(CAMPAIGN.offerExclusion).toBe("Hardware and cabling materials excluded.");
    expect(CAMPAIGN.phrase).toBe("UNTANGLE THE YEAR.");
  });
});
