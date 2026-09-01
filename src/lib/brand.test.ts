import { describe, it, expect } from "vitest";
import { BRAND, TRUST_POINTS } from "./brand";
import { DIVISIONS, getDivision } from "@/content/divisions";
import { INDUSTRIES, getIndustry } from "@/content/industries";
import { HOME_HOME_FAQS } from "@/content/faqs";
import { enquiryHref, LEAD_SERVICES } from "./leadForm";

describe("master brand", () => {
  it("uses Siyakha Technology Solutions as the public master brand", () => {
    expect(BRAND.name).toBe("Siyakha Technology Solutions");
    expect(BRAND.legalName).toBe("Siyakha Technology Solutions (Pty) Ltd");
    expect(BRAND.capabilityBrand).toBe("Siyakha Interlink");
  });

  it("keeps the canonical origin unchanged", () => {
    expect(BRAND.origin).toBe("https://siyakhatechnology.co.za");
  });

  it("uses the approved homepage title and a substantive description", () => {
    expect(BRAND.homeTitle).toBe(
      "Siyakha Technology Solutions | Managed IT, Networking, CCTV & AI — Johannesburg & Durban",
    );
    expect(BRAND.homeDescription.length).toBeGreaterThan(80);
  });

  it("exposes only owner-confirmed trust points", () => {
    expect(TRUST_POINTS).toContain("Level 1 B-BBEE SMME");
    expect(TRUST_POINTS.join(" ")).not.toMatch(/\d+\s*(clients|years|sites)/i);
  });
});

describe("five revenue divisions", () => {
  it("defines exactly the five approved divisions", () => {
    expect(DIVISIONS.map((d) => d.slug)).toEqual([
      "managed-it",
      "projects",
      "security",
      "digital",
      "ai-solutions",
    ]);
  });

  it("resolves each division by slug with lead-ready content", () => {
    for (const d of DIVISIONS) {
      expect(getDivision(d.slug)).toBeDefined();
      expect(d.offers.length).toBeGreaterThan(2);
      expect(d.leadService.length).toBeGreaterThan(0);
    }
  });

  it("presents Interlink as the security capability, not the company name", () => {
    const security = getDivision("security")!;
    expect(security.capabilityNote).toMatch(/Interlink/);
    const others = DIVISIONS.filter((d) => d.slug !== "security");
    expect(others.some((d) => (d.capabilityNote ?? "").includes("Interlink"))).toBe(false);
  });
});

describe("industries", () => {
  it("covers the six requested buyer groups", () => {
    expect(INDUSTRIES.map((i) => i.slug)).toEqual([
      "medical-practices",
      "professional-firms",
      "schools",
      "student-accommodation",
      "restaurants",
      "offices",
    ]);
  });

  it("describes concrete problems and links into the enquiry flow", () => {
    for (const i of INDUSTRIES) {
      expect(getIndustry(i.slug)).toBeDefined();
      expect(i.problems.length).toBeGreaterThan(2);
      const href = enquiryHref(i.leadService, i.leadLocation ?? null);
      expect(href.startsWith("/contact")).toBe(true);
      expect(href).toContain("service=");
    }
  });
});

describe("lead flow is preserved", () => {
  it("maps every division lead service to a real enquiry service option", () => {
    const values: readonly string[] = LEAD_SERVICES;
    for (const d of DIVISIONS) {
      expect(values).toContain(d.leadService);
    }
    for (const i of INDUSTRIES) {
      expect(values).toContain(i.leadService);
    }
  });
});

describe("faqs", () => {
  it("provides genuine FAQs without invented guarantees", () => {
    expect(HOME_FAQS.length).toBeGreaterThanOrEqual(5);
    const text = HOME_FAQS.map((f) => `${f.q} ${f.a}`).join(" ");
    expect(text).not.toMatch(/guarantee/i);
    expect(text).toMatch(/Johannesburg/);
    expect(text).toMatch(/Durban/);
  });
});
