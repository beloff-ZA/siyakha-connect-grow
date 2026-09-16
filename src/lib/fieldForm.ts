/**
 * Pure helpers for the simple phone site form.
 *
 * The engineer answers a few plain questions; these helpers translate those
 * answers into the same structured daily-report fields the office already uses,
 * so the simpler wording never weakens reporting.
 */

export type ProblemLevel = "none" | "small" | "stopped";

/** Cabling shortcuts. Tapping them never replaces the engineer's own words. */
export const WORK_CHIPS = [
  "Installed PVC pipe",
  "Pulled cable",
  "Installed data points",
  "Terminated cable",
  "Tested points",
  "Installed trunking",
  "Fixed routing",
  "Other",
] as const;

export const QUANTITY_UNITS = ["pipes", "cables", "points", "metres", "trunking lengths", "other"] as const;

export type FieldAnswers = {
  /** The day the work was done. */
  work_date: string;
  floor_id: string;
  /** Free text for "Other" floors / areas. */
  area_label: string;
  chips: string[];
  work_text: string;
  quantity: string;
  unit: string;
  problem: ProblemLevel;
  problem_text: string;
  needs_nothing: boolean;
  needs_text: string;
  next_text: string;
  /** Optional site note kept with the day's record in the project. */
  note_text: string;
  /** Engineer flags work that may be extra. The office decides, never the form. */
  extra_work: boolean;
  extra_work_text: string;
};

export const emptyAnswers = (workDate: string): FieldAnswers => ({
  work_date: workDate,
  floor_id: "",
  area_label: "",
  chips: [],
  work_text: "",
  quantity: "",
  unit: "pipes",
  problem: "none",
  problem_text: "",
  needs_nothing: false,
  needs_text: "",
  next_text: "",
  note_text: "",
  extra_work: false,
  extra_work_text: "",
});

/** Local calendar date (site time), not UTC, so "today" matches the engineer's day. */
export const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isFutureDate = (value: string) => value > localDate();

export const dateChoiceLabel = (value: string) => {
  if (value === localDate()) return "Today";
  if (value === localDate(-1)) return "Yesterday";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "short", day: "2-digit", month: "short" });
};

/** One short line describing quantity, only when the engineer gave one. */
export const quantityLine = (a: Pick<FieldAnswers, "quantity" | "unit">) => {
  const n = a.quantity.trim();
  if (!n) return "";
  return `${n} ${a.unit}`.trim();
};

/** The sentence stored as "work completed" — chips first, then his own words. */
export const workSummary = (a: FieldAnswers) => {
  const parts: string[] = [];
  const chips = a.chips.filter((c) => c !== "Other");
  if (chips.length) parts.push(chips.join(", "));
  const qty = quantityLine(a);
  if (qty) parts.push(qty);
  const head = parts.join(" — ");
  const own = a.work_text.trim();
  return [head, own].filter(Boolean).join(head && own ? ". " : "");
};

export const problemSeverity = (level: ProblemLevel) => (level === "stopped" ? "high" : "medium");

export const PROBLEM_LABELS: Record<ProblemLevel, string> = {
  none: "No problems",
  small: "Small problem",
  stopped: "Work stopped",
};

/** Everything the update needs, built from the simple answers. */
export function buildUpdatePayload(a: FieldAnswers, photoCount: number) {
  const problem = a.problem === "none" ? "" : `${PROBLEM_LABELS[a.problem]}: ${a.problem_text.trim()}`.trim();
  return {
    shift_date: a.work_date,
    category: a.problem === "none" ? "Cabling" : "Site Constraint",
    floor_id: a.floor_id || null,
    area_label: a.area_label.trim(),
    work_completed: workSummary(a),
    work_outstanding: "",
    blockers: problem,
    materials_required: a.needs_nothing ? "Nothing needed" : a.needs_text.trim(),
    team_onsite: "",
    progress_pct: 0,
    next_shift_plan: a.next_text.trim(),
    notes: [a.note_text.trim(), photoCount ? "" : "No photos attached with this update."].filter(Boolean).join(" "),
    /**
     * Operational flag only. It records that the engineer thinks the work may be
     * extra; it carries no pricing and makes no contractual decision.
     */
    extra_work: a.extra_work && !!a.extra_work_text.trim(),
    extra_work_text: a.extra_work ? a.extra_work_text.trim() : "",
  };
}

/** Blocks the send button with one plain sentence, or null when it is ready. */
export function readyToSend(a: FieldAnswers, readyPhotoCount: number, uploading: boolean): string | null {
  if (!workSummary(a)) return "Tell us what you did today.";
  if (isFutureDate(a.work_date)) return "Choose today or an earlier day.";
  if (a.problem !== "none" && !a.problem_text.trim()) return "Tell us what happened.";
  if (a.extra_work && !a.extra_work_text.trim()) return "Tell us what the extra work is.";
  if (uploading) return "Wait for your photos to finish loading.";
  if (readyPhotoCount === 0) return "Client needs photos. Add photos before sending.";
  return null;
}
