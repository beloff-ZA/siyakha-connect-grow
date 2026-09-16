import { describe, expect, it } from "vitest";
import {
  answersFromUpdate,
  buildUpdatePayload,
  dateChoiceLabel,
  dayRecord,
  emptyAnswers,
  isFutureDate,
  isLockedUpdate,
  localDate,
  problemSeverity,
  quantityLine,
  readyToSave,
  readyToSend,
  workSummary,
  type StoredUpdate,
} from "@/lib/fieldForm";


const base = () => ({ ...emptyAnswers(localDate()), work_text: "Pulled cables on fifth floor" });

describe("simple field answers", () => {
  it("builds a work sentence from shortcuts, quantity and own words", () => {
    const a = { ...base(), chips: ["Pulled cable", "Other"], quantity: "9", unit: "pipes" };
    expect(workSummary(a)).toBe("Pulled cable — 9 pipes. Pulled cables on fifth floor");
  });

  it("keeps his own words when no shortcut is chosen", () => {
    expect(workSummary(base())).toBe("Pulled cables on fifth floor");
  });

  it("never invents a quantity", () => {
    expect(quantityLine({ quantity: "", unit: "pipes" })).toBe("");
  });

  it("maps a problem into the blocker field and a site-constraint category", () => {
    const p = buildUpdatePayload({ ...base(), problem: "stopped", problem_text: "No ceiling access" }, 2);
    expect(p.category).toBe("Site Constraint");
    expect(p.blockers).toBe("Work stopped: No ceiling access");
    expect(problemSeverity("stopped")).toBe("high");
    expect(problemSeverity("small")).toBe("medium");
  });

  it("records nothing needed explicitly", () => {
    expect(buildUpdatePayload({ ...base(), needs_nothing: true }, 1).materials_required).toBe("Nothing needed");
  });

  it("notes when an update carried no photos", () => {
    expect(buildUpdatePayload(base(), 0).notes).toContain("No photos");
    expect(buildUpdatePayload(base(), 1).notes).toBe("");
  });
});

describe("work date choices", () => {
  it("labels today and yesterday plainly", () => {
    expect(dateChoiceLabel(localDate())).toBe("Today");
    expect(dateChoiceLabel(localDate(-1))).toBe("Yesterday");
  });

  it("refuses a future work date", () => {
    expect(isFutureDate(localDate(1))).toBe(true);
    expect(isFutureDate(localDate(-3))).toBe(false);
  });
});

describe("ready to send", () => {
  it("asks for the work first", () => {
    expect(readyToSend(emptyAnswers(localDate()), 1, false)).toBe("Tell us what you did today.");
  });

  it("asks for photos", () => {
    expect(readyToSend(base(), 0, false)).toBe("Client needs photos. Add photos before sending.");
  });

  it("waits for uploads", () => {
    expect(readyToSend(base(), 1, true)).toBe("Wait for your photos to finish loading.");
  });

  it("asks what happened when there is a problem", () => {
    expect(readyToSend({ ...base(), problem: "small" }, 1, false)).toBe("Tell us what happened.");
  });

  it("blocks a future work date", () => {
    expect(readyToSend({ ...base(), work_date: localDate(2) }, 1, false)).toBe("Choose today or an earlier day.");
  });

  it("allows a complete update", () => {
    expect(readyToSend(base(), 2, false)).toBeNull();
  });
});

describe("possible additional work flag", () => {
  const base = () => ({ ...emptyAnswers(localDate()), chips: ["Pulled cable"] });

  it("stays off by default and sends nothing", () => {
    const p = buildUpdatePayload(base(), 1);
    expect(p.extra_work).toBe(false);
    expect(p.extra_work_text).toBe("");
  });

  it("asks for a description before sending", () => {
    expect(readyToSend({ ...base(), extra_work: true }, 1, false)).toBe("Tell us what the extra work is.");
  });

  it("passes the engineer's own words through, with no pricing fields", () => {
    const p = buildUpdatePayload({ ...base(), extra_work: true, extra_work_text: " Extra trunking needed " }, 1);
    expect(p.extra_work).toBe(true);
    expect(p.extra_work_text).toBe("Extra trunking needed");
    expect(Object.keys(p).join(" ")).not.toMatch(/price|cost|rate|margin/i);
  });
});
