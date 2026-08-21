export type BoqStatus = "draft" | "shared" | "approved" | "superseded";

export type Boq = {
  id: string;
  project_id: string;
  title: string;
  revision_label: string;
  version_no: number;
  status: BoqStatus;
  currency: string;
  vat_enabled: boolean;
  vat_rate: number;
  valid_until: string | null;
  notes: string | null;
  published_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BoqSection = {
  id: string;
  boq_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type BoqItem = {
  id: string;
  boq_id: string;
  section_id: string;
  item_code: string | null;
  description: string;
  specification: string | null;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  vat_applicable: boolean;
  is_included: boolean;
  notes: string | null;
  reference: string | null;
  sort_order: number;
};

export const BOQ_UNITS = ["each", "m", "m²", "point", "hour", "day", "lot", "sum", "km", "no."];

/** Round half-up to 2 decimals using integer cents to avoid float drift. */
export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const formatZar = (value: number) =>
  `R ${round2(value)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

export const formatQty = (value: number) =>
  Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(3);

export const lineTotal = (quantity: number, rate: number) => round2(Number(quantity) * Number(rate));

export type BoqTotals = { subtotal: number; vat: number; total: number };

export const computeTotals = (
  items: Pick<BoqItem, "quantity" | "customer_unit_rate" | "vat_applicable" | "is_included" | "line_total">[],
  opts: { vat_enabled: boolean; vat_rate: number },
): BoqTotals => {
  let subtotal = 0;
  let vatable = 0;
  for (const it of items) {
    if (!it.is_included) continue;
    const total = it.line_total ?? lineTotal(it.quantity, it.customer_unit_rate);
    subtotal = round2(subtotal + Number(total));
    if (it.vat_applicable) vatable = round2(vatable + Number(total));
  }
  const vat = opts.vat_enabled ? round2((vatable * Number(opts.vat_rate)) / 100) : 0;
  return { subtotal, vat, total: round2(subtotal + vat) };
};

/** Admin-only helper: margin from customer rate vs supplier cost. */
export const marginPercent = (customerRate: number, supplierCost: number) => {
  const rate = Number(customerRate);
  if (!rate) return 0;
  return round2(((rate - Number(supplierCost)) / rate) * 100);
};

export const statusTone = (status: BoqStatus | string) =>
  status === "approved"
    ? "border-foreground text-foreground"
    : status === "shared"
      ? "border-border text-foreground"
      : "border-dashed border-border text-muted-foreground";
