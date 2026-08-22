import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import {
  buildSnapshot,
  isLocked,
  nextProposalNumber,
  proposalStatusTone,
  proposalsDb,
  PROPOSAL_DEFAULTS,
  SIYAKHA,
  type Proposal,
} from "@/lib/proposals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { assertClientSafe, assertExplicitAction, scopeToProject } from "@/lib/reporting";
import { useAuth } from "@/contexts/AuthContext";
import { adminDisplayName } from "@/lib/adminIdentity";
import { Chip, Field, Panel, selectCls } from "./ui";
import PrintSurface from "./PrintSurface";
import ProposalDocument from "./ProposalDocument";
import ShareDialog, { type ShareTarget } from "./ShareDialog";
import { FileText, Plus, Receipt, Share2 } from "lucide-react";

type Form = {
  project_id: string;
  boq_id: string;
  title: string;
  revision_label: string;
  executive_summary: string;
  project_understanding: string;
  objectives: string;
  scope_of_work: string;
  methodology: string;
  deliverables: string;
  assumptions: string;
  exclusions: string;
  warranty_terms: string;
  payment_terms: string;
  validity_days: string;
  planned_start_date: string;
  planned_completion_date: string;
  prepared_by_name: string;
  prepared_by_email: string;
};

/** Prepared-by defaults come from the signed-in admin's auth metadata. */
const blankForm = (preparedByName?: string | null): Form => ({
  project_id: "",
  boq_id: "",
  title: "",
  revision_label: "Rev A",
  executive_summary: "",
  project_understanding: "",
  objectives: "",
  scope_of_work: "",
  methodology: PROPOSAL_DEFAULTS.methodology,
  deliverables: PROPOSAL_DEFAULTS.deliverables,
  assumptions: PROPOSAL_DEFAULTS.assumptions,
  exclusions: PROPOSAL_DEFAULTS.exclusions,
  warranty_terms: PROPOSAL_DEFAULTS.warranty_terms,
  payment_terms: PROPOSAL_DEFAULTS.payment_terms,
  validity_days: "30",
  planned_start_date: "",
  planned_completion_date: "",
  prepared_by_name: preparedByName?.trim() || "Nikita Jacobs",
  prepared_by_email: SIYAKHA.email,
});

const nextRevision = (label: string) => {
  const m = label.match(/([A-Z])\s*$/i);
  if (m) return label.replace(/([A-Z])\s*$/i, String.fromCharCode(m[1].toUpperCase().charCodeAt(0) + 1));
  const n = label.match(/(\d+)\s*$/);
  if (n) return label.replace(/(\d+)\s*$/, String(Number(n[1]) + 1));
  return `${label} (2)`;
};

