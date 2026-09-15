import { describe, expect, it } from "vitest";
import { SOLUTION_TEMPLATES, polishWorkDone } from "@/lib/writingPolish";

describe("polishWorkDone", () => {
  it("capitalises sentences and closes with a full stop", () => {
    const { text } = polishWorkDone("replaced the faulty router");
    expect(text).toBe("Replaced the faulty router.");
  });

  it("fixes technical casing and abbreviations", () => {
    const { text } = polishWorkDone("configured the vlan and wifi on the rtr, poe tested");
    expect(text).toContain("VLAN");
    expect(text).toContain("Wi-Fi");
    expect(text).toContain("router");
    expect(text).toContain("PoE");
  });

  it("replaces informal wording", () => {
    const { text } = polishWorkDone("swapped the switch and sorted the fault");
    expect(text.toLowerCase()).toContain("replaced");
    expect(text.toLowerCase()).toContain("resolved");
    expect(text.toLowerCase()).not.toContain("sorted");
  });

  it("corrects common typos and collapses spacing", () => {
    const { text } = polishWorkDone("the   link  was  seperate  and  didnt  work");
    expect(text).toContain("separate");
    expect(text).toContain("did not");
    expect(text).not.toMatch(/ {2}/);
  });

  it("suggests testing detail when it is missing", () => {
    const { suggestions } = polishWorkDone("Router installed.");
    expect(suggestions.join(" ")).toMatch(/tested/i);
  });

  it("reports what it changed", () => {
    const { changes } = polishWorkDone("sorted the wifi");
    expect(changes.length).toBeGreaterThan(0);
  });

  it("leaves already-clean text unchanged", () => {
    const clean =
      "The faulty router was replaced with a tested spare, the configuration was restored and full service was verified with the site contact before departure.";
    expect(polishWorkDone(clean).text).toBe(clean);
  });

  it("ships ready-made professional templates", () => {
    expect(SOLUTION_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    SOLUTION_TEMPLATES.forEach((t) => expect(t.text.length).toBeGreaterThan(60));
  });
});
