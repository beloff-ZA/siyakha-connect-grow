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

/* -------------------------------------------------------------------------- */
/* Unified "Edit BOQ item" form                                               */
/* -------------------------------------------------------------------------- */

/** Fields the unified editor is ever allowed to write. Nothing else may leak in. */
export const UNIFIED_EDIT_KEYS = [
  "description",
  "section_id",
  "quantity",
  "unit",
  "customer_unit_rate",
  "vat_applicable",
  "is_included",
  "item_code",
  "specification",
  "reference",
  "notes",
] as const;

export type UnifiedEditKey = (typeof UNIFIED_EDIT_KEYS)[number];

export type UnifiedItemPatch = Partial<{
  description: string;
  section_id: string;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  vat_applicable: boolean;
  is_included: boolean;
  item_code: string | null;
  specification: string | null;
  reference: string | null;
  notes: string | null;
}>;

/** A BOQ line whose quantity is owned by the plan/device mapping. */
export const isPlanQuantityLocked = (item: { quantity_source?: string | null }) =>
  String(item?.quantity_source ?? "") === "plan";

export const PLAN_QUANTITY_NOTE =
  "This quantity is mapped from the plans. Change it through “Review items from plans”.";

export type UnifiedItemCurrent = Pick<
  BoqItem,
  | "description"
  | "section_id"
  | "quantity"
  | "unit"
  | "customer_unit_rate"
  | "vat_applicable"
  | "is_included"
  | "item_code"
  | "specification"
  | "reference"
  | "notes"
> & { quantity_source?: string | null };

export type UnifiedItemInput = {
  title: string;
  /** Category title chosen in the form (used only for validation here). */
  category: string;
  /** Section id the caller resolved for that category. */
  section_id: string;
  quantity: string | number;
  unit: string;
  selling_price: string | number;
  vat_applicable: boolean;
  is_included: boolean;
  item_code?: string;
  specification?: string;
  reference?: string;
  notes?: string;
};

export type UnifiedItemErrors = Partial<
  Record<"description" | "category" | "quantity" | "unit" | "selling_price", string>
>;

export type UnifiedItemResult =
  | { ok: true; patch: UnifiedItemPatch; changed: boolean; summary: string }
  | { ok: false; errors: UnifiedItemErrors };

const nullableText = (value: string | undefined) => {
  const trimmed = String(value ?? "").trim();
  return trimmed ? trimmed : null;
};

/**
 * The single allowlisted patch builder for the unified editor.
 * Only changed fields are returned, plan-derived quantities are never touched,
 * and every field outside UNIFIED_EDIT_KEYS (boq_id, product_id, quantity_source,
 * floor_id, sort_order, costing) is untouched by construction.
 */
export const unifiedItemPatch = (current: UnifiedItemCurrent, input: UnifiedItemInput): UnifiedItemResult => {
  const errors: UnifiedItemErrors = {};
  const description = String(input.title ?? "").trim();
  if (!description) errors.description = "Enter an item title.";
  if (!String(input.category ?? "").trim() || !String(input.section_id ?? "").trim())
    errors.category = "Choose a category.";

  const unit = String(input.unit ?? "").trim();
  if (!unit) errors.unit = "Pick a unit.";

  const planLocked = isPlanQuantityLocked(current);
  const qty = Number(input.quantity);
  if (!planLocked && (!Number.isFinite(qty) || qty < 0)) errors.quantity = "Quantity must be zero or more.";

  const rate = Number(input.selling_price);
  if (!Number.isFinite(rate) || rate < 0) errors.selling_price = "Selling price must be zero or more.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const patch: UnifiedItemPatch = {};
  const parts: string[] = [];

  if (description !== current.description) {
    patch.description = description;
    parts.push(`title "${current.description}" → "${description}"`);
  }
  if (input.section_id !== current.section_id) {
    patch.section_id = input.section_id;
    parts.push("category changed");
  }
  if (!planLocked && round2(qty) !== round2(Number(current.quantity))) {
    patch.quantity = round2(qty);
    parts.push(`quantity ${Number(current.quantity)} → ${round2(qty)}`);
  }
  if (unit !== current.unit) {
    patch.unit = unit;
    parts.push(`unit ${current.unit} → ${unit}`);
  }
  if (round2(rate) !== round2(Number(current.customer_unit_rate))) {
    patch.customer_unit_rate = round2(rate);
    parts.push(`selling price ${formatZar(Number(current.customer_unit_rate))} → ${formatZar(round2(rate))}`);
  }
  if (!!input.vat_applicable !== !!current.vat_applicable) {
    patch.vat_applicable = !!input.vat_applicable;
    parts.push(`VAT ${input.vat_applicable ? "applied" : "removed"}`);
  }
  if (!!input.is_included !== !!current.is_included) {
    patch.is_included = !!input.is_included;
    parts.push(input.is_included ? "included in BOQ" : "excluded from BOQ");
  }

  const optional: [UnifiedEditKey & ("item_code" | "specification" | "reference" | "notes"), string | undefined, string][] = [
    ["item_code", input.item_code, "item code"],
    ["specification", input.specification, "specification"],
    ["reference", input.reference, "reference"],
    ["notes", input.notes, "notes"],
  ];
  for (const [key, raw, label] of optional) {
    const next = nullableText(raw);
    if (next !== (current[key] ?? null)) {
      patch[key] = next;
      parts.push(`${label} updated`);
    }
  }

  return {
    ok: true,
    patch,
    changed: parts.length > 0,
    summary: parts.length ? `${description}: ${parts.join("; ")}` : `${description}: no changes`,
  };
};
