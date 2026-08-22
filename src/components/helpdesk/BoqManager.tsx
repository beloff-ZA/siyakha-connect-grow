import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Lock, Printer, RefreshCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/portalFiles";
import {
  BOQ_UNITS,
  computeTotals,
  formatQty,
  formatZar,
  lineTotal,
  marginPercent,
  type Boq,
  type BoqItem,
  type BoqSection,
} from "@/lib/boq";

type Row = Record<string, any>;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border border-border p-5 md:p-6 mb-6">
    <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-4">{title}</h3>
    {children}
  </section>
);

const selectCls = "h-10 border border-input bg-background px-3 text-sm w-full";

const BoqManager: React.FC<{ projectId: string; onPrintCustomerBoq?: (boqId: string) => void }> = ({
  projectId,
  onPrintCustomerBoq,
}) => {
  const { toast } = useToast();
  const [boqs, setBoqs] = useState<Boq[]>([]);
  const [boqId, setBoqId] = useState("");
  const [sections, setSections] = useState<BoqSection[]>([]);
  const [items, setItems] = useState<BoqItem[]>([]);
  const [costs, setCosts] = useState<Row[]>([]);
  const [comments, setComments] = useState<Row[]>([]);
  const [decisions, setDecisions] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : (e as any)?.message ?? String(e),
      variant: "destructive" as never,
    });

  const logActivity = async (action: string, detail?: string, id = boqId) => {
    const { data } = await supabase.auth.getUser();
    await supabase.from("portal_boq_activity").insert({
      boq_id: id,
      actor_user_id: data.user?.id ?? null,
      actor_type: "admin",
      action,
      detail: detail ?? null,
    });
  };

  const loadBoqs = useCallback(async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from("portal_boqs")
      .select("*")
      .eq("project_id", projectId)
      .order("version_no", { ascending: false });
    if (error) return fail(error);
    const list = (data ?? []) as unknown as Boq[];
    setBoqs(list);
    setBoqId((prev) => (prev && list.some((b) => b.id === prev) ? prev : (list[0]?.id ?? "")));
  }, [projectId]);

  const loadDetail = useCallback(async () => {
    if (!boqId) {
      setSections([]);
      setItems([]);
      setCosts([]);
      setComments([]);
      setDecisions([]);
      return;
    }
    const [s, i, cs, cm, d] = await Promise.all([
      supabase.from("portal_boq_sections").select("*").eq("boq_id", boqId).order("sort_order"),
      supabase.from("portal_boq_items").select("*").eq("boq_id", boqId).order("sort_order"),
      supabase.from("portal_boq_item_costs").select("*"),
      supabase.from("portal_boq_comments").select("*").eq("boq_id", boqId).order("created_at", { ascending: false }),
      supabase.from("portal_boq_decisions").select("*").eq("boq_id", boqId).order("created_at", { ascending: false }),
    ]);
    setSections((s.data ?? []) as unknown as BoqSection[]);
    setItems((i.data ?? []) as unknown as BoqItem[]);
    setCosts(cs.data ?? []);
    setComments(cm.data ?? []);
    setDecisions(d.data ?? []);
  }, [boqId]);

  useEffect(() => {
    loadBoqs();
  }, [loadBoqs]);
  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const boq = boqs.find((b) => b.id === boqId) ?? null;
  const locked = boq?.status === "approved" || boq?.status === "superseded";
  const totals = useMemo(
    () => computeTotals(items, { vat_enabled: boq?.vat_enabled ?? true, vat_rate: Number(boq?.vat_rate ?? 15) }),
    [items, boq],
  );
  const internalTotals = useMemo(() => {
    let cost = 0;
    for (const it of items) {
      const c = costs.find((x) => x.item_id === it.id);
      cost += Number(c?.supplier_unit_cost ?? 0) * Number(it.quantity);
    }
    const revenue = totals.subtotal;
    return { cost, gross: revenue - cost, margin: revenue ? ((revenue - cost) / revenue) * 100 : 0 };
  }, [items, costs, totals.subtotal]);

  /* ---- Live quantity sync from the floor-plan design ---- */
  const [syncSummary, setSyncSummary] = useState<string[]>([]);

  /**
   * Recalculates the planning quantities that are derived from placed markers and
   * generated cable routes. Only quantity fields listed here are touched — rates,
   * inclusion flags, specifications, notes and private costs are never changed.
   */
  const syncPlanningQuantities = async () => {
    if (!boqId || !projectId) return;
    if (
      !window.confirm(
        "Recalculate the planning quantities on this BOQ from the current floor plans?\n\nOnly device, cabling and testing quantities are updated. Rates, inclusions, specifications and private costs stay exactly as they are.",
      )
    )
      return;

    setBusy(true);
    try {
      const [{ data: floors, error: fErr }, { data: markers, error: mErr }, { data: routes, error: rErr }] =
        await Promise.all([
          supabase.from("portal_floors").select("id, level_number").eq("project_id", projectId),
          supabase.from("portal_floor_markers").select("floor_id, marker_type").eq("project_id", projectId),
          supabase.from("portal_cable_routes").select("floor_id").eq("project_id", projectId),
        ]);
      if (fErr || mErr || rErr) throw fErr ?? mErr ?? rErr;

      const levelOf = new Map((floors ?? []).map((f: Row) => [f.id as string, Number(f.level_number)]));
      const isTop = (floorId: string) => levelOf.get(floorId) === 11;

      const cameras = (markers ?? []).filter((m: Row) => m.marker_type === "camera");
      const aps = (markers ?? []).filter((m: Row) => m.marker_type === "wifi_ap");
      const totalCameras = cameras.length;
      const topCameras = cameras.filter((m: Row) => isTop(m.floor_id)).length;
      const topAps = aps.filter((m: Row) => isTop(m.floor_id)).length;
      const eligibleRoutes = (routes ?? []).filter((r: Row) => {
        const level = levelOf.get(r.floor_id as string);
        return level !== undefined && level >= 0 && level <= 10;
      }).length;
      const basePoints = 100 + totalCameras;

      const targets: Record<string, number> = {
        "WIFI-002": topAps,
        "WIFI-004": topAps,
        "CCTV-001": totalCameras,
        "CCTV-002": totalCameras,
        "CCTV-007": totalCameras,
        "TEST-004": totalCameras,
        "CAB-003": topCameras,
        "CCTV-003": topCameras,
        "CAB-002": eligibleRoutes,
        "CAB-006": basePoints,
        "CAB-007": basePoints,
        "TEST-001": basePoints,
        "TEST-002": basePoints,
      };

      const changed: string[] = [];
      for (const item of items) {
        const code = item.item_code;
        if (!code || !(code in targets)) continue;
        const next = targets[code];
        const prev = Number(item.quantity);
        if (prev === next) continue;
        const { error } = await supabase.from("portal_boq_items").update({ quantity: next }).eq("id", item.id);
        if (error) throw error;
        changed.push(`${code} — ${formatQty(prev)} → ${formatQty(next)} ${item.unit}`);
      }

      await logActivity(
        "planning_quantities_synced",
        [
          `Synced ${changed.length} line(s) at ${new Date().toISOString()}.`,
          `Live design: ${aps.length} APs (Level 11: ${topAps}), ${totalCameras} cameras (Level 11: ${topCameras}), ${eligibleRoutes} cable routes on Levels 0–10.`,
          changed.length ? `Changes: ${changed.join("; ")}` : "No quantity changes required.",
        ].join(" "),
      );

      setSyncSummary(changed.length ? changed : ["All derived quantities already matched the live design."]);
      await loadDetail();
      toast({
        title: changed.length ? `${changed.length} quantities updated` : "Quantities already in sync",
        description: `${totalCameras} cameras · ${topAps} rooftop AP(s) · ${eligibleRoutes} routes · base AP quantity preserved at 100.`,
      });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /* ---- BOQ level ---- */

  const [newBoq, setNewBoq] = useState({ title: "", revision_label: "Draft v1" });
  const createBoq = async () => {
    if (!projectId || !newBoq.title.trim()) return;
    setBusy(true);
    const nextVersion = (boqs[0]?.version_no ?? 0) + 1;
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("portal_boqs")
      .insert({
        project_id: projectId,
        title: newBoq.title.trim(),
        revision_label: newBoq.revision_label.trim() || `Draft v${nextVersion}`,
        version_no: nextVersion,
        created_by: u.user?.id ?? null,
      })
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error) return fail(error);
    setNewBoq({ title: "", revision_label: "Draft v1" });
    if (data?.id) await logActivity("boq_created", newBoq.title.trim(), data.id);
    toast({ title: "BOQ created" });
    loadBoqs();
  };

  const saveBoqMeta = async (patch: Partial<Boq>) => {
    if (!boq) return;
    setBusy(true);
    const { error } = await supabase.from("portal_boqs").update(patch as Row).eq("id", boq.id);
    setBusy(false);
    if (error) return fail(error);
    await logActivity("boq_updated", Object.keys(patch).join(", "));
    loadBoqs();
  };

  const setStatus = async (status: Boq["status"]) => {
    if (!boq) return;
    const { data: u } = await supabase.auth.getUser();
    const patch: Row = { status };
    if (status === "shared") {
      patch.published_at = new Date().toISOString();
      patch.published_by = u.user?.id ?? null;
    }
    if (status === "approved") {
      patch.approved_at = new Date().toISOString();
      patch.approved_by = u.user?.id ?? null;
    }
    setBusy(true);
    const { error } = await supabase.from("portal_boqs").update(patch).eq("id", boq.id);
    setBusy(false);
    if (error) return fail(error);
    await logActivity(`boq_${status}`);
    toast({ title: `BOQ marked ${status}` });
    loadBoqs();
  };

  const duplicateBoq = async () => {
    if (!boq) return;
    setBusy(true);
    try {
      const nextVersion = (boqs[0]?.version_no ?? 0) + 1;
      const { data: u } = await supabase.auth.getUser();
      const { data: newRow, error: bErr } = await supabase
        .from("portal_boqs")
        .insert({
          project_id: boq.project_id,
          title: boq.title,
          revision_label: `Rev v${nextVersion}`,
          version_no: nextVersion,
          status: "draft",
          currency: boq.currency,
          vat_enabled: boq.vat_enabled,
          vat_rate: boq.vat_rate,
          notes: boq.notes,
          created_by: u.user?.id ?? null,
        })
        .select("id")
        .maybeSingle();
      if (bErr || !newRow) throw bErr ?? new Error("Could not create revision");

      const sectionMap = new Map<string, string>();
      for (const s of sections) {
        const { data: ns, error: sErr } = await supabase
          .from("portal_boq_sections")
          .insert({ boq_id: newRow.id, title: s.title, description: s.description, sort_order: s.sort_order })
          .select("id")
          .maybeSingle();
        if (sErr || !ns) throw sErr ?? new Error("Could not copy section");
        sectionMap.set(s.id, ns.id);
      }
      for (const it of items) {
        const { data: ni, error: iErr } = await supabase
          .from("portal_boq_items")
          .insert({
            boq_id: newRow.id,
            section_id: sectionMap.get(it.section_id)!,
            item_code: it.item_code,
            description: it.description,
            specification: it.specification,
            quantity: it.quantity,
            unit: it.unit,
            customer_unit_rate: it.customer_unit_rate,
            vat_applicable: it.vat_applicable,
            is_included: it.is_included,
            notes: it.notes,
            reference: it.reference,
            sort_order: it.sort_order,
          })
          .select("id")
          .maybeSingle();
        if (iErr || !ni) throw iErr ?? new Error("Could not copy line");
        const c = costs.find((x) => x.item_id === it.id);
        if (c) {
          await supabase.from("portal_boq_item_costs").insert({
            item_id: ni.id,
            supplier: c.supplier,
            supplier_unit_cost: c.supplier_unit_cost,
            markup_percent: c.markup_percent,
            internal_notes: c.internal_notes,
          });
        }
      }
      await supabase.from("portal_boqs").update({ status: "superseded", superseded_by: newRow.id }).eq("id", boq.id);
      await logActivity("boq_revised", `Superseded by revision v${nextVersion}`);
      toast({ title: "New revision created" });
      setBoqId(newRow.id);
      loadBoqs();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /* ---- Sections ---- */
  const [newSection, setNewSection] = useState("");
  const addSection = async () => {
    if (!boqId || !newSection.trim()) return;
    const { error } = await supabase
      .from("portal_boq_sections")
      .insert({ boq_id: boqId, title: newSection.trim(), sort_order: sections.length + 1 });
    if (error) return fail(error);
    setNewSection("");
    await logActivity("section_added", newSection.trim());
    loadDetail();
  };
  const moveSection = async (id: string, dir: -1 | 1) => {
    const idx = sections.findIndex((s) => s.id === id);
    const swap = sections[idx + dir];
    if (!swap) return;
    await supabase.from("portal_boq_sections").update({ sort_order: swap.sort_order }).eq("id", id);
    await supabase.from("portal_boq_sections").update({ sort_order: sections[idx].sort_order }).eq("id", swap.id);
    loadDetail();
  };
  const deleteSection = async (id: string) => {
    const { error } = await supabase.from("portal_boq_sections").delete().eq("id", id);
    if (error) return fail(error);
    await logActivity("section_deleted");
    loadDetail();
  };

  /* ---- Items ---- */
  const addItem = async (sectionId: string) => {
    const count = items.filter((i) => i.section_id === sectionId).length;
    const { error } = await supabase.from("portal_boq_items").insert({
      boq_id: boqId,
      section_id: sectionId,
      description: "New line item",
      sort_order: count + 1,
    });
    if (error) return fail(error);
    await logActivity("line_added");
    loadDetail();
  };

  const saveItem = async (item: BoqItem, patch: Partial<BoqItem>) => {
    const { error } = await supabase.from("portal_boq_items").update(patch as Row).eq("id", item.id);
    if (error) return fail(error);
    await logActivity("line_updated", item.description);
    loadDetail();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("portal_boq_items").delete().eq("id", id);
    if (error) return fail(error);
    await logActivity("line_deleted");
    loadDetail();
  };

  const saveCost = async (itemId: string, patch: Row) => {
    const existing = costs.find((c) => c.item_id === itemId);
    const { error } = existing
      ? await supabase.from("portal_boq_item_costs").update(patch).eq("item_id", itemId)
      : await supabase.from("portal_boq_item_costs").insert({ item_id: itemId, ...patch });
    if (error) return fail(error);
    toast({ title: "Private costing saved" });
    loadDetail();
  };

  /** Customer rate = supplier cost x (1 + markup%). The rate stays manually editable afterwards. */
  const applyMarkupToItem = async (item: BoqItem, silent = false) => {
    const cost = costs.find((c) => c.item_id === item.id);
    const supplierCost = Number(cost?.supplier_unit_cost ?? 0);
    const markup = Number(cost?.markup_percent ?? 0);
    if (!supplierCost) {
      if (!silent) toast({ title: "Capture a supplier unit cost first", variant: "destructive" as never });
      return false;
    }
    const rate = Math.round(supplierCost * (1 + markup / 100) * 100) / 100;
    const { error } = await supabase.from("portal_boq_items").update({ customer_unit_rate: rate }).eq("id", item.id);
    if (error) {
      fail(error);
      return false;
    }
    if (!silent) {
      await logActivity("markup_applied", `${item.description} → ${formatZar(rate)} (${markup}% markup)`);
      toast({ title: `Rate set to ${formatZar(rate)}` });
      loadDetail();
    }
    return true;
  };

  const [bulkMarkup, setBulkMarkup] = useState("");
  const applyMarkupToBoq = async () => {
    const pct = Number(bulkMarkup);
    if (!Number.isFinite(pct) || pct < 0) return toast({ title: "Enter a valid markup %", variant: "destructive" as never });
    setBusy(true);
    try {
      let changed = 0;
      for (const it of items) {
        const cost = costs.find((c) => c.item_id === it.id);
        const supplierCost = Number(cost?.supplier_unit_cost ?? 0);
        if (!supplierCost) continue;
        await saveCostQuiet(it.id, { markup_percent: pct });
        const rate = Math.round(supplierCost * (1 + pct / 100) * 100) / 100;
        const { error } = await supabase.from("portal_boq_items").update({ customer_unit_rate: rate }).eq("id", it.id);
        if (error) throw error;
        changed += 1;
      }
      await logActivity("markup_applied_bulk", `${pct}% markup applied to ${changed} line(s)`);
      toast({ title: `Markup applied to ${changed} line(s)` });
      loadDetail();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const saveCostQuiet = async (itemId: string, patch: Row) => {
    const existing = costs.find((c) => c.item_id === itemId);
    const { error } = existing
      ? await supabase.from("portal_boq_item_costs").update(patch).eq("item_id", itemId)
      : await supabase.from("portal_boq_item_costs").insert({ item_id: itemId, ...patch });
    if (error) throw error;
  };

  const respondToComment = async (id: string, response: string) => {
    const { error } = await supabase
      .from("portal_boq_comments")
      .update({ admin_response: response, responded_at: new Date().toISOString(), status: "answered" })
      .eq("id", id);
    if (error) return fail(error);
    await logActivity("comment_answered");
    loadDetail();
  };

  if (!projectId) return <p className="text-sm text-muted-foreground">Select a project above.</p>;

  return (
    <div>
      <Section title="Bills of quantities">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="boq-pick">Revision</Label>
            <select id="boq-pick" className={selectCls} value={boqId} onChange={(e) => setBoqId(e.target.value)}>
              <option value="">None</option>
              {boqs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.revision_label} — {b.status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="boq-title">New BOQ title</Label>
            <Input id="boq-title" value={newBoq.title} onChange={(e) => setNewBoq({ ...newBoq, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="boq-rev">Revision label</Label>
            <div className="flex gap-2">
              <Input
                id="boq-rev"
                value={newBoq.revision_label}
                onChange={(e) => setNewBoq({ ...newBoq, revision_label: e.target.value })}
              />
              <Button onClick={createBoq} disabled={busy || !newBoq.title.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {boq && (
        <>
          <Section title="Revision settings & totals">
            {locked && (
              <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                This revision is {boq.status} and locked. Create a new revision to make changes.
              </p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="m-title">Title</Label>
                <Input
                  id="m-title"
                  defaultValue={boq.title}
                  onBlur={(e) => e.target.value !== boq.title && saveBoqMeta({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-rev">Revision label</Label>
                <Input
                  id="m-rev"
                  defaultValue={boq.revision_label}
                  onBlur={(e) => e.target.value !== boq.revision_label && saveBoqMeta({ revision_label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-vat">VAT rate %</Label>
                <Input
                  id="m-vat"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={Number(boq.vat_rate)}
                  onBlur={(e) => saveBoqMeta({ vat_rate: Number(e.target.value) } as Partial<Boq>)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-valid">Valid until</Label>
                <Input
                  id="m-valid"
                  type="date"
                  defaultValue={boq.valid_until ?? ""}
                  onBlur={(e) => saveBoqMeta({ valid_until: e.target.value || null } as Partial<Boq>)}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="m-notes">Customer notes</Label>
              <Textarea
                id="m-notes"
                rows={2}
                defaultValue={boq.notes ?? ""}
                onBlur={(e) => saveBoqMeta({ notes: e.target.value || null } as Partial<Boq>)}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={boq.vat_enabled}
                  onChange={(e) => saveBoqMeta({ vat_enabled: e.target.checked } as Partial<Boq>)}
                />
                VAT enabled
              </label>
              <Button size="sm" variant="outline" onClick={() => setStatus("shared")} disabled={busy || locked}>
                Share with client
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("approved")} disabled={busy || locked}>
                Mark approved
              </Button>
              <Button size="sm" variant="outline" onClick={duplicateBoq} disabled={busy}>
                Duplicate as new revision
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" strokeWidth={1.5} /> Print customer BOQ
              </Button>
              <Button size="sm" variant="outline" onClick={syncPlanningQuantities} disabled={busy || locked}>
                <RefreshCcw className="h-4 w-4 mr-2" strokeWidth={1.5} /> Sync planning quantities from floor plans
              </Button>
            </div>

            {syncSummary.length > 0 && (
              <div className="mt-4 border border-border p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Last quantity sync — changed lines
                </p>
                <ul className="mt-2 space-y-1">
                  {syncSummary.map((line) => (
                    <li key={line} className="text-sm">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}


            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-5">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Subtotal</dt>
                <dd className="text-sm">{formatZar(totals.subtotal)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">VAT</dt>
                <dd className="text-sm">{formatZar(totals.vat)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Total</dt>
                <dd className="text-sm">{formatZar(totals.total)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Lines</dt>
                <dd className="text-sm">{items.length}</dd>
              </div>
            </dl>
          </Section>

          <Section title="Private costing — internal only (never visible to clients)">
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Supplier cost</dt>
                <dd className="text-sm">{formatZar(internalTotals.cost)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Gross profit</dt>
                <dd className="text-sm">{formatZar(internalTotals.gross)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Margin</dt>
                <dd className="text-sm">{internalTotals.margin.toFixed(2)}%</dd>
              </div>
            </dl>
          </Section>

          <Section title="Sections & lines">
            <div className="flex gap-2">
              <Input placeholder="New section title" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
              <Button onClick={addSection} disabled={locked || !newSection.trim()}>
                Add section
              </Button>
            </div>

            {sections.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No sections yet.</p>
            ) : (
              <div className="mt-6 space-y-8">
                {sections.map((s, idx) => (
                  <div key={s.id} className="border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <Input
                        aria-label="Section title"
                        defaultValue={s.title}
                        className="max-w-sm"
                        onBlur={async (e) => {
                          if (e.target.value === s.title) return;
                          await supabase.from("portal_boq_sections").update({ title: e.target.value }).eq("id", s.id);
                          loadDetail();
                        }}
                      />
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" aria-label="Move section up" onClick={() => moveSection(s.id, -1)} disabled={idx === 0 || locked}>
                          <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Move section down" onClick={() => moveSection(s.id, 1)} disabled={idx === sections.length - 1 || locked}>
                          <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addItem(s.id)} disabled={locked}>
                          Add line
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Delete section" onClick={() => deleteSection(s.id)} disabled={locked}>
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {items
                        .filter((i) => i.section_id === s.id)
                        .map((it) => {
                          const cost = costs.find((c) => c.item_id === it.id) ?? {};
                          return (
                            <div key={it.id} className="border border-border/70 p-3">
                              <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
                                <Input
                                  aria-label="Item code"
                                  placeholder="Code"
                                  defaultValue={it.item_code ?? ""}
                                  onBlur={(e) => e.target.value !== (it.item_code ?? "") && saveItem(it, { item_code: e.target.value || null })}
                                />
                                <Input
                                  aria-label="Description"
                                  className="lg:col-span-2"
                                  defaultValue={it.description}
                                  onBlur={(e) => e.target.value !== it.description && saveItem(it, { description: e.target.value })}
                                />
                                <Input
                                  aria-label="Quantity"
                                  type="number"
                                  min={0}
                                  step="0.001"
                                  defaultValue={Number(it.quantity)}
                                  onBlur={(e) => saveItem(it, { quantity: Math.max(0, Number(e.target.value)) })}
                                />
                                <select
                                  aria-label="Unit"
                                  className={selectCls}
                                  defaultValue={it.unit}
                                  onChange={(e) => saveItem(it, { unit: e.target.value })}
                                >
                                  {BOQ_UNITS.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                                <Input
                                  aria-label="Customer unit rate"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  defaultValue={Number(it.customer_unit_rate)}
                                  onBlur={(e) => saveItem(it, { customer_unit_rate: Math.max(0, Number(e.target.value)) })}
                                />
                              </div>

                              <Textarea
                                aria-label="Specification"
                                placeholder="Specification / scope detail"
                                rows={2}
                                className="mt-3"
                                defaultValue={it.specification ?? ""}
                                onBlur={(e) => e.target.value !== (it.specification ?? "") && saveItem(it, { specification: e.target.value || null })}
                              />

                              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                                <span className="text-muted-foreground">
                                  Line total {formatZar(lineTotal(Number(it.quantity), Number(it.customer_unit_rate)))} ·{" "}
                                  {formatQty(it.quantity)} {it.unit}
                                </span>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={it.vat_applicable}
                                    onChange={(e) => saveItem(it, { vat_applicable: e.target.checked })}
                                  />
                                  VAT
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={it.is_included}
                                    onChange={(e) => saveItem(it, { is_included: e.target.checked })}
                                  />
                                  Included
                                </label>
                                <Button size="sm" variant="ghost" onClick={() => deleteItem(it.id)} disabled={locked}>
                                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                </Button>
                              </div>

                              <div className="mt-3 border-t border-dashed border-border pt-3">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                                  Private costing — internal only
                                </p>
                                <div className="grid sm:grid-cols-4 gap-3">
                                  <Input
                                    aria-label="Supplier"
                                    placeholder="Supplier"
                                    defaultValue={cost.supplier ?? ""}
                                    onBlur={(e) => saveCost(it.id, { supplier: e.target.value || null })}
                                  />
                                  <Input
                                    aria-label="Supplier unit cost"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Supplier unit cost"
                                    defaultValue={Number(cost.supplier_unit_cost ?? 0)}
                                    onBlur={(e) => saveCost(it.id, { supplier_unit_cost: Math.max(0, Number(e.target.value)) })}
                                  />
                                  <Input
                                    aria-label="Markup percent"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Markup %"
                                    defaultValue={Number(cost.markup_percent ?? 0)}
                                    onBlur={(e) => saveCost(it.id, { markup_percent: Math.max(0, Number(e.target.value)) })}
                                  />
                                  <p className="text-xs text-muted-foreground self-center">
                                    Margin{" "}
                                    {marginPercent(Number(it.customer_unit_rate), Number(cost.supplier_unit_cost ?? 0)).toFixed(2)}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Client queries">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No client queries on this revision.</p>
            ) : (
              <ul className="divide-y divide-border">
                {comments.map((c) => (
                  <li key={c.id} className="py-3">
                    <p className="text-xs text-muted-foreground">
                      {c.author_name ?? "Client"} · {formatDate(c.created_at)} · {c.status}
                    </p>
                    <p className="text-sm">{c.body}</p>
                    {c.admin_response ? (
                      <p className="mt-1 text-sm text-muted-foreground">Response: {c.admin_response}</p>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <Input
                          aria-label="Response"
                          placeholder="Respond…"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              respondToComment(c.id, e.currentTarget.value.trim());
                            }
                          }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Client decisions">
            {decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decisions recorded.</p>
            ) : (
              <ul className="divide-y divide-border">
                {decisions.map((d) => (
                  <li key={d.id} className="py-3">
                    <p className="text-sm">
                      {d.decision === "accepted" ? "Accepted" : "Changes requested"} by {d.decided_by_name ?? "client"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
                    {d.message && <p className="text-sm text-muted-foreground">{d.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default BoqManager;
