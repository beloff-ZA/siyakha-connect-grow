import { describe, expect, it } from "vitest";
import { emptySurvey, normaliseSurvey, surveyHasContent, surveyReadiness } from "@/lib/siteSurvey";
import { siteSurveySection } from "@/lib/jobCardSheet";

describe("site survey", () => {
  it("starts with the customer's cabinet and LAN lines", () => {
    const s = emptySurvey();
    expect(s.cabinet.map((r) => r.item)).toContain("UPS");
    expect(s.cabinet.map((r) => r.item)).toContain("Patch panel");
    expect(s.lan.map((r) => r.item)).toContain("Cabling");
  });

  it("treats a blank survey as having no content", () => {
    expect(surveyHasContent(emptySurvey())).toBe(false);
    const filled = emptySurvey();
    filled.cabinet[0].status = "Available";
    expect(surveyHasContent(filled)).toBe(true);
  });

  it("keeps stored answers and repairs missing rows", () => {
    const stored = { customer: "InteliGro", cabinet: [{ status: "Available" }] };
    const s = normaliseSurvey(stored);
    expect(s.customer).toBe("InteliGro");
    expect(s.cabinet[0].status).toBe("Available");
    expect(s.cabinet).toHaveLength(emptySurvey().cabinet.length);
    expect(s.cabinet[0].item).toBe("Power available in rack");
  });

  it("lists what is still outstanding", () => {
    const { ready, missing } = surveyReadiness(emptySurvey());
    expect(ready).toBe(false);
    expect(missing.join(" ")).toMatch(/Survey date/);
  });

  it("prints nothing when nothing was captured", () => {
    expect(siteSurveySection(null)).toBe("");
    expect(siteSurveySection(emptySurvey())).toBe("");
  });

  it("prints the captured survey with both sections", () => {
    const s = emptySurvey({ customer: "InteliGro", site_branch: "Viljoenskroon" });
    s.cabinet[0].status = "Available";
    s.lan[0].condition = "Good";
    const html = siteSurveySection(s);
    expect(html).toContain("Site survey");
    expect(html).toContain("Viljoenskroon");
    expect(html).toContain("Available");
    expect(html).toContain("Good");
  });

  it("escapes captured text", () => {
    const s = emptySurvey({ notes: "<script>bad</script>" });
    expect(siteSurveySection(s)).not.toContain("<script>");
  });
});
