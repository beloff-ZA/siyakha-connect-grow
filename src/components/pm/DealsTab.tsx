import React, { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Panel, Stat, Field, Chip, selectCls } from "./ui";
import { formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import {
  DEAL_SOURCES,
  DEAL_STAGES,
  LEGACY_STAGE_LABELS,
  defaultProbability,
  isOpenDeal,
  isOverdue,
  stageLabel,
  weightedValue,
  type Deal,
} from "@/lib/deals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { Pencil, Plus, ArrowRightLeft } from "lucide-react";

const db = supabase as unknown as { from: (t: string) => any };

const emptyForm = {
  title: "",
  client: "",
  site_name: "",
  status: "new_lead",
  priority: "medium",
  estimated_value: "",
  probability_percent: "",
  deal_source: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  assigned_to: "",
  next_action: "",
  next_action_date: "",
  start_date: "",
  due_date: "",
  description: "",
  notes: "",
  lost_reason: "",
};

const DealsTab: React.FC<{ ws: PmWorkspace; openProject: (projectId: string, tab: string) => void }> = ({ ws, openProject }) => {
  const { toast } = useToast();
  const { deals, clients, sites, projects, reload } = ws;
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("open");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [busy, setBusy] = useState(false);

  const [convert, setConvert] = useState<Deal | null>(null);
  const [convClient, setConvClient] = useState("");
  const [convNewClient, setConvNewClient] = useState("");
  const [convSite, setConvSite] = useState("");
  const [convNewSite, setConvNewSite] = useState("");
  const [convProjectTitle, setConvProjectTitle] = useState("");

  const fail = (e: unknown) =>
    toast({ title: "Action failed", description: e instanceof Error ? e.message : String((e as any)?.message ?? e), variant: "destructive" as never });

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({
      title: d.title ?? "",
      client: d.client ?? "",
      site_name: d.site_name ?? "",
      status: d.status ?? "new_lead",
      priority: d.priority ?? "medium",
      estimated_value: String(d.estimated_value ?? ""),
      probability_percent: d.probability_percent == null ? "" : String(d.probability_percent),
      deal_source: d.deal_source ?? "",
      contact_name: d.contact_name ?? "",
      contact_email: d.contact_email ?? "",
      contact_phone: d.contact_phone ?? "",
      assigned_to: d.assigned_to ?? "",
      next_action: d.next_action ?? "",
      next_action_date: d.next_action_date ?? "",
      start_date: d.start_date ?? "",
      due_date: d.due_date ?? "",
      description: d.description ?? "",
      notes: d.notes ?? "",
      lost_reason: d.lost_reason ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "A deal title is required", variant: "destructive" as never });
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        client: form.client.trim() || null,
        site_name: form.site_name.trim() || null,
        status: form.status,
        priority: form.priority,
        estimated_value: Number(form.estimated_value) || 0,
        probability_percent:
          form.probability_percent === "" ? defaultProbability(form.status) : Math.max(0, Math.min(100, Number(form.probability_percent))),
        deal_source: form.deal_source || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        assigned_to: form.assigned_to.trim() || null,
        next_action: form.next_action.trim() || null,
        next_action_date: form.next_action_date || null,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        lost_reason: form.status === "lost" ? form.lost_reason.trim() || null : null,
      };
      if (form.status === "won" && !editing?.won_at) payload.won_at = new Date().toISOString();

      if (editing) {
        const { error } = await db.from("director_projects").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("director_projects").insert({ ...payload, user_id: u.user?.id ?? null });
        if (error) throw error;
      }
      toast({ title: editing ? "Deal updated" : "Deal created" });
      setDialogOpen(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const startConvert = (d: Deal) => {
    setConvert(d);
    const existingClient = clients.find((c) => c.display_name.toLowerCase() === (d.client ?? "").trim().toLowerCase());
    setConvClient(d.portal_client_id ?? existingClient?.id ?? "");
    setConvNewClient(existingClient ? "" : (d.client ?? ""));
    setConvSite("");
    setConvNewSite(d.site_name ?? "");
    setConvProjectTitle(d.title);
  };

  const runConvert = async () => {
    if (!convert) return;
    setBusy(true);
    try {
      let clientId = convClient;
      if (!clientId) {
        const name = convNewClient.trim();
        if (!name) throw new Error("Select an existing client or enter a new client name");
        const dup = clients.find((c) => c.display_name.toLowerCase() === name.toLowerCase());
        if (dup) {
          clientId = dup.id;
        } else {
          const { data, error } = await db
            .from("portal_clients")
            .insert({
              display_name: name,
              contact_name: convert.contact_name,
              contact_email: convert.contact_email,
              phone: convert.contact_phone,
              status: "active",
            })
            .select("id")
            .maybeSingle();
          if (error) throw error;
          clientId = data.id;
        }
      }

      let siteId: string | null = convSite || null;
      if (!siteId && convNewSite.trim()) {
        const name = convNewSite.trim();
        const dup = sites.find((s) => s.client_id === clientId && s.name.toLowerCase() === name.toLowerCase());
        if (dup) {
          siteId = dup.id;
        } else {
          const { data, error } = await db
            .from("portal_sites")
            .insert({
              client_id: clientId,
              name,
              contact_name: convert.contact_name,
              contact_email: convert.contact_email,
              contact_phone: convert.contact_phone,
              status: "planning",
            })
            .select("id")
            .maybeSingle();
          if (error) throw error;
          siteId = data.id;
        }
      }

      let projectId = convert.portal_project_id;
      if (projectId && projects.some((p) => p.id === projectId)) {
        toast({ title: "Deal already linked", description: "Existing project reused — no duplicate created." });
      } else {
        const title = convProjectTitle.trim() || convert.title;
        const dupProject = projects.find(
          (p) => p.client_id === clientId && p.title.trim().toLowerCase() === title.toLowerCase(),
        );
        if (dupProject) {
          projectId = dupProject.id;
          toast({ title: "Matching project found", description: "Linked to the existing project instead of creating a duplicate." });
        } else {
          const { data, error } = await db
            .from("portal_projects")
            .insert({
              client_id: clientId,
              site_id: siteId,
              title,
              status: "planning",
              description: convert.description,
              start_date: convert.start_date,
              target_date: convert.due_date,
            })
            .select("id")
            .maybeSingle();
          if (error) throw error;
          projectId = data.id;
        }
      }

      const { error: uErr } = await db
        .from("director_projects")
        .update({
          portal_client_id: clientId,
          portal_project_id: projectId,
          status: "won",
          probability_percent: 100,
          won_at: convert.won_at ?? new Date().toISOString(),
        })
        .eq("id", convert.id);
      if (uErr) throw uErr;

      toast({ title: "Deal converted", description: "Portal project linked and the deal marked won." });
      setConvert(null);
      await reload();
      if (projectId) openProject(projectId, "projects");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((d) => {
      if (stageFilter === "open" && !isOpenDeal(d)) return false;
      if (stageFilter === "overdue" && !isOverdue(d)) return false;
      if (!["all", "open", "overdue"].includes(stageFilter) && d.status !== stageFilter) return false;
      if (!q) return true;
      return [d.title, d.client, d.site_name, d.contact_name, d.contact_email, d.assigned_to, d.deal_source]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [deals, search, stageFilter]);

  const openDeals = deals.filter(isOpenDeal);
  const stageOptions = [...DEAL_STAGES.map((s) => s.value), ...Object.keys(LEGACY_STAGE_LABELS)];

  return (
    <div>
      <Panel
        title="Deal pipeline"
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New deal
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Open deals" value={openDeals.length} />
          <Stat label="Pipeline value" value={formatZar(openDeals.reduce((s, d) => s + (Number(d.estimated_value) || 0), 0))} />
          <Stat label="Weighted value" value={formatZar(openDeals.reduce((s, d) => s + weightedValue(d), 0))} />
          <Stat label="Overdue actions" value={deals.filter(isOverdue).length} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search deals, clients, contacts…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={selectCls} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} aria-label="Stage filter">
            <option value="open">Open deals</option>
            <option value="all">All deals</option>
            <option value="overdue">Overdue next action</option>
            {stageOptions.map((s) => (
              <option key={s} value={s}>
                {stageLabel(s)}
              </option>
            ))}
          </select>
          <p className="self-center text-xs text-muted-foreground">{filtered.length} deal(s) shown</p>
        </div>
      </Panel>

      <Panel title="Deals">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals match the current filters.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((d) => (
              <li key={d.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{d.title}</p>
                      <Chip className="border-foreground text-foreground">{stageLabel(d.status)}</Chip>
                      {d.portal_project_id && <Chip>linked project</Chip>}
                      {isOverdue(d) && <Chip className="border-destructive text-destructive">overdue</Chip>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[d.client, d.site_name, d.contact_name, d.deal_source, d.assigned_to].filter(Boolean).join(" · ") || "No client details captured"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatZar(Number(d.estimated_value) || 0)} · weighted {formatZar(weightedValue(d))} ·{" "}
                      {d.probability_percent ?? defaultProbability(d.status)}% probability
                    </p>
                    {d.next_action && (
                      <p className="mt-1 text-xs">
                        Next: {d.next_action} {d.next_action_date ? `· ${formatDate(d.next_action_date)}` : ""}
                      </p>
                    )}
                    {d.status === "lost" && d.lost_reason && <p className="mt-1 text-xs text-muted-foreground">Lost: {d.lost_reason}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startConvert(d)}>
                      <ArrowRightLeft className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Convert to project
                    </Button>
                    {d.portal_project_id && (
                      <Button size="sm" variant="ghost" onClick={() => openProject(d.portal_project_id!, "boq")}>
                        Open BOQ
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit deal" : "New deal"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal title" className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Client / company">
              <Input value={form.client} onChange={(e) => set("client", e.target.value)} />
            </Field>
            <Field label="Site name">
              <Input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} />
            </Field>
            <Field label="Stage">
              <select
                className={selectCls}
                value={form.status}
                onChange={(e) => {
                  set("status", e.target.value);
                  setForm((f) => ({ ...f, status: e.target.value, probability_percent: String(defaultProbability(e.target.value)) }));
                }}
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
                {Object.entries(LEGACY_STAGE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select className={selectCls} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {["low", "medium", "high", "urgent"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimated value (R)">
              <Input type="number" min={0} value={form.estimated_value} onChange={(e) => set("estimated_value", e.target.value)} />
            </Field>
            <Field label="Probability %">
              <Input type="number" min={0} max={100} value={form.probability_percent} onChange={(e) => set("probability_percent", e.target.value)} />
            </Field>
            <Field label="Deal source">
              <select className={selectCls} value={form.deal_source} onChange={(e) => set("deal_source", e.target.value)}>
                <option value="">Not set</option>
                {DEAL_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assigned to">
              <Input value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} />
            </Field>
            <Field label="Contact name">
              <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
            </Field>
            <Field label="Next action">
              <Input value={form.next_action} onChange={(e) => set("next_action", e.target.value)} />
            </Field>
            <Field label="Next action date">
              <Input type="date" value={form.next_action_date} onChange={(e) => set("next_action_date", e.target.value)} />
            </Field>
            <Field label="Expected start">
              <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </Field>
            <Field label="Expected completion">
              <Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Internal notes" className="sm:col-span-2">
              <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>
            {form.status === "lost" && (
              <Field label="Lost reason" className="sm:col-span-2">
                <Input value={form.lost_reason} onChange={(e) => set("lost_reason", e.target.value)} />
              </Field>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {editing ? "Save deal" : "Create deal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!convert} onOpenChange={(o) => !o && setConvert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Convert deal to project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Existing portal client">
              <select className={selectCls} value={convClient} onChange={(e) => setConvClient(e.target.value)}>
                <option value="">Create a new client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            </Field>
            {!convClient && (
              <Field label="New client name">
                <Input value={convNewClient} onChange={(e) => setConvNewClient(e.target.value)} />
              </Field>
            )}
            <Field label="Existing site">
              <select className={selectCls} value={convSite} onChange={(e) => setConvSite(e.target.value)}>
                <option value="">Create a new site…</option>
                {sites.filter((s) => !convClient || s.client_id === convClient).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            {!convSite && (
              <Field label="New site name (optional)">
                <Input value={convNewSite} onChange={(e) => setConvNewSite(e.target.value)} />
              </Field>
            )}
            <Field label="Project title">
              <Input value={convProjectTitle} onChange={(e) => setConvProjectTitle(e.target.value)} />
            </Field>
            <p className="text-xs text-muted-foreground">
              Existing clients, sites and matching projects are reused — nothing is duplicated. No emails or invites are sent.
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConvert(null)}>
              Cancel
            </Button>
            <Button onClick={runConvert} disabled={busy}>
              Convert &amp; mark won
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealsTab;
