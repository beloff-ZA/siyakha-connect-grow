/**
 * Digital version of the customer site survey sheet (Saicom / InteliGro layout):
 * a cabinet section and a LAN section, both completed on site by the engineer.
 * Stored as JSON on logged_calls.site_survey.
 *
 * Keep in sync with supabase/functions/_shared/siteSurvey.ts.
 */

/** A photo captured on site for a single survey line. */
export type SurveyPhoto = {
  /** Storage path in the private job-card-files bucket. */
  photo_path: string;
  photo_name: string;
};

export type SurveyCabinetRow = SurveyPhoto & {
  item: string;
  description: string;
  qty: string;
  status: string;
  comment: string;
};

export type SurveyLanRow = SurveyPhoto & {
  item: string;
  description: string;
  location: string;
  condition: string;
  comment: string;
};

export type SiteSurvey = {
  /** Survey heading fields. */
  survey_date: string;
  customer: string;
  site_branch: string;
  site_contact: string;
  engineer: string;
  cabinet: SurveyCabinetRow[];
  lan: SurveyLanRow[];
  photos_taken: boolean;
  notes: string;
};

export const SURVEY_STATUSES = ["", "Available", "Not available", "Adequate", "Insufficient", "Faulty", "Replaced"];
export const SURVEY_CONDITIONS = ["", "Good", "Fair", "Poor", "Needs attention", "Not applicable"];

/** Cabinet lines exactly as they appear on the customer's sheet. */
export const CABINET_ITEMS = [
  "Power available in rack",
  "Rack space",
  "Patch panel",
  "Switch (e.g. Aruba 48-port PoE)",
  "Router (e.g. Cisco 1941)",
  "Firewall (e.g. Fortigate 60E)",
  "Wi-Fi controller (e.g. Ruckus)",
  "UPS",
];

export const LAN_ITEMS = ["Cabling", "Data points / outlets", "Labelling", "Containment / trunking", "Other"];

export function emptySurvey(seed: Partial<SiteSurvey> = {}): SiteSurvey {
  return {
    survey_date: "",
    customer: "",
    site_branch: "",
    site_contact: "",
    engineer: "",
    photos_taken: false,
    notes: "",
    cabinet: CABINET_ITEMS.map((item) => ({ item, description: "", qty: "", status: "", comment: "", photo_path: "", photo_name: "" })),
    lan: LAN_ITEMS.map((item) => ({ item, description: "", location: "", condition: "", comment: "", photo_path: "", photo_name: "" })),
    ...seed,
  };
}

/** Accepts whatever is stored (or nothing) and returns a complete survey shape. */
export function normaliseSurvey(raw: unknown, seed: Partial<SiteSurvey> = {}): SiteSurvey {
  const base = emptySurvey(seed);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<SiteSurvey>;
  return {
    ...base,
    ...r,
    cabinet: base.cabinet.map((row, i) => ({ ...row, ...(r.cabinet?.[i] || {}), item: row.item })),
    lan: base.lan.map((row, i) => ({ ...row, ...(r.lan?.[i] || {}), item: row.item })),
  };
}

const rowFilled = (row: Record<string, unknown>) =>
  ["description", "qty", "status", "condition", "location", "comment", "photo_path"].some((k) =>
    String((row as Record<string, unknown>)[k] ?? "").trim(),
  );

/** Has anything at all been captured? Used to decide whether to print/attach it. */
export function surveyHasContent(survey?: SiteSurvey | null) {
  if (!survey) return false;
  if ([survey.survey_date, survey.customer, survey.site_branch, survey.site_contact, survey.engineer, survey.notes].some((v) => String(v ?? "").trim()))
    return true;
  return survey.cabinet.some(rowFilled) || survey.lan.some(rowFilled);
}

/** What still needs completing before the survey goes with the job card. */
export function surveyReadiness(survey: SiteSurvey) {
  const missing: string[] = [];
  if (!survey.survey_date.trim()) missing.push("Survey date");
  if (!survey.customer.trim()) missing.push("Customer");
  if (!survey.site_branch.trim()) missing.push("Site / branch");
  if (!survey.site_contact.trim()) missing.push("Site contact");
  if (!survey.engineer.trim()) missing.push("Engineer");
  const cab = survey.cabinet.filter((r) => !String(r.status ?? "").trim()).map((r) => r.item);
  if (cab.length) missing.push(`Cabinet status: ${cab.join(", ")}`);
  if (!survey.lan.some(rowFilled)) missing.push("At least one LAN line");
  const anyPhoto = [...survey.cabinet, ...survey.lan].some((r) => String(r.photo_path ?? "").trim());
  if (!survey.photos_taken && !anyPhoto) missing.push("Add site photos, or confirm they were taken");
  return { ready: missing.length === 0, missing };
}
