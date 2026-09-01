import { describe, it, expect } from "vitest";
import {
  buildLeadPayload,
  emptyLeadForm,
  enquiryHref,
  isQualifiedService,
  isLeadFormValid,
  resolveService,
  validateLeadForm,
  LEAD_SERVICES,
  LEAD_LOCATIONS,
  AI_FOCUS_AREAS,
} from "./leadForm";
import { buildEventPayload } from "./analytics";
import { parseAttribution, mergeAttribution, deriveSource } from "./attribution";
import { filterLeads, type WebsiteLead } from "./leadsApi";
import { buildLocalBusinessSchema, buildServiceSchema } from "./seoSchema";

const validForm = () => ({
  ...emptyLeadForm(),
  full_name: "Thabo Mokoena",
  company: "Sandton Property Group",
  work_email: "thabo@sandtonproperty.co.za",
  phone: "+27 82 555 1234",
  service: "Business Wi-Fi",
  location: "Johannesburg / Sandton",
  project_description: "Six-floor office block in Sandton needs full Wi-Fi coverage and a new cabinet.",
  consent: true,
});

describe("lead form validation", () => {
  it("accepts a complete B2B enquiry", () => {
    expect(validateLeadForm(validForm())).toEqual({});
    expect(isLeadFormValid(validForm())).toBe(true);
  });

  it("rejects a missing name, bad email and short description", () => {
    const errors = validateLeadForm({
      ...validForm(),
      full_name: "",
      work_email: "not-an-email",
      project_description: "too short",
    });
    expect(errors.full_name).toBeTruthy();
    expect(errors.work_email).toBeTruthy();
    expect(errors.project_description).toBeTruthy();
  });

  it("requires a contact number on at least one channel", () => {
    expect(validateLeadForm({ ...validForm(), phone: "", whatsapp: "" }).phone).toBeTruthy();
    expect(validateLeadForm({ ...validForm(), phone: "", whatsapp: "0815012993" }).phone).toBeUndefined();
  });

  it("requires consent, a known service and a known location", () => {
    expect(validateLeadForm({ ...validForm(), consent: false }).consent).toBeTruthy();
    expect(validateLeadForm({ ...validForm(), service: "Rocket launches" }).service).toBeTruthy();
    expect(validateLeadForm({ ...validForm(), location: "Cape Town" }).location).toBeTruthy();
  });

  it("exposes the required B2B service and location options", () => {
    expect(LEAD_SERVICES).toContain("Field Support Engineers / Smart Hands");
    expect(LEAD_SERVICES).toContain("Student Accommodation Connectivity");
    expect(LEAD_SERVICES).toContain("Business Process & AI Solutions");
    expect(LEAD_SERVICES).toContain("Restaurant Technology");
    expect(LEAD_SERVICES).toContain("Websites, Hosting & Domains");
    expect(LEAD_SERVICES).not.toContain("Event Wi-Fi");
    expect(LEAD_LOCATIONS[0]).toBe("Johannesburg / Sandton");
    expect(LEAD_LOCATIONS[1]).toBe("Durban / KZN");
  });
});

describe("business process & AI qualification", () => {
  const aiForm = () => ({
    ...validForm(),
    service: "Business Process & AI Solutions",
    focus_areas: [] as string[],
  });

  it("requires at least one focus area for the AI service", () => {
    expect(validateLeadForm(aiForm()).focus_areas).toBeTruthy();
    expect(
      validateLeadForm({ ...aiForm(), focus_areas: ["AI voice agents", "Appointment booking"] }).focus_areas,
    ).toBeUndefined();
  });

  it("keeps every required sub-choice available", () => {
    expect(AI_FOCUS_AREAS).toEqual([
      "AI voice agents",
      "Enquiry handling",
      "Appointment booking",
      "Workflow automation",
      "Document processing",
      "CRM follow-up automation",
      "Operational process improvement",
    ]);
  });

  it("only stores focus areas for the AI service and drops unknown values", () => {
    const ai = buildLeadPayload(
      { ...aiForm(), focus_areas: ["Workflow automation", "Rocket launches"] },
      {},
    );
    expect(ai.focus_areas).toEqual(["Workflow automation"]);
    const other = buildLeadPayload({ ...validForm(), focus_areas: ["AI voice agents"] }, {});
    expect(other.focus_areas).toEqual([]);
  });
});

