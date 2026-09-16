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

describe("one working record per technician and work date", () => {
  const row = (p: Partial<StoredUpdate> = {}): StoredUpdate => ({
    id: "u1",
    shift_date: "2026-09-16",
    field_access_id: "acc1",
    approval_status: "draft",
    ...p,
  });

  it("finds the technician's own record for that date", () => {
    const rows = [row({ id: "other", field_access_id: "acc2" }), row(), row({ id: "old", shift_date: "2026-09-15" })];
    expect(dayRecord(rows, "acc1", "2026-09-16")?.id).toBe("u1");
  });

  it("does not reuse another day's record", () => {
    expect(dayRecord([row()], "acc1", "2026-09-15")).toBeNull();
  });

  it("treats approved or locked days as closed", () => {
    expect(isLockedUpdate(row())).toBe(false);
    expect(isLockedUpdate(row({ approval_status: "submitted" }))).toBe(false);
    expect(isLockedUpdate(row({ approval_status: "approved" }))).toBe(true);
    expect(isLockedUpdate(row({ locked_at: "2026-09-16T10:00:00Z" }))).toBe(true);
  });

  it("loads saved values back into the simple form", () => {
    const a = answersFromUpdate(
      row({
        work_completed: "Pulled cable on fifth floor",
        blockers: "Work stopped: No ceiling access",
        materials_required: "Nothing needed",
        next_shift_plan: "Terminate points",
        notes: "Gate closed at 17:00 No photos attached with this update.",
        area_label: "Lift lobby",
      }),
    );
    expect(a.work_date).toBe("2026-09-16");
    expect(a.work_text).toBe("Pulled cable on fifth floor");
    expect(a.problem).toBe("stopped");
    expect(a.problem_text).toBe("No ceiling access");
    expect(a.needs_nothing).toBe(true);
    expect(a.next_text).toBe("Terminate points");
    expect(a.note_text).toBe("Gate closed at 17:00");
    expect(a.area_label).toBe("Lift lobby");
  });

  it("only saves once there is something to keep, and never a future day", () => {
    expect(readyToSave(emptyAnswers(localDate()))).toBe("Write something before saving.");
    expect(readyToSave({ ...emptyAnswers(localDate()), work_text: "Pulled cable" })).toBeNull();
    expect(readyToSave({ ...emptyAnswers(localDate(2)), work_text: "Pulled cable" })).toBe(
      "Choose today or an earlier day.",
    );
  });
});