const ProposalsTab: React.FC<{
  ws: PmWorkspace;
  initialProjectId?: string;
  /** Locks the tab to the URL project and hides the project filter. */
  locked?: boolean;
}> = ({ ws, initialProjectId, locked }) => {
  const { toast } = useToast();
  const { projects, clients, sites, boqs, proposals, reload } = ws;
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const { user } = useAuth();
  const preparedByName = adminDisplayName(user);
  const [form, setForm] = useState<Form>(blankForm(preparedByName));
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<{ proposal: Proposal; variant: "full" | "costing" } | null>(null);
  const [filterProject, setFilterProject] = useState(initialProjectId ?? "");
  const [share, setShare] = useState<ShareTarget | null>(null);


  useEffect(() => {
    if (initialProjectId) setFilterProject(initialProjectId);
  }, [initialProjectId]);

  const fail = (e: unknown) =>
    toast({ title: "Action failed", description: (e as any)?.message ?? String(e), variant: "destructive" as never });

  const projectLabel = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return "Unknown project";
    const client = clients.find((c) => c.id === p.client_id)?.display_name;
    const site = sites.find((s) => s.id === p.site_id)?.name;
    return [client, site, p.title].filter(Boolean).join(" — ");
  };

  const openNew = (projectId?: string, reviseFrom?: Proposal) => {
    const base = blankForm(preparedByName);
    if (reviseFrom) {
      setForm({
        ...base,
        project_id: reviseFrom.project_id,
        boq_id: reviseFrom.boq_id ?? "",
        title: reviseFrom.title,
        revision_label: nextRevision(reviseFrom.revision_label),
        executive_summary: reviseFrom.executive_summary ?? "",
        project_understanding: reviseFrom.project_understanding ?? "",
        objectives: reviseFrom.objectives ?? "",
        scope_of_work: reviseFrom.scope_of_work ?? "",
        methodology: reviseFrom.methodology ?? base.methodology,
        deliverables: reviseFrom.deliverables ?? base.deliverables,
        assumptions: reviseFrom.assumptions ?? base.assumptions,
        exclusions: reviseFrom.exclusions ?? base.exclusions,
        warranty_terms: reviseFrom.warranty_terms ?? base.warranty_terms,
        payment_terms: reviseFrom.payment_terms ?? base.payment_terms,
        validity_days: String(reviseFrom.validity_days ?? 30),
        planned_start_date: reviseFrom.planned_start_date ?? "",
        planned_completion_date: reviseFrom.planned_completion_date ?? "",
        prepared_by_name: reviseFrom.prepared_by_name ?? base.prepared_by_name,
        prepared_by_email: reviseFrom.prepared_by_email ?? base.prepared_by_email,
      });
      setEditing(null);
      setDialog(true);
      return;
    }
    const pid = projectId ?? filterProject ?? "";
    setForm({ ...base, project_id: pid, ...prefill(pid) });
    setEditing(null);
    setDialog(true);
  };

  const prefill = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    if (!p) return {};
    const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "";
    const site = sites.find((s) => s.id === p.site_id)?.name ?? "";
    const boq = boqs.find((b) => b.project_id === projectId);
    return {
      boq_id: boq?.id ?? "",
      title: `${p.title} — Technology infrastructure proposal`,
      executive_summary: `${SIYAKHA.company} is pleased to submit this proposal to ${client || "the client"} for the technology infrastructure scope at ${site || p.title}. Our approach delivers a smart, scalable and secure environment, installed and certified to standard, with clear documentation and ongoing support.`,
      project_understanding: `${client || "The client"} requires a reliable, well-documented technology infrastructure at ${site || p.title}. ${p.description ?? "The scope covers design confirmation, supply, installation, testing, certification and handover."}`,
      objectives:
        "A resilient, standards-compliant infrastructure sized for current and future demand.\nFull coverage across every level and area identified in the design.\nCentralised, secure management with clear labelling and documentation.\nMinimal disruption to occupants and existing operations during installation.\nA certified, fully documented handover with measurable test results.",
      scope_of_work: p.description ?? "Supply, installation, termination, testing, certification, commissioning and handover of the infrastructure detailed in the attached pricing schedule.",
      planned_start_date: p.start_date ?? "",
      planned_completion_date: p.target_date ?? "",
    } as Partial<Form>;
  };

  const openEdit = (p: Proposal) => {
    setEditing(p);
    setForm({
      project_id: p.project_id,
      boq_id: p.boq_id ?? "",
      title: p.title,
      revision_label: p.revision_label,
      executive_summary: p.executive_summary ?? "",
      project_understanding: p.project_understanding ?? "",
      objectives: p.objectives ?? "",
      scope_of_work: p.scope_of_work ?? "",
      methodology: p.methodology ?? "",
      deliverables: p.deliverables ?? "",
      assumptions: p.assumptions ?? "",
      exclusions: p.exclusions ?? "",
      warranty_terms: p.warranty_terms ?? "",
      payment_terms: p.payment_terms ?? "",
      validity_days: String(p.validity_days ?? 30),
      planned_start_date: p.planned_start_date ?? "",
      planned_completion_date: p.planned_completion_date ?? "",
      prepared_by_name: p.prepared_by_name ?? "",
      prepared_by_email: p.prepared_by_email ?? "",
    });
    setDialog(true);
  };

  const payloadFrom = (f: Form) => ({
    project_id: f.project_id,
    boq_id: f.boq_id || null,
    title: f.title.trim(),
    revision_label: f.revision_label.trim() || "Rev A",
    executive_summary: f.executive_summary.trim() || null,
    project_understanding: f.project_understanding.trim() || null,
    objectives: f.objectives.trim() || null,
    scope_of_work: f.scope_of_work.trim() || null,
    methodology: f.methodology.trim() || null,
    deliverables: f.deliverables.trim() || null,
    assumptions: f.assumptions.trim() || null,
    exclusions: f.exclusions.trim() || null,
    warranty_terms: f.warranty_terms.trim() || null,
    payment_terms: f.payment_terms.trim() || null,
    validity_days: Math.max(1, Number(f.validity_days) || 30),
    planned_start_date: f.planned_start_date || null,
    planned_completion_date: f.planned_completion_date || null,
    prepared_by_name: f.prepared_by_name.trim() || null,
    prepared_by_email: f.prepared_by_email.trim() || null,
  });

  /** Draft creation is user-triggered only; rendering never writes a record. */
  const saveDraft = async (trigger: "user" | "effect" = "user") => {
    assertExplicitAction(trigger, "Saving a proposal draft");
    if (!form.project_id) return toast({ title: "Select a project", variant: "destructive" as never });
    if (!form.title.trim()) return toast({ title: "A title is required", variant: "destructive" as never });
    setBusy(true);
    try {
      if (editing) {
        if (isLocked(editing)) throw new Error("This proposal is locked. Create a new revision instead.");
        const { error } = await proposalsDb.from("portal_proposals").update(payloadFrom(form)).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data: auth } = await supabase.auth.getUser();
        const number = await nextProposalNumber();
        const { error } = await proposalsDb
          .from("portal_proposals")
          .insert({ ...payloadFrom(form), proposal_number: number, status: "draft", created_by: auth.user?.id ?? null });
        if (error) throw error;
      }
      toast({ title: editing ? "Draft updated" : "Draft proposal created" });
      setDialog(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /** Freezes the client-facing snapshot and issues the document. */
  const generate = async (p: Proposal, variant: "full" | "costing", trigger: "user" | "effect" = "user") => {
    setBusy(true);
    try {
      assertExplicitAction(trigger, "Generating a proposal");
      let record = p;
      if (!isLocked(p)) {
        const snapshot = await buildSnapshot(p.project_id, p.boq_id);
        assertClientSafe(snapshot, "The client proposal");
        const { data, error } = await proposalsDb
          .from("portal_proposals")
          .update({ snapshot, status: "issued", issued_at: new Date().toISOString() })
          .eq("id", p.id)
          .select("*")
          .maybeSingle();
        if (error) throw error;
        record = data as Proposal;
        await reload();
      }
      if (!record.snapshot) throw new Error("No snapshot stored on this proposal");
      setView({ proposal: record, variant });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  /** Shares the exact issued revision; a draft must be generated first. */
  const openShare = (p: Proposal, variant: "full" | "costing") => {
    if (!p.snapshot) {
      toast({ title: "Generate the document first", description: "A frozen revision is required before sharing.", variant: "destructive" as never });
      return;
    }
    const project = projects.find((x) => x.id === p.project_id);
    setShare({
      resource_type: variant === "costing" ? "costing" : "proposal",
      resource_id: p.id,
      revision_label: `${p.proposal_number} · ${p.revision_label}`,
      title: p.title,
      project_id: p.project_id,
      client_id: project?.client_id ?? null,
      snapshot: { proposal: p },
    });
  };

  const setStatus = async (p: Proposal, status: Proposal["status"]) => {
    setBusy(true);
    try {
      const patch: Record<string, unknown> = { status };
      if (status === "accepted") patch.accepted_at = new Date().toISOString();
      const { error } = await proposalsDb.from("portal_proposals").update(patch).eq("id", p.id);
      if (error) throw error;
      toast({ title: `Marked ${status}` });
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  // When locked, only the URL project's proposals are ever listed.
  const rows = useMemo(
    () =>
      locked
        ? scopeToProject(proposals, initialProjectId ?? "")
        : proposals.filter((p) => !filterProject || p.project_id === filterProject),
    [proposals, filterProject, locked, initialProjectId],
  );

  const projectBoqs = boqs.filter((b) => b.project_id === form.project_id);

  return (
    <div>
      <Panel
        title={`Proposals & official costings (${proposals.length})`}
        actions={
          <Button size="sm" onClick={() => openNew(locked ? initialProjectId : undefined)}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} /> New proposal
          </Button>
        }
      >
        {!locked && (
          <Field label="Filter by project">
            <select className={selectCls} value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {projectLabel(p.id)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Generating a document freezes an immutable snapshot of the client, site, project and BOQ lines. Later BOQ edits
          never change an issued document — create a new revision instead. Nothing is emailed automatically.
        </p>
      </Panel>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No proposals captured yet.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => (
            <article key={p.id} className="border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip className={proposalStatusTone(p.status)}>{p.status}</Chip>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {p.proposal_number} · {p.revision_label}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold">{p.title}</h4>
                  <p className="text-xs text-muted-foreground">{projectLabel(p.project_id)}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Created {formatDate(p.created_at)}</p>
                  {p.issued_at && <p>Issued {formatDate(p.issued_at)}</p>}
                  {p.accepted_at && <p>Accepted {formatDate(p.accepted_at)}</p>}
                  {p.snapshot?.totals && <p className="mt-1 text-sm text-foreground">{formatZar(p.snapshot.totals.total)} incl. VAT</p>}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => generate(p, "full")} disabled={busy}>
                  <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  {isLocked(p) ? "Open full proposal" : "Generate full proposal"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => generate(p, "costing")} disabled={busy}>
                  <Receipt className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  {isLocked(p) ? "Open official costing" : "Generate official costing"}
                </Button>
                {!isLocked(p) && (
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    Edit draft
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openNew(p.project_id, p)}>
                  New revision
                </Button>
                <Button size="sm" variant="outline" onClick={() => openShare(p, "full")} disabled={busy}>
                  <Share2 className="mr-2 h-4 w-4" strokeWidth={1.5} /> Share proposal
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openShare(p, "costing")} disabled={busy}>
                  <Share2 className="mr-2 h-4 w-4" strokeWidth={1.5} /> Share costing
                </Button>
                {p.status === "issued" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setStatus(p, "accepted")} disabled={busy}>
                      Mark accepted
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setStatus(p, "superseded")} disabled={busy}>
                      Mark superseded
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.proposal_number}` : "Proposal builder"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project">
              <select
                className={selectCls}
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value, ...prefill(e.target.value) } as Form)}
                disabled={!!editing}
              >
                <option value="">Select…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {projectLabel(p.id)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pricing BOQ">
              <select className={selectCls} value={form.boq_id} onChange={(e) => setForm({ ...form, boq_id: e.target.value })}>
                <option value="">No BOQ (narrative only)</option>
                {projectBoqs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} · {b.revision_label} ({b.status})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Document title" className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Revision label">
              <Input value={form.revision_label} onChange={(e) => setForm({ ...form, revision_label: e.target.value })} />
            </Field>
            <Field label="Validity (days)">
              <Input type="number" min={1} value={form.validity_days} onChange={(e) => setForm({ ...form, validity_days: e.target.value })} />
            </Field>
            <Field label="Planned start">
              <Input type="date" value={form.planned_start_date} onChange={(e) => setForm({ ...form, planned_start_date: e.target.value })} />
            </Field>
            <Field label="Planned completion">
              <Input
                type="date"
                value={form.planned_completion_date}
                onChange={(e) => setForm({ ...form, planned_completion_date: e.target.value })}
              />
            </Field>
            <Field label="Prepared by">
              <Input value={form.prepared_by_name} onChange={(e) => setForm({ ...form, prepared_by_name: e.target.value })} />
            </Field>
            <Field label="Prepared by email">
              <Input value={form.prepared_by_email} onChange={(e) => setForm({ ...form, prepared_by_email: e.target.value })} />
            </Field>

            {(
              [
                ["Executive summary", "executive_summary", 4],
                ["Project understanding", "project_understanding", 4],
                ["Objectives", "objectives", 4],
                ["Scope of work", "scope_of_work", 5],
                ["Methodology / implementation approach", "methodology", 6],
                ["Deliverables", "deliverables", 5],
                ["Assumptions", "assumptions", 5],
                ["Exclusions", "exclusions", 5],
                ["Warranty", "warranty_terms", 3],
                ["Payment terms", "payment_terms", 3],
              ] as [string, keyof Form, number][]
            ).map(([label, key, rows_]) => (
              <Field key={key} label={label} className="sm:col-span-2">
                <Textarea rows={rows_} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveDraft("user")} disabled={busy}>
              Save draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintSurface
        open={!!view}
        title={view?.variant === "costing" ? "Official costing — A4 print view" : "Full proposal — A4 print view"}
        onClose={() => setView(null)}
      >
        {view && <ProposalDocument proposal={view.proposal} variant={view.variant} />}
      </PrintSurface>

      <ShareDialog open={!!share} onOpenChange={(v) => !v && setShare(null)} target={share} />
    </div>
  );
};

export default ProposalsTab;
