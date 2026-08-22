import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Panel, Field, Chip, selectCls } from "./ui";
import { LIFECYCLE_STAGES, stageLabel, VARIATION_STATUSES } from "@/lib/lifecycle";
import { formatZar } from "@/lib/boq";
import { formatDate } from "@/lib/portalFiles";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const db = supabase as unknown as { from: (t: string) => any };

const LifecycleTab: React.FC<{ ws: PmWorkspace; projectId: string; setProjectId: (id: string) => void }> = ({
  ws,
  projectId,
  setProjectId,
}) => {
  const { toast } = useToast();
  const [stage, setStage] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ reference: "", title: "", discipline: "", customer_amount: "", description: "" });

  const project = useMemo(() => ws.projects.find((p) => p.id === projectId), [ws.projects, projectId]);

  const options = useMemo(
    () =>
      ws.projects.map((p) => ({
        id: p.id,
        label: [ws.clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned", p.title].join(" — "),
      })),
    [ws.projects, ws.clients],
  );

  const load = async (id: string) => {
    const [h, v, a, p] = await Promise.all([
      db.from("portal_project_stage_history").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      db.from("portal_variations").select("*").eq("project_id", id).order("raised_on", { ascending: false }),
      db.from("portal_activity").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(40),
      db.from("portal_projects").select("lifecycle_stage").eq("id", id).maybeSingle(),
    ]);
    setHistory(h.data ?? []);
    setVariations(v.data ?? []);
    setActivity(a.data ?? []);
    setStage(p.data?.lifecycle_stage ?? "");
  };

  useEffect(() => {
    if (projectId) load(projectId);
    else {
      setHistory([]);
      setVariations([]);
      setActivity([]);
      setStage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const saveStage = async () => {
    if (!projectId || !stage) return;
    setBusy(true);
    try {
      const { data: current } = await db.from("portal_projects").select("lifecycle_stage").eq("id", projectId).maybeSingle();
      const from = current?.lifecycle_stage ?? null;
      const { error } = await db.from("portal_projects").update({ lifecycle_stage: stage, lifecycle_note: note || null }).eq("id", projectId);
      if (error) throw error;
      const { data: user } = await supabase.auth.getUser();
      await db.from("portal_project_stage_history").insert({
        project_id: projectId,
        from_stage: from,
        to_stage: stage,
        note: note || null,
        changed_by: user?.user?.id ?? null,
      });
      await db.from("portal_activity").insert({
        project_id: projectId,
        client_id: project?.client_id ?? null,
        site_id: project?.site_id ?? null,
        entity_type: "project",
        entity_id: projectId,
        action: "stage_changed",
        detail: `Stage moved from ${stageLabel(from)} to ${stageLabel(stage)}`,
        actor_user_id: user?.user?.id ?? null,
        actor_type: "admin",
      });
      setNote("");
      await load(projectId);
      toast({ title: "Stage updated", description: `Now at ${stageLabel(stage)}.` });
    } catch (e) {
      toast({ title: "Could not update stage", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const addVariation = async () => {
    if (!projectId || !form.reference.trim() || !form.title.trim()) {
      toast({ title: "Reference and title are required", variant: "destructive" as never });
      return;
    }
    setBusy(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await db.from("portal_variations").insert({
        project_id: projectId,
        reference: form.reference.trim(),
        title: form.title.trim(),
        discipline: form.discipline.trim() || null,
        description: form.description.trim() || null,
        customer_amount: Number(form.customer_amount || 0),
        created_by: user?.user?.id ?? null,
      });
      if (error) throw error;
      setForm({ reference: "", title: "", discipline: "", customer_amount: "", description: "" });
      await load(projectId);
      toast({ title: "Variation added" });
    } catch (e) {
      toast({ title: "Could not add variation", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
    }
  };

  const setVariationStatus = async (id: string, status: string) => {
    const { error } = await db
      .from("portal_variations")
      .update({ status, decided_on: ["approved", "rejected", "instructed"].includes(status) ? new Date().toISOString().slice(0, 10) : null })
      .eq("id", id);
    if (error) {
      toast({ title: "Could not update variation", description: error.message, variant: "destructive" as never });
      return;
    }
    load(projectId);
  };

  return (
    <div>
      <Panel title="Project lifecycle">
        <Field label="Project">
          <select className={selectCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select a project…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        {projectId && (
          <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
            <Field label="Current stage">
              <select className={selectCls} value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="">Not set (keeps existing status)</option>
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Change note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for the stage change" />
            </Field>
            <Button onClick={saveStage} disabled={busy || !stage}>
              Save stage
            </Button>
          </div>
        )}
        {projectId && (
          <p className="mt-3 text-xs text-muted-foreground">
            Legacy project status remains <Chip>{project?.status ?? "—"}</Chip> and is never changed automatically.
          </p>
        )}
      </Panel>

      {projectId && (
        <>
          <Panel title="Stage history">
            {history.length ? (
              <ul className="space-y-2 text-sm">
                {history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-baseline gap-2 border-b border-border pb-2">
                    <span className="font-medium">
                      {stageLabel(h.from_stage)} → {stageLabel(h.to_stage)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(h.created_at)}</span>
                    {h.note && <span className="text-xs text-muted-foreground">{h.note}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No stage changes recorded yet.</p>
            )}
          </Panel>

          <Panel title="Variation / change register">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Reference">
                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="VO-001" />
              </Field>
              <Field label="Title" className="md:col-span-2">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Customer amount (excl. VAT)">
                <Input
                  type="number"
                  value={form.customer_amount}
                  onChange={(e) => setForm({ ...form, customer_amount: e.target.value })}
                />
              </Field>
              <Field label="Discipline">
                <Input value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} />
              </Field>
              <Field label="Description" className="md:col-span-3">
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <Button className="mt-3" onClick={addVariation} disabled={busy}>
              Add variation
            </Button>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="py-2 pr-3">Ref</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Raised</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variations.map((v) => (
                    <tr key={v.id} className="border-b border-border">
                      <td className="py-2 pr-3">{v.reference}</td>
                      <td className="py-2 pr-3">{v.title}</td>
                      <td className="py-2 pr-3">{formatDate(v.raised_on)}</td>
                      <td className="py-2 pr-3 tabular-nums">{formatZar(Number(v.customer_amount ?? 0))}</td>
                      <td className="py-2 pr-3">
                        <select className="h-8 border border-input bg-background px-2 text-xs" value={v.status} onChange={(e) => setVariationStatus(v.id, e.target.value)}>
                          {VARIATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!variations.length && (
                    <tr>
                      <td colSpan={5} className="py-3 text-sm text-muted-foreground">
                        No variations raised. The core BOQ stays untouched until a variation is approved.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Audit activity">
            {activity.length ? (
              <ul className="space-y-1.5 text-sm">
                {activity.map((a) => (
                  <li key={a.id} className="flex flex-wrap gap-2 border-b border-border pb-1.5">
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{a.action}</span>
                    <span>{a.detail}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No activity recorded for this project yet.</p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default LifecycleTab;
