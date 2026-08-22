import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Loader2, Plus, Printer, Search, Settings2, Trash2, X } from "lucide-react";
import BoqManager from "@/components/helpdesk/BoqManager";
import PlanBoqSyncPanel from "./PlanBoqSyncPanel";
import PrintSurface from "./PrintSurface";
import BoqPrintView from "./BoqPrintView";
import { Panel, Stat, Field, selectCls } from "./ui";
import { BOQ_UNITS, computeTotals, formatQty, formatZar, lineTotal, type Boq, type BoqItem, type BoqSection } from "@/lib/boq";
import {
  DEFAULT_CATEGORY,
  isRevisionLocked,
  itemEditPatch,
  pickDefaultBoq,
  previewLineTotal,
  searchBoqItems,
  validateQuickLine,
} from "@/lib/quickBoq";
import { buildSnapshot, type ProposalSnapshot } from "@/lib/proposals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const todayPlus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

type QuickForm = {
  id?: string;
  category: string;
  newCategory: string;
  description: string;
  quantity: string;
  unit: string;
  selling_price: string;
  vat_applicable: boolean;
  specification: string;
};

const emptyForm = (category: string): QuickForm => ({
  category,
  newCategory: "",
  description: "",
  quantity: "1",
  unit: "each",
  selling_price: "0",
  vat_applicable: true,
  specification: "",
});

/**
 * Simplified, spreadsheet-style BOQ builder for the URL-scoped project workspace.
 * The full QS/internal costing tooling stays available under "Advanced costing",
 * which reuses BoqManager unchanged. Nothing is written on load.
 */
