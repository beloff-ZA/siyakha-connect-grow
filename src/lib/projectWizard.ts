/**
 * Pure helpers for the project register route, the QS building schedule and the
 * new-project wizard. No database access lives here so the rules can be tested
 * directly.
 */

export const WORKSPACE_SECTIONS = [
  { value: "overview", label: "Overview" },
  { value: "building", label: "Building & site" },
  { value: "plans", label: "Plans & mapping" },
  { value: "boq", label: "BOQ & costing" },
  { value: "files", label: "Documents & site images" },
  { value: "share", label: "Reports & share" },
] as const;

export type WorkspaceSection = (typeof WORKSPACE_SECTIONS)[number]["value"];

export const DEFAULT_SECTION: WorkspaceSection = "overview";

/** Register → workspace route. Keeps the project id in the URL so refresh works. */
export const projectWorkspacePath = (projectId: string, section?: WorkspaceSection) =>
  `/helpdesk/project-management/${projectId}${section && section !== DEFAULT_SECTION ? `?section=${section}` : ""}`;

/** Falls back to Overview for unknown or missing sections instead of blanking. */
export function parseSection(value: string | null | undefined): WorkspaceSection {
  const match = WORKSPACE_SECTIONS.find((s) => s.value === value);
  return match ? match.value : DEFAULT_SECTION;
}

/* ---------------- QS building schedule ---------------- */

export type BuildingDetails = {
  building_type?: string;
  levels_note?: string;
  gfa_sqm?: number | null;
  length_m?: number | null;
  width_m?: number | null;
  rooms_units?: number | null;
  occupancy?: number | null;
  notes?: string;
};

const num = (v: string | number | null | undefined) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Builds the stored JSON, dropping empty values so nothing is invented. */
export function normalizeBuildingDetails(input: Record<string, string | number | null | undefined>) {
  const out: BuildingDetails = {};
  const text = (k: "building_type" | "levels_note" | "notes") => {
    const v = String(input[k] ?? "").trim();
    if (v) out[k] = v;
  };
  text("building_type");
  text("levels_note");
  text("notes");
  (["gfa_sqm", "length_m", "width_m", "rooms_units", "occupancy"] as const).forEach((k) => {
    const v = num(input[k] as string | number | null | undefined);
    if (v != null) out[k] = v;
  });
  return Object.keys(out).length > 0 ? out : null;
}

/* ---------------- Filename → floor suggestions ---------------- */

export type FloorSuggestion = { level_number: number; display_name: string; floor_use: string };

const RULES: { test: RegExp; level: number; name: string; use: string }[] = [
  { test: /\b(basement|bsmt|parking|park)\b/, level: -1, name: "Basement", use: "other" },
  { test: /\b(ground|grd|gf|g[-_ ]?floor)\b/, level: 0, name: "Ground floor", use: "entry_ground" },
  { test: /\b(mezzanine|mezz)\b/, level: 1, name: "Mezzanine", use: "other" },
  { test: /\b(roof|rooftop|plant)\b/, level: 99, name: "Roof", use: "rooftop_service" },
];

/**
 * Suggests a floor row from an uploaded plan filename. Purely lexical — no OCR
 * or inference of dimensions — and every value stays editable in the wizard.
 */
export function suggestFloorFromFilename(filename: string, index = 0): FloorSuggestion {
  const base = filename.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[-_.]+/g, " ");
  for (const r of RULES) if (r.test.test(base)) return { level_number: r.level, display_name: r.name, floor_use: r.use };

  const m =
    base.match(/\b(?:level|lvl|floor|fl|l)\s*0*(\d{1,2})\b/) ?? base.match(/\b0*(\d{1,2})\s*(?:st|nd|rd|th)\s*floor\b/);
  if (m) {
    const level = Number(m[1]);
    return { level_number: level, display_name: level === 0 ? "Ground floor" : `Level ${level}`, floor_use: level === 0 ? "entry_ground" : "accommodation" };
  }

  return { level_number: index, display_name: index === 0 ? "Ground floor" : `Level ${index}`, floor_use: index === 0 ? "entry_ground" : "accommodation" };
}

/** Baseline label for the first confirmed revision of a floor. */
export const suggestRevisionLabel = (existingRevisions: number) =>
  existingRevisions <= 0 ? "Rev 0 — Baseline site plan" : `Rev ${existingRevisions}`;

/** True when the baseline revision must be preserved rather than replaced. */
export const preservesBaseline = (existingRevisions: number) => existingRevisions > 0;

/* ---------------- Wizard validation ---------------- */

export type WizardDraft = {
  client_id: string;
  site_id: string;
  title: string;
  reference?: string;
  status?: string;
  files: { name: string; floorKey: string | null }[];
  floors: { key: string; level_number: number | string; display_name: string }[];
};

/** Returns a list of blocking problems for a wizard step (empty = may continue). */
export function validateWizardStep(step: 1 | 2 | 3 | 4, draft: WizardDraft): string[] {
  const errors: string[] = [];
  if (step === 1) {
    if (!draft.client_id) errors.push("Select or create a client.");
  }
  if (step === 2) {
    if (!draft.title.trim()) errors.push("A project title is required.");
  }
  if (step === 3) {
    const levels = draft.floors.map((f) => Number(f.level_number));
    if (draft.floors.some((f) => !String(f.display_name).trim())) errors.push("Every floor needs a display name.");
    if (levels.some((l) => !Number.isInteger(l))) errors.push("Level numbers must be whole numbers.");
    if (new Set(levels).size !== levels.length) errors.push("Level numbers must be unique.");
    if (draft.files.length > 0 && draft.floors.length === 0) errors.push("Add at least one floor to assign the uploaded plans to.");
    if (draft.files.some((f) => !f.floorKey)) errors.push("Assign every uploaded plan to a floor.");
  }
  if (step === 4) {
    errors.push(...validateWizardStep(1, draft), ...validateWizardStep(2, draft), ...validateWizardStep(3, draft));
  }
  return Array.from(new Set(errors));
}

/** Warns about identical files by checksum or by name+size. */
export function duplicateFileWarnings(
  incoming: { name: string; size: number; checksum?: string | null }[],
  existing: { original_filename?: string | null; file_size?: number | null; checksum?: string | null }[],
) {
  const warnings: string[] = [];
  for (const f of incoming) {
    const dup = existing.find(
      (e) =>
        (f.checksum && e.checksum && e.checksum === f.checksum) ||
        (e.original_filename === f.name && Number(e.file_size ?? -1) === f.size),
    );
    if (dup) warnings.push(`${f.name} looks identical to a plan already stored on this project.`);
  }
  return warnings;
}