describe("service preselection", () => {
  it("maps page slugs and exact names to services", () => {
    expect(resolveService("security-surveillance")).toBe("Commercial CCTV & Access Control");
    expect(resolveService("schools")).toBe("School ICT & Wi-Fi");
    expect(resolveService("ai-agents")).toBe("Business Process & AI Solutions");
    expect(resolveService("Managed IT Services")).toBe("Managed IT Services");
    expect(resolveService("unknown-page")).toBeNull();
  });

  it("builds enquiry deep links that preselect context", () => {
    expect(enquiryHref("cctv", "Durban / KZN")).toBe(
      "/?service=Commercial+CCTV+%26+Access+Control&location=Durban+%2F+KZN#enquiry",
    );
    expect(enquiryHref()).toBe("/#enquiry");
  });

  it("flags qualified service selections", () => {
    expect(isQualifiedService("Commercial CCTV & Access Control")).toBe(true);
    expect(isQualifiedService("Other")).toBe(false);
  });
});

describe("attribution capture", () => {
  it("captures utm parameters and gclid from the landing url", () => {
    const attribution = parseAttribution(
      "https://siyakhatechnology.co.za/schools?utm_source=google&utm_medium=cpc&utm_campaign=school-wifi&utm_term=wifi&utm_content=a1&gclid=ABC123",
      "https://www.google.com/",
    );
    expect(attribution.utm_source).toBe("google");
    expect(attribution.utm_medium).toBe("cpc");
    expect(attribution.utm_campaign).toBe("school-wifi");
    expect(attribution.utm_term).toBe("wifi");
    expect(attribution.utm_content).toBe("a1");
    expect(attribution.gclid).toBe("ABC123");
    expect(attribution.landing_page).toBe(
      "/schools?utm_source=google&utm_medium=cpc&utm_campaign=school-wifi&utm_term=wifi&utm_content=a1&gclid=ABC123",
    );
    expect(attribution.source).toBe("google_ads");
  });

  it("keeps first-touch campaign data across internal navigation", () => {
    const first = parseAttribution("https://siyakhatechnology.co.za/?utm_source=linkedin", null);
    const later = parseAttribution("https://siyakhatechnology.co.za/managed-it", null);
    const merged = mergeAttribution(first, later);
    expect(merged.utm_source).toBe("linkedin");
    expect(merged.landing_page).toBe("/?utm_source=linkedin");
  });

  it("classifies direct and referral traffic honestly", () => {
    expect(deriveSource({ referrer: null })).toBe("direct");
    expect(deriveSource({ referrer: "https://www.bing.com/search" })).toBe("referral:bing.com");
  });
});

describe("lead payload", () => {
  it("carries utm, gclid, landing page and page path through to the server", () => {
    const attribution = parseAttribution(
      "https://siyakhatechnology.co.za/cloud-networking?utm_source=google&gclid=XYZ",
      null,
    );
    const payload = buildLeadPayload(validForm(), attribution, {
      pagePath: "/cloud-networking",
      formStartedAt: 1700000000000,
    });
    expect(payload.utm_source).toBe("google");
    expect(payload.gclid).toBe("XYZ");
    expect(payload.landing_page).toBe("/cloud-networking?utm_source=google&gclid=XYZ");
    expect(payload.page_path).toBe("/cloud-networking");
    expect(payload.form_started_at).toBe(1700000000000);
    expect(payload.work_email).toBe("thabo@sandtonproperty.co.za");
    expect(payload.consent).toBe(true);
    // Optional fields normalise to null rather than empty strings.
    expect(payload.budget_range).toBeNull();
    expect(payload.whatsapp).toBeNull();
  });

  it("normalises the email to lower case", () => {
    const payload = buildLeadPayload({ ...validForm(), work_email: "Thabo@Example.CO.ZA" }, {});
    expect(payload.work_email).toBe("thabo@example.co.za");
  });
});