const QuickBoqTab: React.FC<{ ws: PmWorkspace; projectId: string }> = ({ ws, projectId }) => {
  const { toast } = useToast();
  const [boqs, setBoqs] = useState<Boq[]>([]);
  const [boqId, setBoqId] = useState("");
  const [sections, setSections] = useState<BoqSection[]>([]);
  const [items, setItems] = useState<BoqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<ProposalSnapshot | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPlanReview, setShowPlanReview] = useState(false);
  const [planConfirmed, setPlanConfirmed] = useState(false);
  const [form, setForm] = useState<QuickForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; quantity: string; rate: string } | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [priceTarget, setPriceTarget] = useState<BoqItem | null>(null);
  const [priceValue, setPriceValue] = useState("0");
  const [titleValue, setTitleValue] = useState("");
  const [editErrors, setEditErrors] = useState<{ description?: string; selling_price?: string }>({});
  const [creating, setCreating] = useState({ title: "Bill of quantities", revision_label: "Draft v1", vat_enabled: true, valid_until: todayPlus(30) });

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : (e as any)?.message ?? String(e),
      variant: "destructive" as never,
    });

  const loadBoqs = useCallback(async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("portal_boqs")
      .select("*")
      .eq("project_id", projectId)
      .order("version_no", { ascending: false });
    setLoading(false);
    if (error) return fail(error);
    const list = (data ?? []) as unknown as Boq[];
    setBoqs(list);
    // UI-only automatic selection: never writes to the database.
    setBoqId((prev) => pickDefaultBoq(list, prev).selectedId);
  }, [projectId]);

  const loadDetail = useCallback(async () => {
    if (!boqId) {
      setSections([]);
      setItems([]);
      return;
    }
    const [s, i] = await Promise.all([
      supabase.from("portal_boq_sections").select("*").eq("boq_id", boqId).order("sort_order"),
      supabase.from("portal_boq_items").select("*").eq("boq_id", boqId).order("sort_order"),
    ]);
    setSections((s.data ?? []) as unknown as BoqSection[]);
    setItems((i.data ?? []) as unknown as BoqItem[]);
  }, [boqId]);

  useEffect(() => {
    void loadBoqs();
  }, [loadBoqs]);
  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);
  useEffect(() => {
    setQuery("");
    setAppliedQuery("");
  }, [boqId]);

  const selection = useMemo(() => pickDefaultBoq(boqs, boqId), [boqs, boqId]);
  const boq = boqs.find((b) => b.id === boqId) ?? null;
  const readOnly = isRevisionLocked(boq?.status);
  const totals = useMemo(
    () => computeTotals(items, { vat_enabled: boq?.vat_enabled ?? true, vat_rate: Number(boq?.vat_rate ?? 15) }),
    [items, boq],
  );

  const results = useMemo(() => searchBoqItems(items, sections, appliedQuery, boqId), [items, sections, appliedQuery, boqId]);

  const sectionTitle = (id: string) => sections.find((s) => s.id === id)?.title ?? DEFAULT_CATEGORY;

  const refresh = async () => {
    await loadDetail();
    ws.reload?.();
  };

  /* ---- explicit writes only ---- */

  const createBoq = async () => {
    if (!creating.title.trim()) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const nextVersion = (boqs[0]?.version_no ?? 0) + 1;
      const { data, error } = await supabase
        .from("portal_boqs")
        .insert({
          project_id: projectId,
          title: creating.title.trim(),
          revision_label: creating.revision_label.trim() || `Draft v${nextVersion}`,
          version_no: nextVersion,
          vat_enabled: creating.vat_enabled,
          valid_until: creating.valid_until || null,
          created_by: u.user?.id ?? null,
        })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      toast({ title: "BOQ created" });
      if (data?.id) setBoqId(data.id);
      await loadBoqs();
      ws.reload?.();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /** Resolves the category to a section id, creating the section only when asked. */
  const resolveSection = async (f: QuickForm) => {
    const title = (f.category === "__new" ? f.newCategory : f.category).trim() || DEFAULT_CATEGORY;
    const existing = sections.find((s) => s.title.toLowerCase() === title.toLowerCase());
    if (existing) return existing.id;
    const { data, error } = await supabase
      .from("portal_boq_sections")
      .insert({ boq_id: boqId, title, sort_order: sections.length + 1 })
      .select("id")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("Could not create the category");
    return data.id as string;
  };

  const submitForm = async () => {
    if (!form || !boqId) return;
    const category = form.category === "__new" ? form.newCategory : form.category;
    const result = validateQuickLine({ ...form, category, selling_price: form.selling_price });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const sectionId = await resolveSection(form);
      const values = result.values;
      if (form.id) {
        const { error } = await supabase
          .from("portal_boq_items")
          .update({ ...values, section_id: sectionId })
          .eq("id", form.id);
        if (error) throw error;
        toast({ title: "Item updated" });
      } else {
        const { error } = await supabase.from("portal_boq_items").insert({
          boq_id: boqId,
          section_id: sectionId,
          ...values,
          sort_order: items.length + 1,
        });
        if (error) throw error;
        toast({ title: "Item added" });
      }
      setForm(null);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const saveInline = async () => {
    if (!edit) return;
    const item = items.find((i) => i.id === edit.id);
    if (!item) return;
    const qty = Number(edit.quantity);
    const rate = Number(edit.rate);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(rate) || rate < 0) {
      return toast({ title: "Check the quantity and selling price", description: "Quantity must be above zero and the price zero or more.", variant: "destructive" as never });
    }
    setBusy(true);
    const { error } = await supabase
      .from("portal_boq_items")
      .update({ quantity: qty, customer_unit_rate: rate })
      .eq("id", edit.id);
    setBusy(false);
    if (error) return fail(error);
    setEdit(null);
    toast({ title: "Line saved" });
    await refresh();
  };

  const toggleIncluded = async (item: BoqItem, value: boolean) => {
    const { error } = await supabase.from("portal_boq_items").update({ is_included: value }).eq("id", item.id);
    if (error) return fail(error);
    await refresh();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("portal_boq_items").delete().eq("id", deleteId);
    setBusy(false);
    setDeleteId(null);
    if (error) return fail(error);
    toast({ title: "Item removed" });
    await refresh();
  };

  /** Reuses the existing portal_boq_activity log — no new logging system. */
  const logActivity = async (action: string, detail: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      await supabase.from("portal_boq_activity").insert({
        boq_id: boqId,
        actor_user_id: data.user?.id ?? null,
        actor_type: "admin",
        action,
        detail,
      });
    } catch {
      /* logging must never block the price update */
    }
  };

  const openPriceDialog = (it: BoqItem) => {
    setEditErrors({});
    setTitleValue(it.description);
    setPriceValue(String(Number(it.customer_unit_rate)));
    setPriceTarget(it);
  };

  const saveItemEdit = async () => {
    if (!priceTarget) return;
    const result = itemEditPatch(priceTarget, { title: titleValue, selling_price: priceValue });
    if (result.ok !== true) {
      setEditErrors(result.errors);
      return;
    }

    setEditErrors({});
    if (!result.changed) {
      setPriceTarget(null);
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("portal_boq_items").update(result.patch).eq("id", priceTarget.id);
    setBusy(false);
    if (error) return fail(error);
    await logActivity("item_updated", result.summary);
    toast({ title: "Changes saved", description: titleValue.trim() });
    setPriceTarget(null);
    await refresh();
  };


  const openCustomerDocument = async () => {
    if (!boqId) return;
    setBusy(true);
    try {
      setSnapshot(await buildSnapshot(projectId, boqId));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const openCreateItem = () => {
    setErrors({});
    setForm(emptyForm(sections[0]?.title ?? DEFAULT_CATEGORY));
  };

  const openEditItem = (it: BoqItem) => {
    setErrors({});
    setForm({
      id: it.id,
      category: sectionTitle(it.section_id),
      newCategory: "",
      description: it.description,
      quantity: String(Number(it.quantity)),
      unit: it.unit,
      selling_price: String(Number(it.customer_unit_rate)),
      vat_applicable: !!it.vat_applicable,
      specification: it.specification ?? "",
    });
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading bill of quantities…</p>;

  if (selection.needsCreate) {
    return (
      <Panel title="Bill of quantities">
        <p className="text-sm text-muted-foreground">
          This project has no bill of quantities yet. Create one to start pricing.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Title">
            <Input value={creating.title} onChange={(e) => setCreating({ ...creating, title: e.target.value })} />
          </Field>
          <Field label="Revision">
            <Input value={creating.revision_label} onChange={(e) => setCreating({ ...creating, revision_label: e.target.value })} />
          </Field>
          <Field label="Valid until">
            <Input type="date" value={creating.valid_until} onChange={(e) => setCreating({ ...creating, valid_until: e.target.value })} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={creating.vat_enabled}
              onChange={(e) => setCreating({ ...creating, vat_enabled: e.target.checked })}
            />
            Add VAT
          </label>
        </div>
        <Button className="mt-5" onClick={createBoq} disabled={busy || !creating.title.trim()}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create BOQ
        </Button>
      </Panel>
    );
  }

  return (
    <div>
      <Panel
        title="Quick BOQ"
        actions={
          selection.needsSelector ? (
            <select
              aria-label="BOQ revision"
              className={`${selectCls} max-w-xs`}
              value={boqId}
              onChange={(e) => setBoqId(e.target.value)}
            >
              {boqs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} · {b.revision_label} ({b.status})
                </option>
              ))}
            </select>
          ) : (
            boq && <span className="text-xs text-muted-foreground">{boq.title} · {boq.revision_label}</span>
          )
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Items" value={items.length} />
          <Stat label="Subtotal" value={formatZar(totals.subtotal)} />
          <Stat label="VAT" value={formatZar(totals.vat)} />
          <Stat label="Total including VAT" value={formatZar(totals.total)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" onClick={openCreateItem} disabled={readOnly}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> Add item
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowPlanReview((v) => !v)}>
            Review items from plans
          </Button>
          <Button size="sm" variant="outline" onClick={openCustomerDocument} disabled={busy}>
            Preview customer BOQ
          </Button>
          <Button size="sm" variant="outline" onClick={openCustomerDocument} disabled={busy}>
            <Printer className="mr-2 h-4 w-4" strokeWidth={1.5} /> Download / print BOQ
          </Button>
        </div>
        {readOnly && (
          <p className="mt-3 text-xs text-muted-foreground">
            This revision is {boq?.status} and read-only. Use Advanced costing to start a new revision.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          The customer document is built from a client-safe snapshot: supplier costs, markup, margin and internal notes
          are never included.
        </p>
      </Panel>

      {showPlanReview && boq && (
        <div className="mb-6 border border-border p-5">
          <h4 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Items from plans</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare mapped devices with this BOQ before applying changes. Manual lines are never overwritten and nothing
            syncs automatically.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={planConfirmed} onChange={(e) => setPlanConfirmed(e.target.checked)} />
            I have reviewed the comparison below and want to enable applying changes.
          </label>
          <div className={planConfirmed ? "mt-4" : "mt-4 pointer-events-none opacity-60"} aria-disabled={!planConfirmed}>
            <PlanBoqSyncPanel
              projectId={projectId}
              boqId={boq.id}
              boqStatus={boq.status}
              boqLabel={`${boq.title} · ${boq.revision_label}`}
              onSynced={refresh}
            />
          </div>
        </div>
      )}

      <Panel title="Search BOQ">
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQuery(query);
          }}
        >
          <div className="flex-1">
            <label htmlFor="boq-search" className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Search this BOQ
            </label>
            <Input
              id="boq-search"
              value={query}
              placeholder="Description, item code, specification, reference or category"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:pt-6">
            <Button type="submit" size="sm">
              <Search className="mr-2 h-4 w-4" strokeWidth={1.5} /> Search BOQ
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setQuery("");
                setAppliedQuery("");
              }}
            >
              <X className="mr-2 h-4 w-4" strokeWidth={1.5} /> Clear
            </Button>
          </div>
        </form>

        {appliedQuery.trim() && (
          <div className="mt-5">
            <p className="text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "item" : "items"} matching “{appliedQuery.trim()}” in this BOQ
            </p>
            {results.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No BOQ items found</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {results.map(({ item, category }) => (
                  <li key={item.id} className="border border-border p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{category}</p>
                    <p className="mt-1 text-sm">{item.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatQty(item.quantity)} {item.unit} × {formatZar(Number(item.customer_unit_rate))}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatZar(Number(item.line_total ?? lineTotal(item.quantity, item.customer_unit_rate)))}
                      </p>
                      <Button size="sm" disabled={readOnly} onClick={() => openPriceDialog(item)}>
                        Edit title &amp; price
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {readOnly && results.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                This revision is {boq?.status} and locked. Items can be searched but titles and prices cannot be
                changed — start a new revision under Advanced costing to update them.
              </p>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Items">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet. Use “Add item” to build the quote.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">Qty</th>
                    <th className="py-2 pr-3">Unit</th>
                    <th className="py-2 pr-3">Selling price</th>
                    <th className="py-2 pr-3">Line total</th>
                    <th className="py-2 pr-3">Included</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const editing = edit?.id === it.id;
                    return (
                      <tr key={it.id} className="border-b border-border/60 align-top">
                        <td className="py-2 pr-3 text-muted-foreground">{sectionTitle(it.section_id)}</td>
                        <td className="py-2 pr-3">{it.description}</td>
                        <td className="py-2 pr-3">
                          {editing ? (
                            <Input
                              aria-label="Quantity"
                              className="h-8 w-20"
                              value={edit!.quantity}
                              onChange={(e) => setEdit({ ...edit!, quantity: e.target.value })}
                            />
                          ) : (
                            formatQty(it.quantity)
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{it.unit}</td>
                        <td className="py-2 pr-3">
                          {editing ? (
                            <Input
                              aria-label="Selling price"
                              className="h-8 w-28"
                              value={edit!.rate}
                              onChange={(e) => setEdit({ ...edit!, rate: e.target.value })}
                            />
                          ) : (
                            formatZar(Number(it.customer_unit_rate))
                          )}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">
                          {formatZar(
                            editing
                              ? previewLineTotal(edit!.quantity, edit!.rate)
                              : Number(it.line_total ?? lineTotal(it.quantity, it.customer_unit_rate)),
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="checkbox"
                            aria-label={`Include ${it.description}`}
                            checked={it.is_included}
                            disabled={readOnly}
                            onChange={(e) => toggleIncluded(it, e.target.checked)}
                          />
                        </td>
                        <td className="py-2">
                          <div className="flex justify-end gap-1">
                            {editing ? (
                              <>
                                <Button size="sm" onClick={saveInline} disabled={busy}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEdit(null)}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={readOnly}
                                  onClick={() =>
                                    setEdit({
                                      id: it.id,
                                      quantity: String(Number(it.quantity)),
                                      rate: String(Number(it.customer_unit_rate)),
                                    })
                                  }
                                >
                                  Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => openPriceDialog(it)} disabled={readOnly}>
                                  Title &amp; price
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => openEditItem(it)} disabled={readOnly}>
                                  Details
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Delete ${it.description}`}
                                  disabled={readOnly}
                                  onClick={() => setDeleteId(it.id)}
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {items.map((it) => (
                <li key={it.id} className="border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{sectionTitle(it.section_id)}</p>
                  <p className="mt-1 text-sm">{it.description}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatQty(it.quantity)} {it.unit} × {formatZar(Number(it.customer_unit_rate))}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">
                    {formatZar(Number(it.line_total ?? lineTotal(it.quantity, it.customer_unit_rate)))}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={it.is_included}
                        disabled={readOnly}
                        onChange={(e) => toggleIncluded(it, e.target.checked)}
                      />
                      Included
                    </label>
                    <Button size="sm" variant="outline" onClick={() => openPriceDialog(it)} disabled={readOnly}>
                      Edit title &amp; price
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditItem(it)} disabled={readOnly}>
                      Details
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(it.id)} disabled={readOnly}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between border border-border px-5 py-4 text-left"
          >
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
              <Settings2 className="h-4 w-4" strokeWidth={1.5} /> Advanced costing
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} strokeWidth={1.5} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mb-4 text-xs text-muted-foreground">
            Supplier costs, markup and margin, bulk markup, item codes, references and notes, category creation and
            ordering, design ↔ BOQ sync administration, revision status, copies and validity — internal use only.
          </p>
          <BoqManager projectId={projectId} onPrintCustomerBoq={() => void openCustomerDocument()} />
        </CollapsibleContent>
      </Collapsible>

      {/* Quick add / edit */}
      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit item" : "Add item"}</DialogTitle>
            <DialogDescription>Only the essentials — everything else stays under Advanced costing.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-cat">Category</Label>
                <select
                  id="q-cat"
                  className={selectCls}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {(sections.length ? sections.map((s) => s.title) : [DEFAULT_CATEGORY]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="__new">+ New category…</option>
                </select>
                {form.category === "__new" && (
                  <Input
                    aria-label="New category name"
                    placeholder="New category name"
                    value={form.newCategory}
                    onChange={(e) => setForm({ ...form, newCategory: e.target.value })}
                  />
                )}
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q-desc">Description</Label>
                <Input id="q-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="q-qty">Quantity</Label>
                  <Input id="q-qty" type="number" min={0} step="0.001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-unit">Unit</Label>
                  <select id="q-unit" className={selectCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {BOQ_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-rate">Selling price</Label>
                  <Input id="q-rate" type="number" min={0} step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
                  {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.vat_applicable} onChange={(e) => setForm({ ...form, vat_applicable: e.target.checked })} />
                VAT applicable
              </label>

              <details>
                <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-muted-foreground">More details</summary>
                <div className="mt-2 space-y-1.5">
                  <Label htmlFor="q-spec">Short specification</Label>
                  <Textarea id="q-spec" rows={3} value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} />
                </div>
              </details>

              <p className="border-t border-border pt-3 text-sm">
                Line total <span className="font-semibold tabular-nums">{formatZar(previewLineTotal(form.quantity, form.selling_price))}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {form?.id ? "Save item" : "Add item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit title & price */}
      <Dialog open={!!priceTarget} onOpenChange={(v) => !v && setPriceTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit title &amp; price</DialogTitle>
            <DialogDescription>Only the item title and selling price of this one item change.</DialogDescription>
          </DialogHeader>
          {priceTarget && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Item title</Label>
                <Input id="edit-title" value={titleValue} onChange={(e) => setTitleValue(e.target.value)} />
                {editErrors.description && <p className="text-xs text-destructive">{editErrors.description}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-price">Selling price</Label>
                <Input
                  id="new-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                />
                {editErrors.selling_price && <p className="text-xs text-destructive">{editErrors.selling_price}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Quantity {formatQty(priceTarget.quantity)} · Unit {priceTarget.unit} (unchanged)
              </p>
              <p className="border-t border-border pt-3 text-sm">
                Revised line total{" "}
                <span className="font-semibold tabular-nums">{formatZar(previewLineTotal(priceTarget.quantity, priceValue))}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPriceTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveItemEdit} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              The line is deleted from this BOQ revision. Totals update immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove item</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrintSurface open={!!snapshot} title="Customer bill of quantities" onClose={() => setSnapshot(null)}>
        {snapshot && <BoqPrintView snapshot={snapshot} />}
      </PrintSurface>
    </div>
  );
};

export default QuickBoqTab;
