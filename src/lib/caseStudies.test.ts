import { describe, expect, it } from "vitest";
import { CASE_STUDIES, getCaseStudy, LATEST_PROJECT_SLUGS } from "@/content/caseStudies";

describe("confirmed project scope", () => {
  it("records Sun International's 980 network points as scope, not a performance result", () => {
    const study = getCaseStudy("sun-international-head-office");
    expect(study?.factual?.scopeMetric?.value).toBe(980);
    expect(study?.results).toEqual([]);
  });

  it("leaves Sun International's unknown project date unset", () => {
    expect(getCaseStudy("sun-international-head-office")?.year).toBeUndefined();
  });

  it("records St Joseph's confirmed location and scope without installation specifications", () => {
    const study = getCaseStudy("st-josephs-marist-cape-town");
    expect(study?.location).toBe("Cape Town");
    expect(study?.services).toEqual(["CCTV rollout", "Fibre integration", "Turnkey delivery"]);
    expect(study?.factual?.scope).toEqual(study?.services);
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.results).toEqual([]);
  });

  it("keeps St Joseph's public imagery limited to the actual outdoor photo, without diagrams or maps", () => {
    const study = getCaseStudy("st-josephs-marist-cape-town");
    expect(study?.hero).toMatch(/\/st-joseph-outdoor-installation\.webp$/);
    expect(study?.gallery).toBeUndefined();
    expect(study?.sequence).toBeUndefined();
    expect(study?.beforeAfter).toBeUndefined();
  });

  it("adds one St Joseph's entry while retaining the other three latest projects", () => {
    expect(CASE_STUDIES.filter((study) => study.slug === "st-josephs-marist-cape-town")).toHaveLength(1);
    expect(LATEST_PROJECT_SLUGS).toEqual([
      "nomination-italy-waterfront",
      "st-josephs-marist-cape-town", "tiger-brands-boardroom-technology",
      "sun-international-head-office", "capital-air-randburg",
    ]);
    expect(LATEST_PROJECT_SLUGS.every((slug) => getCaseStudy(slug) !== undefined)).toBe(true);
  });

  it("records Nomination Italy's confirmed appointment scope without inferring the appointing party or equipment", () => {
    const study = getCaseStudy("nomination-italy-waterfront");
    expect(study?.location).toBe("V&A Waterfront, Cape Town");
    expect(study?.industry).toBe("Retail & Franchise");
    expect(study?.factual?.scope).toEqual(["On-ground field support", "Connectivity setup", "VoIP setup"]);
    expect(study?.services).toEqual(study?.factual?.scope);
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.process).toEqual([]);
    expect(study?.results).toEqual([]);
    expect(study?.gallery).toBeUndefined();
    expect(study?.hero).toMatch(/\/nomination-italy-waterfront-storefront\.webp$/);
    expect(CASE_STUDIES.filter((s) => s.slug === "nomination-italy-waterfront")).toHaveLength(1);
  });

  it("scopes the official Nomination logo to project identity, not equipment or unrelated projects", () => {
    expect(getCaseStudy("nomination-italy-waterfront")?.clientIdentity?.source).toBe("https://www.nomination.com/static/version1794394945/frontend/Nomination/default/it_IT/images/logo.svg");
    for (const slug of LATEST_PROJECT_SLUGS.filter((s) => s !== "nomination-italy-waterfront")) {
      expect(getCaseStudy(slug)?.clientIdentity).toBeUndefined();
    }
  });

  it("preserves Capital Air and Tiger Brands confirmed installation scopes", () => {
    expect(getCaseStudy("capital-air-randburg")?.factual?.scope).toEqual(["32 Hikvision PT CCTV cameras", "Paradox alarm system"]);
    expect(getCaseStudy("tiger-brands-boardroom-technology")?.factual?.scope).toEqual(["Smart board installation", "TVs", "Paradox system"]);
  });
});