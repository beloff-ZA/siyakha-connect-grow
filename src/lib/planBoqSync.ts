import { supabase } from "@/integrations/supabase/client";
import { DISCIPLINES, type CatalogProduct } from "@/lib/productCatalog";

const db = supabase as unknown as { from: (t: string) => any };

export type PlanBoqRow = {
  product_id: string;
  product: CatalogProduct | null;
  placed: number;
  unplaced: number;
  boqQuantity: number | null;
  boqItemId: string | null;
};

export type PlanBoqReconciliation = {
  rows: PlanBoqRow[];
  orphanBoqLines: { id: string; description: string; quantity: number }[];
  unlinkedMarkers: number;
};

/**
 * Non-destructive read of design vs BOQ quantities. Placed and unplaced instances
 * both count — an unplaced record is still a real project device.
 */
export async function loadReconciliation(projectId: string, boqId: string): Promise<PlanBoqReconciliation> {
  const [markersRes, itemsRes, productsRes] = await Promise.all([
    db
      .from("portal_floor_markers")
      .select("id, product_id, is_placed")
      .eq("project_id", projectId),
    db
      .from("portal_boq_items")
      .select("id, description, quantity, product_id, quantity_source")
      .eq("boq_id", boqId),
    db.from("portal_product_catalog").select("*"),
  ]);

  const err = [markersRes, itemsRes, productsRes].find((r: any) => r.error)?.error;
  if (err) throw err;

  const products = (productsRes.data ?? []) as CatalogProduct[];
  const markers = (markersRes.data ?? []) as { id: string; product_id: string | null; is_placed: boolean | null }[];
  const items = (itemsRes.data ?? []) as {
    id: string;
    description: string;
    quantity: number;
    product_id: string | null;
    quantity_source: string;
  }[];

  const counts = new Map<string, { placed: number; unplaced: number }>();
  let unlinkedMarkers = 0;
  for (const m of markers) {
    if (!m.product_id) {
      unlinkedMarkers += 1;
      continue;
    }
    const entry = counts.get(m.product_id) ?? { placed: 0, unplaced: 0 };
    if (m.is_placed === false) entry.unplaced += 1;
    else entry.placed += 1;
    counts.set(m.product_id, entry);
  }

  const planLines = items.filter((i) => i.quantity_source === "plan");
  const productIds = new Set<string>([...counts.keys()]);
  for (const line of planLines) if (line.product_id) productIds.add(line.product_id);

  const rows: PlanBoqRow[] = [...productIds].map((pid) => {
    const c = counts.get(pid) ?? { placed: 0, unplaced: 0 };
    const line = planLines.find((l) => l.product_id === pid) ?? null;
    return {
      product_id: pid,
      product: products.find((p) => p.id === pid) ?? null,
      placed: c.placed,
      unplaced: c.unplaced,
      boqQuantity: line ? Number(line.quantity) : null,
      boqItemId: line?.id ?? null,
    };
  });

  rows.sort((a, b) => (a.product?.name ?? "").localeCompare(b.product?.name ?? ""));

  return {
    rows,
    orphanBoqLines: planLines
      .filter((l) => !l.product_id)
      .map((l) => ({ id: l.id, description: l.description, quantity: Number(l.quantity) })),
    unlinkedMarkers,
  };
}

export const designQty = (row: PlanBoqRow) => row.placed + row.unplaced;
export const isMismatch = (row: PlanBoqRow) => (row.boqQuantity ?? -1) !== designQty(row);

/** Runs the transaction-safe server-side sync. Only quantities change. */
export async function syncBoqFromPlan(boqId: string) {
  const { data, error } = await supabase.rpc("portal_sync_boq_from_plan" as never, { _boq_id: boqId } as never);
  if (error) throw error;
  return (data ?? {}) as { added?: number; updated?: number; removed?: number };
}

export const disciplineOptions = DISCIPLINES;
