import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { BOQ_UNITS, formatZar } from "@/lib/boq";
import { MARKER_KINDS } from "@/lib/floorPlans";
import {
  DISCIPLINES,
  archiveProduct,
  disciplineLabel,
  listProducts,
  productMediaUrl,
  saveProduct,
  suggestedRate,
  uploadProductMedia,
  type CatalogProduct,
  type Discipline,
} from "@/lib/productCatalog";
import { Plus, Search, FileText, Image as ImageIcon } from "lucide-react";

type Draft = Partial<CatalogProduct> & { discipline: Discipline };

const blank = (): Draft => ({
  name: "",
  manufacturer: "",
  model: "",
  sku: "",
  discipline: "connectivity_wifi",
  category: "",
  description: "",
  specification: "",
  unit: "each",
  customer_unit_rate: 0,
  vat_applicable: true,
  supplier_name: "",
  supplier_unit_cost: null,
  default_markup_pct: null,
  default_marker_type: null,
  default_fov_deg: null,
  default_coverage_range: null,
  is_active: true,
});

const num = (v: string) => (v.trim() === "" ? null : Number(v));

const ProductCatalogTab: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<"all" | Discipline>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await listProducts({ includeArchived: showArchived }));
    } catch (e) {
      toast({ title: "Could not load the catalogue", description: (e as any)?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [showArchived, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => (discipline === "all" ? true : p.discipline === discipline))
      .filter((p) =>
        !q
          ? true
          : [p.name, p.manufacturer, p.model, p.sku, p.category].some((v) => (v ?? "").toLowerCase().includes(q)),
      );
  }, [products, query, discipline]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const upload = async (file: File | null, kind: "image" | "datasheet") => {
    if (!file) return;
    try {
      const path = await uploadProductMedia(file, kind);
      set(kind === "image" ? "image_path" : "datasheet_path", path as never);
      toast({ title: kind === "image" ? "Photo uploaded" : "Datasheet uploaded" });
    } catch (e) {
      toast({ title: "Upload failed", description: (e as any)?.message, variant: "destructive" });
    }
  };

  const openMedia = async (path: string | null) => {
    const url = await productMediaUrl(path);
    if (url) window.open(url, "_blank", "noopener");
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name?.trim()) {
      toast({ title: "Product name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveProduct({
        ...draft,
        name: draft.name.trim(),
        sku: draft.sku?.trim() || null,
        customer_unit_rate: Number(draft.customer_unit_rate ?? 0),
      });
      setDraft(null);
      await load();
      toast({ title: "Catalogue updated" });
    } catch (e) {
      toast({ title: "Could not save the product", description: (e as any)?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (p: CatalogProduct) => {
    try {
      await archiveProduct(p.id, !p.archived_at);
      await load();
    } catch (e) {
      toast({ title: "Could not update the product", description: (e as any)?.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Panel
        title="Product catalogue"
        actions={
          <Button size="sm" variant="outline" onClick={() => setDraft(blank())}>
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> New product
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field label="Search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, manufacturer, model, SKU" className="pl-9" />
            </div>
          </Field>
          <Field label="Discipline">
            <select className={selectCls} value={discipline} onChange={(e) => setDiscipline(e.target.value as never)}>
              <option value="all">All disciplines</option>
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Show archived
          </label>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Supplier names, supplier costs and default markup are internal only — clients never see them. Product photos and
          datasheets are stored privately and opened through short-lived signed links.
        </p>
      </Panel>

      {draft && (
        <Panel title={draft.id ? "Edit product" : "New product"}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input value={draft.name ?? ""} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Discipline">
              <select className={selectCls} value={draft.discipline} onChange={(e) => set("discipline", e.target.value as Discipline)}>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Manufacturer">
              <Input value={draft.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value)} />
            </Field>
            <Field label="Model">
              <Input value={draft.model ?? ""} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="SKU / item code">
              <Input value={draft.sku ?? ""} onChange={(e) => set("sku", e.target.value)} />
            </Field>
            <Field label="Category">
              <Input value={draft.category ?? ""} onChange={(e) => set("category", e.target.value)} />
            </Field>
            <Field label="Unit">
              <select className={selectCls} value={draft.unit ?? "each"} onChange={(e) => set("unit", e.target.value)}>
                {BOQ_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer unit rate (excl. VAT)">
              <Input
                type="number"
                step="0.01"
                value={draft.customer_unit_rate ?? 0}
                onChange={(e) => set("customer_unit_rate", Number(e.target.value) as never)}
              />
            </Field>
            <Field label="Supplier (internal)">
              <Input value={draft.supplier_name ?? ""} onChange={(e) => set("supplier_name", e.target.value)} />
            </Field>
            <Field label="Supplier unit cost (internal)">
              <Input
                type="number"
                step="0.01"
                value={draft.supplier_unit_cost ?? ""}
                onChange={(e) => set("supplier_unit_cost", num(e.target.value) as never)}
              />
            </Field>
            <Field label="Default markup % (internal)">
              <Input
                type="number"
                step="0.01"
                value={draft.default_markup_pct ?? ""}
                onChange={(e) => set("default_markup_pct", num(e.target.value) as never)}
              />
            </Field>
            <Field label="Default plan marker">
              <select
                className={selectCls}
                value={draft.default_marker_type ?? ""}
                onChange={(e) => set("default_marker_type", (e.target.value || null) as never)}
              >
                <option value="">Not a plan device</option>
                {MARKER_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Default field of view (°)">
              <Input
                type="number"
                value={draft.default_fov_deg ?? ""}
                onChange={(e) => set("default_fov_deg", num(e.target.value) as never)}
              />
            </Field>
            <Field label="Default coverage range">
              <select
                className={selectCls}
                value={draft.default_coverage_range ?? ""}
                onChange={(e) => set("default_coverage_range", (e.target.value || null) as never)}
              >
                <option value="">Not applicable</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea rows={2} value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Specification" className="md:col-span-2">
              <Textarea rows={3} value={draft.specification ?? ""} onChange={(e) => set("specification", e.target.value)} />
            </Field>
            <Field label="Product photo (private)">
              <input type="file" accept="image/*" onChange={(e) => void upload(e.target.files?.[0] ?? null, "image")} className="text-xs" />
              {draft.image_path && (
                <button type="button" className="mt-1 text-xs underline" onClick={() => void openMedia(draft.image_path!)}>
                  View uploaded photo
                </button>
              )}
            </Field>
            <Field label="Datasheet (private)">
              <input type="file" accept="application/pdf" onChange={(e) => void upload(e.target.files?.[0] ?? null, "datasheet")} className="text-xs" />
              {draft.datasheet_path && (
                <button type="button" className="mt-1 text-xs underline" onClick={() => void openMedia(draft.datasheet_path!)}>
                  View uploaded datasheet
                </button>
              )}
            </Field>
          </div>

          {draft.supplier_unit_cost != null && (
            <p className="mt-4 text-xs text-muted-foreground">
              Internal indication: cost {formatZar(Number(draft.supplier_unit_cost))} with{" "}
              {Number(draft.default_markup_pct ?? 0)}% markup ={" "}
              {formatZar(suggestedRate(Number(draft.supplier_unit_cost), draft.default_markup_pct ?? 0) ?? 0)}.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : draft.id ? "Save changes" : "Add to catalogue"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={draft.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
              Active in plan palette
            </label>
          </div>
        </Panel>
      )}

      <Panel title={`Catalogue (${rows.length})`}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading catalogue…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products yet. Add real products with their manufacturer, model, SKU and rates — the plan palette and BOQ sync
            both read from this catalogue.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Discipline</th>
                  <th className="py-2 pr-4">Unit</th>
                  <th className="py-2 pr-4 text-right">Customer rate</th>
                  <th className="py-2 pr-4 text-right">Internal cost</th>
                  <th className="py-2 pr-4">Media</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4">
                      <span className="block">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[p.manufacturer, p.model, p.sku].filter(Boolean).join(" · ") || "—"}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {!p.is_active && <Chip>Inactive</Chip>}
                        {p.archived_at && <Chip>Archived</Chip>}
                        {p.default_marker_type && <Chip>Plan device</Chip>}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{disciplineLabel(p.discipline)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.unit}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{formatZar(Number(p.customer_unit_rate))}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                      {p.supplier_unit_cost == null ? "—" : formatZar(Number(p.supplier_unit_cost))}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex gap-2">
                        {p.image_path && (
                          <button type="button" aria-label="View photo" onClick={() => void openMedia(p.image_path)}>
                            <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        )}
                        {p.datasheet_path && (
                          <button type="button" aria-label="View datasheet" onClick={() => void openMedia(p.datasheet_path)}>
                            <FileText className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDraft({ ...p })}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void toggleArchive(p)}>
                          {p.archived_at ? "Restore" : "Archive"}
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default ProductCatalogTab;
