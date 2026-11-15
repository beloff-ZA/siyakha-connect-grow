import { describe, expect, it } from "vitest";
import { CASE_STUDIES, getCaseStudy, LATEST_PROJECT_SLUGS } from "@/content/caseStudies";

describe("confirmed project scope", () => {
  it("limits the forum to formulation without implying a deployed platform, venue or event delivery services", () => {
    const study = getCaseStudy("angolan-mining-business-forum");
    expect(study?.location).toBe("");
    expect(study?.industry).toBe("Events & Conferences");
    expect(study?.services).toEqual(["Digital systems formulation", "Event-management software tools"]);
    expect(study?.factual?.scope).toEqual(study?.services);
    expect(study?.year).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.results).toEqual([]);
    expect(study?.process).toEqual([]);
    expect(JSON.stringify(study)).not.toMatch(/launched|deployed|ticketing|payment|dashboard|registration|QR|CRM|staging|screenshots|South Africa/i);
    expect(CASE_STUDIES.filter((s) => s.slug === "angolan-mining-business-forum")).toHaveLength(1);
  });
  it("records Impala's wider rollout scale without claiming Siyakha completed or allocated every machine", () => {
    const study = getCaseStudy("impala-platinum-laptop-rollout");
    expect(study?.factual?.scopeMetric).toEqual({ value: "1,000+", label: "Machines in the wider rollout project" });
    expect(study?.services).toEqual(["On-site rollout resources", "Laptop allocation assistance"]);
    expect(study?.factual?.scope).toEqual(study?.services);
    expect(study?.location).toBe("North West, South Africa");
    expect(study?.industry).toBe("Mining");
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.gallery).toBeUndefined();
    expect(study?.hero).toMatch(/\/impala-rollout-privacy\.webp$/);
    expect(study?.typeCover).toBeUndefined();
    expect(study?.results).toEqual([]);
    expect(JSON.stringify(study)).not.toMatch(/completed|configuration|imaging|enrollment|testing|setup|allocated all/i);
    expect(CASE_STUDIES.filter((s) => s.slug === "impala-platinum-laptop-rollout")).toHaveLength(1);
  });

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

  it("retains all ten recent projects with one St Joseph's entry", () => {
    expect(CASE_STUDIES.filter((study) => study.slug === "st-josephs-marist-cape-town")).toHaveLength(1);
    expect(LATEST_PROJECT_SLUGS).toEqual([
      "angolan-mining-business-forum",
      "impala-platinum-laptop-rollout",
      "campuskey-port-elizabeth",
      "sapath-network-infrastructure",
      "catch-22-connectivity",
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

  it("limits Catch 22 to assistance and guest Wi-Fi testing, without asserting installed equipment or results", () => {
    const study = getCaseStudy("catch-22-connectivity");
    expect(study?.factual?.scope).toEqual(["Connectivity solution assistance", "Guest Wi-Fi solution testing"]);
    expect(study?.services).toEqual(study?.factual?.scope);
    expect(study?.industry).toBe("Hospitality");
    expect(study?.location).toBe("Corner Beach Boulevard and Porterfield Road, Table View, Cape Town");
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.process).toEqual([]);
    expect(study?.results).toEqual([]);
    expect(study?.gallery).toBeUndefined();
    expect(study?.hero).toMatch(/\/catch-22-exterior\.webp$/);
    expect(CASE_STUDIES.filter((s) => s.slug === "catch-22-connectivity")).toHaveLength(1);
  });

  it("keeps Design Code Interior Designers as Tiger Brands' appointing party only", () => {
    const tiger = getCaseStudy("tiger-brands-boardroom-technology");
    expect(tiger?.summary.startsWith("Appointed by Design Code Interior Designers,")).toBe(true);
    expect(tiger?.factual?.overview.startsWith("Appointed by Design Code Interior Designers,")).toBe(true);
    for (const slug of LATEST_PROJECT_SLUGS.filter((s) => s !== "tiger-brands-boardroom-technology")) {
      expect(JSON.stringify(getCaseStudy(slug))).not.toContain("Design Code Interior Designers");
    }
  });

  it("limits CampusKey to the specific confirmed work, separate from the generic Exmile overview", () => {
    const study = getCaseStudy("campuskey-port-elizabeth");
    expect(study?.client).toBe("CampusKey");
    expect(study?.location).toBe("Port Elizabeth");
    expect(study?.industry).toBe("Student Accommodation");
    expect(study?.factual?.scope).toEqual(["Data environment recabling", "Major data-point cleanup", "CAT6 cabling"]);
    expect(study?.services).toEqual(study?.factual?.scope);
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.clientIdentity).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.process).toEqual([]);
    expect(study?.results).toEqual([]);
    expect(JSON.stringify(study)).not.toMatch(/Fluke|certif|speed|performance|Radisson|CAT6A|CAT6 \/ CAT6A|interior.design|Wi-Fi installation/i);
    expect(getCaseStudy("exmile-student-accommodation")?.factual).toBeUndefined();
    expect(CASE_STUDIES.filter((s) => s.slug === "campuskey-port-elizabeth")).toHaveLength(1);
  });

  it("attributes CampusKey work to Exmile as connectivity partner rather than direct appointment", () => {
    const study = getCaseStudy("campuskey-port-elizabeth");
    expect(study?.summary.startsWith("Working on behalf of Exmile, CampusKey’s connectivity partner,")).toBe(true);
    expect(study?.factual?.overview.startsWith("Working on behalf of Exmile, CampusKey’s connectivity partner,")).toBe(true);
  });

  it("limits SAPath to the four confirmed services and Cape Town without hospital, equipment or results claims", () => {
    const study = getCaseStudy("sapath-network-infrastructure");
    expect(study?.client).toBe("SAPath");
    expect(study?.location).toBe("Cape Town");
    expect(study?.industry).toBe("Healthcare");
    expect(study?.factual?.scope).toEqual(["Network infrastructure upgrade", "Recabling", "Data points", "Onsite field support"]);
    expect(study?.services).toEqual(study?.factual?.scope);
    expect(study?.year).toBeUndefined();
    expect(study?.equipment).toBeUndefined();
    expect(study?.clientIdentity).toBeUndefined();
    expect(study?.quote).toBeUndefined();
    expect(study?.factual?.scopeMetric).toBeUndefined();
    expect(study?.process).toEqual([]);
    expect(study?.results).toEqual([]);
    expect(study?.gallery).toBeUndefined();
    expect(study?.hero).toMatch(/\/sapath-site-interior\.webp$/);
    expect(JSON.stringify(study)).not.toMatch(/Vincent|Pallotti|hospital|Wi-Fi|speedtest|certification/i);
    expect(CASE_STUDIES.filter((s) => s.slug === "sapath-network-infrastructure")).toHaveLength(1);
  });
});