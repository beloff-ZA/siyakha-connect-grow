import { supabase } from "@/integrations/supabase/client";
import { round2 } from "./boq";

/**
 * Reusable "Solution options" (package comparison) model.
 *
 * Each option points at its OWN bill of quantities revision, so adding or
 * comparing options never mutates, supersedes or hides an existing BOQ. The
 * client acceptance workflow is untouched: options only record a non-destructive
 * "preferred option" choice.
 *
 * Everything exposed here is customer-safe — supplier cost, markup and margin
 * columns are never selected.
 */

const db = supabase as unknown as { from: (t: string) => any };

export type SolutionOptionStatus = "available" | "draft";

export type SolutionOption = {
  id: string;
  project_id: string;
  boq_id: string | null;
  code: string;
  name: string;
  quote_reference: string | null;
  badge: string | null;
  comparison_label: string | null;
  positioning: string | null;
  summary: string | null;
  price_ex_vat: number;
  vat_rate: number;
  vat_amount: number;
  total_incl_vat: number;
  deposit_incl_vat: number | null;
  balance_incl_vat: number | null;
  status: string;
  client_visible: boolean;
  sort_order: number;
  highlights: string[];
  technical_notes: string[];
  exclusions: string[];
};

export type OptionLine = {
  item_code: string | null;
  description: string;
  specification: string | null;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  vat_applicable: boolean;
};

export type OptionPreference = {
  id: string;
  project_id: string;
  option_id: string;
  full_name: string | null;
  email: string | null;
  note: string | null;
  selected_at: string;
};

export const OPTION_VAT_NOTE = "All option prices are shown excluding VAT; the VAT-inclusive total is listed separately.";

/**
 * Honest comparison note: Option 3 is dearer than Option 2 purely because of
 * the doubled camera count and the second NVR.
 */
export const OPTION_DIFFERENCE_NOTE =
  "Option 3 costs more than Option 2 because it includes 64 cameras instead of 32 and two NVRs instead of one, while still remaining far below Option 1.";

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)).filter((v) => v.trim().length > 0) : [];

const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Normalises one database row (or edge-function payload) into a SolutionOption. */
export function normalizeOption(row: Record<string, unknown>): SolutionOption {
  return {
    id: String(row.id ?? ""),
    project_id: String(row.project_id ?? ""),
    boq_id: (row.boq_id as string | null) ?? null,
    code: String(row.code ?? ""),
    name: String(row.name ?? ""),
    quote_reference: (row.quote_reference as string | null) ?? null,
    badge: (row.badge as string | null) ?? null,
    comparison_label: (row.comparison_label as string | null) ?? null,
    positioning: (row.positioning as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    price_ex_vat: num(row.price_ex_vat),
    vat_rate: num(row.vat_rate) || 15,
    vat_amount: num(row.vat_amount),
    total_incl_vat: num(row.total_incl_vat),
    deposit_incl_vat: row.deposit_incl_vat == null ? null : num(row.deposit_incl_vat),
    balance_incl_vat: row.balance_incl_vat == null ? null : num(row.balance_incl_vat),
    status: String(row.status ?? "draft"),
    client_visible: row.client_visible === true,
    sort_order: num(row.sort_order),
    highlights: list(row.highlights),
    technical_notes: list(row.technical_notes),
    exclusions: list(row.exclusions),
  };
}

/** True when the stated VAT and inclusive total reconcile with the ex-VAT price. */
export function optionTotalsReconcile(option: Pick<SolutionOption, "price_ex_vat" | "vat_rate" | "vat_amount" | "total_incl_vat">) {
  const vat = round2((option.price_ex_vat * option.vat_rate) / 100);
  return (
    Math.abs(vat - round2(option.vat_amount)) <= 0.01 &&
    Math.abs(round2(option.price_ex_vat + option.vat_amount) - round2(option.total_incl_vat)) <= 0.01
  );
}

/** True when a deposit/balance pair adds up to the inclusive total. */
export function paymentSplitReconciles(option: Pick<SolutionOption, "deposit_incl_vat" | "balance_incl_vat" | "total_incl_vat">) {
  if (option.deposit_incl_vat == null || option.balance_incl_vat == null) return true;
  return Math.abs(round2(option.deposit_incl_vat + option.balance_incl_vat) - round2(option.total_incl_vat)) <= 0.01;
}

/** True when the priced schedule adds up to the option's published ex-VAT price. */
export const linesReconcile = (lines: readonly Pick<OptionLine, "line_total">[], priceExVat: number) =>
  Math.abs(round2(lines.reduce((sum, l) => round2(sum + Number(l.line_total)), 0)) - round2(priceExVat)) <= 0.01;

/** Client view shows only options explicitly issued: visible and not draft. */
export const isClientVisibleOption = (option: Pick<SolutionOption, "client_visible" | "status">) =>
  option.client_visible === true && String(option.status).trim().toLowerCase() !== "draft";

export const sortOptions = <T extends { sort_order: number; code: string }>(rows: readonly T[]) =>
  [...rows].sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code));

/** Cheapest first-cost option, used only for the honest comparison copy. */
export const lowestCostOption = (options: readonly SolutionOption[]) =>
  sortOptions(options).reduce<SolutionOption | null>(
    (best, o) => (!best || o.price_ex_vat < best.price_ex_vat ? o : best),
    null,
  );

/* --------------------------------------------------------------- admin reads */

const OPTION_COLUMNS =
  "id, project_id, boq_id, code, name, quote_reference, badge, comparison_label, positioning, summary, price_ex_vat, vat_rate, vat_amount, total_incl_vat, deposit_incl_vat, balance_incl_vat, status, client_visible, sort_order, highlights, technical_notes, exclusions";

export async function loadSolutionOptions(projectId: string): Promise<SolutionOption[]> {
  const { data, error } = await db
    .from("portal_solution_options")
    .select(OPTION_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return sortOptions((data ?? []).map(normalizeOption));
}

/** Customer-safe schedule for one option's BOQ revision. */
export async function loadOptionLines(boqId: string): Promise<OptionLine[]> {
  const { data, error } = await db
    .from("portal_boq_items")
    .select("item_code, description, specification, quantity, unit, customer_unit_rate, line_total, vat_applicable, is_included, sort_order")
    .eq("boq_id", boqId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter((r: any) => r.is_included !== false)
    .map((r: any) => ({
      item_code: r.item_code ?? null,
      description: String(r.description ?? ""),
      specification: r.specification ?? null,
      quantity: num(r.quantity),
      unit: String(r.unit ?? "each"),
      customer_unit_rate: num(r.customer_unit_rate),
      line_total: num(r.line_total),
      vat_applicable: r.vat_applicable !== false,
    }));
}

export async function loadOptionPreferences(projectId: string): Promise<OptionPreference[]> {
  const { data, error } = await db
    .from("portal_option_preferences")
    .select("id, project_id, option_id, full_name, email, note, selected_at")
    .eq("project_id", projectId)
    .order("selected_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OptionPreference[];
}

/**
 * Admin publish control. Issuing or withdrawing an option only flips visibility
 * on the option row — no BOQ revision is superseded or deleted.
 */
export async function setOptionVisibility(optionId: string, issued: boolean) {
  const { error } = await db
    .from("portal_solution_options")
    .update({ client_visible: issued, status: issued ? "available" : "draft" })
    .eq("id", optionId);
  if (error) throw new Error(error.message);
}
