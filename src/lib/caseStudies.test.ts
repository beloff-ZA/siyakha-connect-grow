import { describe, expect, it } from "vitest";
import { getCaseStudy } from "@/content/caseStudies";

describe("confirmed project scope", () => {
  it("records Sun International's 980 network points as scope, not a performance result", () => {
    const study = getCaseStudy("sun-international-head-office");
    expect(study?.factual?.scopeMetric?.value).toBe(980);
    expect(study?.results).toEqual([]);
  });

  it("leaves Sun International's unknown project date unset", () => {
    expect(getCaseStudy("sun-international-head-office")?.year).toBeUndefined();
  });
});