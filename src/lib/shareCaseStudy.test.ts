import { describe, expect, it } from "vitest";
import { CASE_STUDIES } from "@/content/caseStudies";
import { caseStudyShareText, caseStudyShareUrl, caseStudyWhatsAppUrl } from "@/lib/shareCaseStudy";

const ORIGIN = "https://siyakhatechnology.co.za";

describe("case study sharing", () => {
  it("builds an absolute case study URL from the site origin", () => {
    expect(caseStudyShareUrl("capital-air-randburg", ORIGIN)).toBe(
      "https://siyakhatechnology.co.za/case-studies/capital-air-randburg",
    );
  });

  it("strips a trailing slash from the origin", () => {
    expect(caseStudyShareUrl("capital-air-randburg", `${ORIGIN}/`)).toBe(
      "https://siyakhatechnology.co.za/case-studies/capital-air-randburg",
    );
  });

  it("frames the share text as a factual project reference", () => {
    const study = CASE_STUDIES[0];
    const text = caseStudyShareText(study);
    expect(text).toBe(`Siyakha Technology project reference: ${study.client} — ${study.title}`);
  });

  it("builds a WhatsApp share link with the reference text and URL encoded", () => {
    const study = CASE_STUDIES[0];
    const url = caseStudyWhatsAppUrl(study, ORIGIN);
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    const message = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
    expect(message).toContain(caseStudyShareText(study));
    expect(message).toContain(caseStudyShareUrl(study.slug, ORIGIN));
  });

  it("produces a shareable URL for every published case study", () => {
    for (const study of CASE_STUDIES) {
      expect(caseStudyShareUrl(study.slug, ORIGIN)).toMatch(
        /^https:\/\/siyakhatechnology\.co\.za\/case-studies\/[a-z0-9-]+$/,
      );
    }
  });
});
