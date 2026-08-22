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

export type QuickLineValues = {
  description: string;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  vat_applicable: boolean;
  specification: string | null;
};

export type QuickLineResult = {
  ok: boolean;
  values: QuickLineValues;
  line_total: number;
  errors: Record<string, string>;
};

/** @deprecated kept for readability of call sites */
export type QuickLineValid = QuickLineResult;
export type QuickLineInvalid = QuickLineResult;

const EMPTY_VALUES: QuickLineValues = {
  description: "",
  quantity: 0,
  unit: "each",
  customer_unit_rate: 0,
  vat_applicable: true,
  specification: null,
};

/** Validates a quick add/edit line. Invalid input is reported, never silently dropped. */
export const validateQuickLine = (input: QuickLineInput): QuickLineResult => {
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

  if (Object.keys(errors).length) return { ok: false, errors, values: EMPTY_VALUES, line_total: 0 };

  const spec = String(input.specification ?? "").trim();
  return {
    ok: true,
    errors: {},
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

/* -------------------------------------------------------------------------- */
/* Searchable BOQ items with safe price updating                              */
/* -------------------------------------------------------------------------- */

/** A revision that may be searched but never edited in place. */
export const isRevisionLocked = (status: string | null | undefined) =>
  status === "approved" || status === "superseded";

export type BoqSearchResult = {
  item: BoqItem;
  category: string;
};

/**
 * Case-insensitive search restricted to a single BOQ revision.
 * Matching fields: description, item code, specification, reference and
 * category/section title. An empty query returns every scoped item.
 */
export const searchBoqItems = (
  items: BoqItem[],
  sections: Pick<BoqSection, "id" | "title">[],
  query: string,
  boqId: string,
): BoqSearchResult[] => {
  const scoped = items.filter((it) => it.boq_id === boqId);
  const rows = scoped.map((item) => ({
    item,
    category: sections.find((s) => s.id === item.section_id)?.title ?? DEFAULT_CATEGORY,
  }));
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(({ item, category }) =>
    [item.description, item.item_code, item.specification, item.reference, category]
      .some((field) => String(field ?? "").toLowerCase().includes(q)),
  );
};

export type PriceValidation = { ok: true; value: number } | { ok: false; error: string };

/** Validates the "New selling price" field: a number greater than or equal to zero. */
export const validateNewPrice = (input: string | number): PriceValidation => {
  const raw = String(input ?? "").trim();
  if (!raw) return { ok: false, error: "Enter a new selling price." };
  const value = Number(raw);
  if (!Number.isFinite(value)) return { ok: false, error: "Enter a valid number." };
  if (value < 0) return { ok: false, error: "The selling price must be zero or more." };
  return { ok: true, value: round2(value) };
};

/**
 * The only patch a quick price update may send: the customer selling rate.
 * Quantity, section, description, product/plan linkage, VAT and every other
 * field are untouched by construction.
 */
export const priceUpdatePatch = (value: number): { customer_unit_rate: number } => ({
  customer_unit_rate: round2(value),
});

/* -------------------------------------------------------------------------- */
/* Editing item title + selling price together                                */
/* -------------------------------------------------------------------------- */

export type TitleValidation = { ok: true; value: string } | { ok: false; error: string };

/** Validates the "Item title" field: a non-empty trimmed description. */
export const validateItemTitle = (input: string): TitleValidation => {
  const value = String(input ?? "").trim();
  if (!value) return { ok: false, error: "Enter an item title." };
  return { ok: true, value };
};

export type ItemEditPatch = { description?: string; customer_unit_rate?: number };

export type ItemEditResult =
  | { ok: true; patch: ItemEditPatch; changed: boolean; summary: string }
  | { ok: false; errors: { description?: string; selling_price?: string } };

/**
 * Builds the only patch a quick item edit may send: the item title and/or the
 * customer selling rate. Unchanged fields are omitted so nothing is rewritten
 * unnecessarily; every other column is untouched by construction.
 */
export const itemEditPatch = (
  current: Pick<BoqItem, "description" | "customer_unit_rate">,
  input: { title: string; selling_price: string | number },
): ItemEditResult => {
  const title = validateItemTitle(input.title);
  const price = validateNewPrice(input.selling_price);
  if (title.ok !== true || price.ok !== true) {
    return {
      ok: false,
      errors: {
        ...(title.ok !== true ? { description: title.error } : {}),
        ...(price.ok !== true ? { selling_price: price.error } : {}),
      },
    };
  }

  const patch: ItemEditPatch = {};
  const parts: string[] = [];
  if (title.value !== current.description) {
    patch.description = title.value;
    parts.push(`title "${current.description}" → "${title.value}"`);
  }
  if (round2(Number(current.customer_unit_rate)) !== price.value) {
    patch.customer_unit_rate = price.value;
    parts.push(`selling price ${formatZar(Number(current.customer_unit_rate))} → ${formatZar(price.value)}`);
  }

  return {
    ok: true,
    patch,
    changed: parts.length > 0,
    summary: parts.length ? `${title.value}: ${parts.join("; ")}` : `${title.value}: no changes`,
  };
};