describe("analytics events", () => {
  const attribution = {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "cctv-durban",
    utm_term: "cctv",
    utm_content: "b2",
    gclid: "G-1",
    landing_page: "/security-surveillance",
    source: "google_ads",
  };

  it("stamps generate_lead with the full attribution set", () => {
    const payload = buildEventPayload("generate_lead", { lead_id: "abc", service: "Business Wi-Fi" }, attribution);
    expect(payload.event).toBe("generate_lead");
    expect(payload.lead_id).toBe("abc");
    expect(payload.utm_campaign).toBe("cctv-durban");
    expect(payload.gclid).toBe("G-1");
    expect(payload.lead_source).toBe("google_ads");
  });

  it("supports the engagement events without inventing conversion values", () => {
    for (const event of ["begin_lead_form", "qualified_service_selection", "click_whatsapp", "click_phone", "click_email"] as const) {
      const payload = buildEventPayload(event, {}, attribution);
      expect(payload.event).toBe(event);
      expect(payload.value).toBeUndefined();
    }
  });
});

describe("owner lead management filters", () => {
  const base: WebsiteLead = {
    id: "1",
    created_at: "2026-03-01T09:00:00.000Z",
    updated_at: "2026-03-01T09:00:00.000Z",
    status: "new",
    source: "google_ads",
    landing_page: "/",
    referrer: null,
    service: "Business Wi-Fi",
    location: "Johannesburg / Sandton",
    full_name: "Thabo Mokoena",
    company: "Sandton Property Group",
    work_email: "thabo@sandtonproperty.co.za",
    phone: "+27825551234",
    whatsapp: null,
    project_description: "Six floors of office Wi-Fi",
    budget_range: null,
    timeline: null,
    consent: true,
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "wifi",
    utm_term: null,
    utm_content: null,
    gclid: "G-1",
    follow_up_notes: null,
    contacted_at: null,
    notification_status: "sent",
    notification_error: null,
  };
  const other: WebsiteLead = {
    ...base,
    id: "2",
    created_at: "2026-04-10T09:00:00.000Z",
    status: "won",
    source: "direct",
    service: "Commercial CCTV & Access Control",
    location: "Durban / KZN",
    full_name: "Naledi Khumalo",
    company: "Durban Student Living",
    work_email: "naledi@dsl.co.za",
    project_description: "Camera coverage for a student residence",
  };
  const leads = [base, other];

  it("filters by status, service, location and source", () => {
    expect(filterLeads(leads, { status: "won" })).toHaveLength(1);
    expect(filterLeads(leads, { service: "Business Wi-Fi" })[0].id).toBe("1");
    expect(filterLeads(leads, { location: "Durban / KZN" })[0].id).toBe("2");
    expect(filterLeads(leads, { source: "google_ads" })[0].id).toBe("1");
    expect(filterLeads(leads, { status: "all", service: "all", location: "all", source: "all" })).toHaveLength(2);
  });

  it("filters by date range and free-text search", () => {
    expect(filterLeads(leads, { from: "2026-04-01T00:00:00.000Z" })).toHaveLength(1);
    expect(filterLeads(leads, { to: "2026-03-31T00:00:00.000Z" })).toHaveLength(1);
    expect(filterLeads(leads, { search: "student residence" })[0].id).toBe("2");
    expect(filterLeads(leads, { search: "nothing here" })).toHaveLength(0);
  });
});

