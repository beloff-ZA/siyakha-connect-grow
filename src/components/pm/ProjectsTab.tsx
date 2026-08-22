import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { formatDate } from "@/lib/portalFiles";
import { formatZar } from "@/lib/boq";
import { isOpenDeal, stageLabel, weightedValue } from "@/lib/deals";
import type { PmProject, PmWorkspace } from "@/hooks/usePmWorkspace";
import { Pencil, Plus } from "lucide-react";

const db = supabase as unknown as { from: (t: string) => any };

const PROJECT_STATUSES = ["planning", "design", "in_progress", "on_hold", "complete", "archived"];

const emptyForm = {
  title: "",
  client_id: "",
  site_id: "",
  status: "planning",
  reference: "",
  address: "",
  consultant: "",
  description: "",
  start_date: "",
  target_date: "",
};

const ProjectsTab: React.FC<{
  ws: PmWorkspace;
  openProject: (projectId: string, tab: string) => void;
}> = ({ ws, openProject }) => {
  const { toast } = useToast();
  const { projects, clients, sites, boqs, deals, proposals, reload } = ws;
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PmProject | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (p: PmProject) => {
    setEditing(p);
    setForm({
      title: p.title ?? "",
      client_id: p.client_id ?? "",
      site_id: p.site_id ?? "",
      status: p.status ?? "planning",
      reference: p.reference ?? "",
      address: p.address ?? "",
      consultant: p.consultant ?? "",
      description: p.description ?? "",
      start_date: p.start_date ?? "",
      target_date: p.target_date ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "A project title is required", variant: "destructive" as never });
    if (!form.client_id) return toast({ title: "Select a client", variant: "destructive" as never });
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        client_id: form.client_id,
        site_id: form.site_id || null,
        status: form.status,
        reference: form.reference.trim() || null,
        address: form.address.trim() || null,
        consultant: form.consultant.trim() || null,
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        target_date: form.target_date || null,
      };
      const { error } = editing
        ? await db.from("portal_projects").update(payload).eq("id", editing.id)
        : await db.from("portal_projects").insert(payload);
      if (error) throw error;
      toast({ title: editing ? "Project updated" : "Project created" });
      setDialogOpen(false);
      await reload();
    } catch (e) {
      toast({ title: "Action failed", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .map((p) => ({
        project: p,
        client: clients.find((c) => c.id === p.client_id) ?? null,
        site: sites.find((s) => s.id === p.site_id) ?? null,
        boqCount: boqs.filter((b) => b.project_id === p.id).length,
        proposalCount: proposals.filter((pr) => pr.project_id === p.id).length,
        deal: deals.find((d) => d.portal_project_id === p.id) ?? null,
      }))
      .filter((r) => {
        if (clientFilter !== "all" && r.project.client_id !== clientFilter) return false;
        if (statusFilter !== "all" && (r.project.status ?? "") !== statusFilter) return false;
        if (!q) return true;
        return [r.project.title, r.project.reference, r.client?.display_name, r.site?.name, r.project.address]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      });
  }, [projects, clients, sites, boqs, proposals, deals, search, clientFilter, statusFilter]);

  const pipelineOnly = deals.filter((d) => !d.portal_project_id);

  return (
    <div>
      <Panel
        title={`All portal projects (${projects.length})`}
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New project
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={selectCls} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} aria-label="Client filter">
            <option value="all">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name}
              </option>
            ))}
          </select>
          <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status filter">
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="self-center text-xs text-muted-foreground">{rows.length} project(s) shown</p>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {rows.map(({ project, client, site, boqCount, proposalCount, deal }) => (
            <li key={project.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{project.title}</p>
                    <Chip className="border-foreground text-foreground">{project.status ?? "—"}</Chip>
                    {deal && <Chip>deal · {stageLabel(deal.status)}</Chip>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[client?.display_name, site?.name, project.reference, project.address].filter(Boolean).join(" · ") || "No client or site linked"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start {formatDate(project.start_date)} · Target {formatDate(project.target_date)} · {boqCount} BOQ ·{" "}
                    {proposalCount} proposal(s)
                    {deal ? ` · deal value ${formatZar(Number(deal.estimated_value) || 0)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(project)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openProject(project.id, "boq")}>
                    BOQ &amp; costing
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openProject(project.id, "proposals")}>
                    Proposal
                  </Button>
                  <Link to="/portal/floor-plans">
                    <Button size="sm" variant="ghost">
                      Floor plans
                    </Button>
                  </Link>
                  <Link to="/portal/documents">
                    <Button size="sm" variant="ghost">
                      Documents
                    </Button>
                  </Link>
                </div>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-4 text-sm text-muted-foreground">No projects match the current filters.</li>}
        </ul>
      </Panel>

      <Panel title={`Pipeline records not yet converted (${pipelineOnly.length})`}>
        <p className="mb-3 text-xs text-muted-foreground">
          Commercial deals from the pipeline that have no portal project yet. Convert them on the Deals tab.
        </p>
        {pipelineOnly.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every deal is linked to a portal project.</p>
        ) : (
          <ul className="divide-y divide-border">
            {pipelineOnly.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  {d.title}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {[d.client, d.site_name].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {stageLabel(d.status)} · {formatZar(Number(d.estimated_value) || 0)}
                  {isOpenDeal(d) ? ` · weighted ${formatZar(weightedValue(d))}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project title" className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Client">
              <select className={selectCls} value={form.client_id} onChange={(e) => set("client_id", e.target.value)}>
                <option value="">Select…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Site">
              <select className={selectCls} value={form.site_id} onChange={(e) => set("site_id", e.target.value)}>
                <option value="">No site</option>
                {sites.filter((s) => !form.client_id || s.client_id === form.client_id).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reference">
              <Input value={form.reference} onChange={(e) => set("reference", e.target.value)} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
            <Field label="Consultant">
              <Input value={form.consultant} onChange={(e) => set("consultant", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
              </Field>
              <Field label="Target">
                <Input type="date" value={form.target_date} onChange={(e) => set("target_date", e.target.value)} />
              </Field>
            </div>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {editing ? "Save project" : "Create project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsTab;
