import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildCampaignDescription,
  buildCampaignPayload,
  emptyCampaignForm,
  isCampaignFormValid,
  isDecemberDate,
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

describe("December date rules", () => {
  it("accepts the inclusive December 2026 boundaries", () => {
    expect(isDecemberDate("2026-12-01")).toBe(true);
    expect(isDecemberDate("2026-12-31")).toBe(true);
    expect(isDecemberDate("2026-12-15")).toBe(true);
  });

  it("rejects past, future and out-of-month dates", () => {
    expect(isDecemberDate("2026-11-30")).toBe(false);
    expect(isDecemberDate("2027-01-01")).toBe(false);
    expect(isDecemberDate("2025-12-10")).toBe(false);
    expect(isDecemberDate("08/12/2026")).toBe(false);
    expect(isDecemberDate("")).toBe(false);
  });

  it("blocks identical primary and alternate dates", () => {
    const errors = validateCampaignForm({ ...validForm(), alternate_date: "2026-12-08" });
    expect(errors.alternate_date).toBeTruthy();
  });

  it("allows a blank alternate date", () => {
    expect(validateCampaignForm({ ...validForm(), alternate_date: "" }).alternate_date).toBeUndefined();
  });
});

describe("campaign form validation", () => {
  it("accepts a complete booking request", () => {
    expect(validateCampaignForm(validForm())).toEqual({});
    expect(isCampaignFormValid(validForm())).toBe(true);
  });

  it("requires scope, region, city and a December preferred date", () => {
    const errors = validateCampaignForm(emptyCampaignForm());
    expect(errors.scope).toBeTruthy();
    expect(errors.location).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.preferred_date).toBeTruthy();
    expect(errors.consent).toBeTruthy();
  });

  it("rejects invalid email and phone", () => {
    const errors = validateCampaignForm({ ...validForm(), work_email: "nope", phone: "abc" });
    expect(errors.work_email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it("keeps rack count optional but sane", () => {
    expect(validateCampaignForm({ ...validForm(), rack_count: "" }).rack_count).toBeUndefined();
    expect(validateCampaignForm({ ...validForm(), rack_count: "0" }).rack_count).toBeTruthy();
    expect(validateCampaignForm({ ...validForm(), rack_count: "2.5" }).rack_count).toBeTruthy();
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
    expect(description).toContain("Draft offer");
    expect(description).toContain("Client notes: Comms room on the third floor.");
    expect(description.length).toBeLessThanOrEqual(4000);
  });

  it("marks the preferred date as a request, never confirmed availability", () => {
    const description = buildCampaignDescription(validForm());
    expect(description).toContain("Preferred service date (request only): 2026-12-08");
    expect(description).not.toContain("confirmed booking");
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

  it("surfaces backend failures without marking success", async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error("FunctionsHttpError: 500") });
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
    expect(CAMPAIGN.cta).toBe("Book now. Lock in your discount.");
    expect(CAMPAIGN.phrase).toBe("UNTANGLE THE YEAR.");
    expect(CAMPAIGN.draftNotice).toContain("Draft offer");
  });
});
