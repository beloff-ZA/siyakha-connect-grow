import { formatZar, lineTotal, round2, type Boq, type BoqItem, type BoqSection } from "@/lib/boq";

/**
 * Pure helpers for the simplified "Quick BOQ" experience.
 * Nothing here touches the database: selection, validation and client-safe
 * projection are all derived from records the caller already loaded.
 */

export type QuickBoqSelection = {
  /** Id the UI should preselect, or "" when there is nothing to select. */
  selectedId: string;
  /** True when the project has more than one BOQ and a revision picker is needed. */
  needsSelector: boolean;
  /** True when the project has no BOQ yet and a Create BOQ action is needed. */
  needsCreate: boolean;
};

/**
 * Chooses which BOQ the Quick view opens with. This is a UI decision only and
 * must never write to the database.
 */
export const pickDefaultBoq = (boqs: Pick<Boq, "id" | "status" | "version_no">[], current?: string): QuickBoqSelection => {
  if (current && boqs.some((b) => b.id === current)) {
    return { selectedId: current, needsSelector: boqs.length > 1, needsCreate: false };
  }
  if (boqs.length === 0) return { selectedId: "", needsSelector: false, needsCreate: true };
  const drafts = boqs.filter((b) => b.status === "draft");
  const ordered = [...(drafts.length ? drafts : boqs)].sort((a, b) => Number(b.version_no) - Number(a.version_no));
  return { selectedId: ordered[0]?.id ?? "", needsSelector: boqs.length > 1, needsCreate: false };
};

export type QuickLineInput = {
  category: string;
  description: string;
  quantity: string | number;
  unit: string;
  selling_price: string | number;
  vat_applicable?: boolean;
  specification?: string;
};

export type QuickLineValid = {
  ok: true;
  values: {
    description: string;
    quantity: number;
    unit: string;
    customer_unit_rate: number;
    vat_applicable: boolean;
    specification: string | null;
  };
  line_total: number;
};

export type QuickLineInvalid = { ok: false; errors: Record<string, string> };

/** Validates a quick add/edit line. Invalid input is reported, never silently dropped. */
export const validateQuickLine = (input: QuickLineInput): QuickLineValid | QuickLineInvalid => {
  const errors: Record<string, string> = {};
  const description = String(input.description ?? "").trim();
  if (!description) errors.description = "Add a short item description.";
  if (!String(input.category ?? "").trim()) errors.category = "Choose or create a category.";

  const qty = Number(input.quantity);
  if (!Number.isFinite(qty) || qty <= 0) errors.quantity = "Quantity must be a number greater than zero.";

  const rate = Number(input.selling_price);
  if (!Number.isFinite(rate) || rate < 0) errors.selling_price = "Selling price must be zero or more.";

  const unit = String(input.unit ?? "").trim();
  if (!unit) errors.unit = "Pick a unit.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const spec = String(input.specification ?? "").trim();
  return {
    ok: true,
    values: {
      description,
      quantity: round2(qty),
      unit,
      customer_unit_rate: round2(rate),
      vat_applicable: input.vat_applicable ?? true,
      specification: spec || null,
    },
    line_total: lineTotal(qty, rate),
  };
};

/** Live line total preview for the quick form. */
export const previewLineTotal = (quantity: string | number, rate: string | number) => {
  const q = Number(quantity);
  const r = Number(rate);
  if (!Number.isFinite(q) || !Number.isFinite(r)) return 0;
  return lineTotal(q, r);
};

export const formatLineTotal = (quantity: string | number, rate: string | number) =>
  formatZar(previewLineTotal(quantity, rate));

export type ClientSafeLine = {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  selling_price: number;
  line_total: number;
  vat_applicable: boolean;
};

const CLIENT_SAFE_KEYS: (keyof ClientSafeLine)[] = [
  "category",
  "description",
  "quantity",
  "unit",
  "selling_price",
  "line_total",
  "vat_applicable",
];

export const clientSafeLineKeys = () => [...CLIENT_SAFE_KEYS];

/**
 * Projects the working lines onto the client-safe allowlist used by the customer
 * preview and print output. Supplier, cost, markup, margin, internal notes,
 * item codes and references are dropped by construction.
 */
export const toClientSafeLines = (
  items: BoqItem[],
  sections: Pick<BoqSection, "id" | "title">[],
): ClientSafeLine[] =>
  items
    .filter((it) => it.is_included)
    .map((it) => ({
      category: sections.find((s) => s.id === it.section_id)?.title ?? "General",
      description: it.description,
      quantity: Number(it.quantity),
      unit: it.unit,
      selling_price: Number(it.customer_unit_rate),
      line_total: Number(it.line_total ?? lineTotal(it.quantity, it.customer_unit_rate)),
      vat_applicable: !!it.vat_applicable,
    }));

/** Guard: plan quantity review must be explicitly confirmed before any sync runs. */
export const assertSyncConfirmed = (confirmed: boolean) => {
  if (!confirmed) throw new Error("Review the plan comparison and confirm before applying changes.");
  return true;
};

export const DEFAULT_CATEGORY = "General";
