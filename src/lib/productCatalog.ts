import { supabase } from "@/integrations/supabase/client";
import type { MarkerKind } from "@/lib/floorPlans";

export const PRODUCT_MEDIA_BUCKET = "product-catalog";

export type Discipline =
  | "connectivity_wifi"
  | "cctv_security"
  | "fibre_cabling"
  | "fire_detection"
  | "power_energy"
  | "automation_iot"
  | "general";

export const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "connectivity_wifi", label: "Connectivity & Wi-Fi" },
  { value: "cctv_security", label: "CCTV & Security" },
  { value: "fibre_cabling", label: "Fibre & Structured Cabling" },
  { value: "fire_detection", label: "Fire Detection" },
  { value: "power_energy", label: "Power & Energy Saving" },
  { value: "automation_iot", label: "Automation & IoT" },
  { value: "general", label: "General / Sundries" },
];

export const disciplineLabel = (value?: string | null) =>
  DISCIPLINES.find((d) => d.value === value)?.label ?? "Unassigned";

export type CatalogProduct = {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  sku: string | null;
  discipline: Discipline;
  category: string | null;
  description: string | null;
  specification: string | null;
  unit: string;
  customer_unit_rate: number;
  vat_applicable: boolean;
  supplier_name: string | null;
  supplier_unit_cost: number | null;
  default_markup_pct: number | null;
  image_path: string | null;
  datasheet_path: string | null;
  default_marker_type: MarkerKind | null;
  default_fov_deg: number | null;
  default_coverage_range: string | null;
  default_coverage_radius_m: number | null;
  is_active: boolean;
  archived_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const db = supabase as unknown as { from: (t: string) => any; storage: typeof supabase.storage };

export async function listProducts(opts?: { includeArchived?: boolean }) {
  let query = db.from("portal_product_catalog").select("*").order("name");
  if (!opts?.includeArchived) query = query.is("archived_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CatalogProduct[];
}

export async function saveProduct(input: Partial<CatalogProduct>) {
  const payload = { ...input };
  if (payload.id) {
    const { id, ...rest } = payload;
    const { error } = await db.from("portal_product_catalog").update(rest).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await db.from("portal_product_catalog").insert(payload).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function archiveProduct(id: string, archived: boolean) {
  const { error } = await db
    .from("portal_product_catalog")
    .update({ archived_at: archived ? new Date().toISOString() : null, is_active: !archived })
    .eq("id", id);
  if (error) throw error;
}

/** Private storage: media is only ever reachable through a short-lived signed URL. */
export async function uploadProductMedia(file: File, kind: "image" | "datasheet") {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${kind}s/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function productMediaUrl(path: string | null | undefined) {
  if (!path) return null;
  const { data } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** Indicative internal sell price from supplier cost and default markup (admin only). */
export const suggestedRate = (cost: number | null, markupPct: number | null) => {
  if (cost == null) return null;
  return Math.round(Number(cost) * (1 + Number(markupPct ?? 0) / 100) * 100) / 100;
};
