import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Chip, Field, Panel, selectCls } from "./ui";
import {
  createNextStep,
  deleteNextStep,
  loadNextSteps,
  STEP_CATEGORIES,
  STEP_STATUSES,
  stepStatusLabel,
  updateNextStep,
  type NextStep,
} from "@/lib/nextSteps";

/**
 * Admin view of the single project next-steps list. The same rows feed the
 * technician link (installation steps they may tick off) and the client link
 * (the full client-facing next steps) — nothing is duplicated.
 */
const NextStepsPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { toast } = useToast();
  const [steps, setSteps] = useState<NextStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    detail: "",
    category: "installation",
    due_date: "",
    technician_visible: true,
    client_visible: true,
  });

  const fail = (e: unknown) =>
    toast({
      title: "Action failed",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive" as never,
    });

  const load = useCallback(async () => {
    try {
      setSteps(await loadNextSteps(projectId));
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (projectId) void load();
  }, [projectId, load]);

  const add = async () => {
    if (!form.title.trim()) {
      toast({ title: "Add a short description of the step" });
      return;
    }
    setBusy(true);
    try {
      await createNextStep(projectId, {
        ...form,
        due_date: form.due_date || null,
        sort_order: steps.reduce((m, s) => Math.max(m, s.sort_order), 0) + 1,
      });
      setForm({ ...form, title: "", detail: "", due_date: "" });
      await load();
      toast({ title: "Next step added" });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, values: Partial<NextStep>) => {
    try {
      await updateNextStep(id, values);
      await load();
    } catch (e) {
      fail(e);
    }
  };

  const remove = async (step: NextStep) => {
    if (!window.confirm(`Remove "${step.title}" from the next steps?`)) return;
    try {
      await deleteNextStep(step.id);
      await load();
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Panel title={`Next steps — ${steps.length} on record`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Next step" className="sm:col-span-2">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Pull cable on Fourth Floor east wing"
          />
        </Field>
        <Field label="Detail (optional)" className="sm:col-span-2">
          <Textarea
            rows={2}
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            placeholder="Anything the technician or client needs to know"
          />
        </Field>
        <Field label="Type">
          <select
            className={selectCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {STEP_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target date (optional)">
          <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.technician_visible}
            onChange={(e) => setForm({ ...form, technician_visible: e.target.checked })}
          />
          Show on the technician link
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.client_visible}
            onChange={(e) => setForm({ ...form, client_visible: e.target.checked })}
          />
          Show on the client link
        </label>
        <Button size="sm" onClick={add} disabled={busy} className="ml-auto">
          Add next step
        </Button>
      </div>

      <div className="mt-5 grid gap-2">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No next steps captured yet.</p>
        ) : (
          steps.map((s) => (
            <article key={s.id} className="border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[220px]">
                  <p className="text-sm font-medium">{s.title}</p>
                  {s.detail && <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {STEP_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category}
                    {s.due_date ? ` · by ${s.due_date}` : ""}
                    {s.updated_by_name ? ` · last touched by ${s.updated_by_name}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip>{stepStatusLabel(s.status)}</Chip>
                  <select
                    className="h-8 border border-input bg-background px-2 text-xs"
                    value={s.status}
                    onChange={(e) =>
                      patch(s.id, {
                        status: e.target.value as NextStep["status"],
                        completed_at: e.target.value === "done" ? new Date().toISOString() : null,
                      })
                    }
                    aria-label="Status"
                  >
                    {STEP_STATUSES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch(s.id, { technician_visible: !s.technician_visible })}
                  >
                    {s.technician_visible ? "Technician sees it" : "Hidden from technician"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => patch(s.id, { client_visible: !s.client_visible })}>
                    {s.client_visible ? "Client sees it" : "Hidden from client"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(s)}>
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
};

export default NextStepsPanel;