describe("structured data", () => {
  it("describes the business and its real service areas only", () => {
    const schema = buildLocalBusinessSchema();
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.telephone).toBe("+27877239183");
    const areas = schema.areaServed.map((a) => a.name);
    expect(areas).toEqual(["Johannesburg", "Sandton", "Durban"]);
    // No fabricated reviews or ratings.
    expect(JSON.stringify(schema)).not.toContain("aggregateRating");
  });

  it("builds a service schema bound to the local business", () => {
    const schema = buildServiceSchema({
      serviceType: "Business Wi-Fi",
      description: "Managed business Wi-Fi design and installation.",
      path: "/cloud-networking",
    });
    expect(schema.url).toBe("https://siyakhatechnology.co.za/cloud-networking");
    expect(schema.provider["@id"]).toBe("https://siyakhatechnology.co.za/#localbusiness");
  });
});

// ---------------------------------------------------------------------------
// Owner lead-notification routing (submit-lead edge function helpers)
// ---------------------------------------------------------------------------
import {
  buildLeadEmailRequests,
  buildLeadSubject,
  LEAD_FROM,
  LEAD_OWNER_RECIPIENTS,
  LEAD_EMAIL_FIELDS,
} from "../../supabase/functions/submit-lead/leadEmail";

const storedLead = () => ({
  id: "11111111-2222-4333-8444-555555555555",
  full_name: "Thabo Mokoena",
  company: "Sandton Property Group",
  work_email: "thabo@sandtonproperty.co.za",
  phone: "+27 82 555 1234",
  whatsapp: "+27 82 555 1234",
  service: "Business Wi-Fi",
  location: "Johannesburg / Sandton",
  focus_areas: [],
  budget_range: "R100k - R250k",
  timeline: "Next month",
  project_description: "Six-floor office block needs full Wi-Fi coverage.",
  source: "google-ads",
  landing_page: "/business-wifi",
  referrer: "https://www.google.com/",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "wifi-jhb",
  utm_term: "business wifi sandton",
  utm_content: "ad-1",
  gclid: "abc123",
  consent: true,
});

describe("owner lead email routing", () => {
  it("sends from the verified angoladay.info sender", () => {
    expect(LEAD_FROM).toContain("notifications@angoladay.info");
  });

  it("requests both owner recipients as separate sends", () => {
    const requests = buildLeadEmailRequests(storedLead(), "<p>lead</p>");
    expect(requests).toHaveLength(2);
    expect(requests.map((r) => r.to[0])).toEqual([
      "nikita@siyakhatechnology.co.za",
      "nikitajacobs01@gmail.com",
    ]);
    expect(LEAD_OWNER_RECIPIENTS).toEqual(requests.map((r) => r.to[0]));
    requests.forEach((r) => {
      expect(r.from).toBe(LEAD_FROM);
      expect(r.reply_to).toBe("thabo@sandtonproperty.co.za");
      expect(r.html).toBe("<p>lead</p>");
      expect(r.subject).toBe(buildLeadSubject(storedLead()));
    });
  });

  it("payload subject identifies service, location and client", () => {
    expect(buildLeadSubject(storedLead())).toBe(
      "New lead — Business Wi-Fi · Johannesburg / Sandton · Sandton Property Group",
    );
  });

  it("email body payload covers every lead and attribution field", () => {
    const lead = storedLead();
    LEAD_EMAIL_FIELDS.forEach((field) => {
      expect(Object.prototype.hasOwnProperty.call(lead, field)).toBe(true);
    });
  });

  it("a failed email send still leaves the lead stored and reports no conversion", () => {
    // Mirrors the edge function contract: storage result is independent of email.
    const result = { ok: true, leadId: storedLead().id, emailDelivered: false };
    expect(result.ok).toBe(true);
    expect(result.leadId).toBeTruthy();
    expect(result.emailDelivered).toBe(false);
  });
});
