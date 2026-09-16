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

/* ------------------------------------------------------------------------- */
/* One working record per technician + work date                              */
/* ------------------------------------------------------------------------- */

/** The fields of a saved daily record the phone form needs back. */
export type StoredUpdate = {
  id: string;
  shift_date: string;
  field_access_id?: string | null;
  approval_status?: string | null;
  approved_at?: string | null;
  locked_at?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
  floor_id?: string | null;
  area_label?: string | null;
  work_completed?: string | null;
  blockers?: string | null;
  materials_required?: string | null;
  next_shift_plan?: string | null;
  notes?: string | null;
};

/** Once the office approves or locks a day, nobody on site may change it. */
export const isLockedUpdate = (u: StoredUpdate) =>
  !!u.locked_at || !!u.approved_at || u.approval_status === "approved" || u.approval_status === "locked";

/**
 * This technician's own record for that work date — draft or already submitted.
 * Used so the form reopens the same day instead of starting a new report.
 */
export function dayRecord(
  updates: StoredUpdate[] | undefined,
  accessId: string | undefined,
  workDate: string,
): StoredUpdate | null {
  if (!updates?.length || !accessId) return null;
  return (
    updates.find((u) => u.shift_date === workDate && u.field_access_id === accessId) ?? null
  );
}

const NO_PHOTO_NOTE = "No photos attached with this update.";

/** Rebuilds the simple answers from a saved record, inventing nothing. */
export function answersFromUpdate(u: StoredUpdate): FieldAnswers {
  const a = emptyAnswers(u.shift_date);
  a.floor_id = u.floor_id ?? "";
  a.area_label = u.area_label ?? "";
  a.work_text = u.work_completed ?? "";
  const blockers = (u.blockers ?? "").trim();
  if (blockers) {
    const stopped = blockers.startsWith(PROBLEM_LABELS.stopped);
    a.problem = stopped ? "stopped" : "small";
    a.problem_text = blockers.replace(/^[^:]*:\s*/, "");
  }
  const needs = (u.materials_required ?? "").trim();
  if (needs === "Nothing needed") a.needs_nothing = true;
  else a.needs_text = needs;
  a.next_text = u.next_shift_plan ?? "";
  a.note_text = (u.notes ?? "").replace(NO_PHOTO_NOTE, "").trim();
  return a;
}

/** Blocks a quiet or deliberate save until there is something worth keeping. */
export const readyToSave = (a: FieldAnswers): string | null => {
  if (isFutureDate(a.work_date)) return "Choose today or an earlier day.";
  if (!workSummary(a) && !a.note_text.trim() && !a.problem_text.trim() && !a.needs_text.trim()) {
    return "Write something before saving.";
  }
  return null;
};

/** Short local time for the "Last saved" line. */
export const savedTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

