import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal, statusLabel } from "@/hooks/usePortal";
import { PageHeader, Panel, Loading, ErrorNote, NoProject, EmptyState } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";

type Phase = { id: string; name: string; description: string | null; status: string; sort_order: number };
type Milestone = { id: string; phase_id: string | null; title: string; detail: string | null; due_date: string | null; status: string };
type Task = { id: string; phase_id: string | null; title: string; owner: string | null; priority: string; due_date: string | null; status: string; evidence_notes: string | null };

const PortalTracker: React.FC = () => {
  const { activeProject, loading, error } = usePortal();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Planning Tracker | Siyakha Client Portal";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    (async () => {
      const [ph, ms, tk] = await Promise.all([
        supabase.from("portal_phases").select("*").eq("project_id", activeProject.id).order("sort_order"),
        supabase.from("portal_milestones").select("*").eq("project_id", activeProject.id).order("sort_order"),
        supabase.from("portal_tasks").select("*").eq("project_id", activeProject.id).order("sort_order"),
      ]);
      if (cancelled) return;
      setLoadError(ph.error?.message ?? ms.error?.message ?? tk.error?.message ?? null);
      setPhases((ph.data ?? []) as Phase[]);
      setMilestones((ms.data ?? []) as unknown as Milestone[]);
      setTasks((tk.data ?? []) as unknown as Task[]);
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Implementation"
        title="Planning tracker"
        description="Phases, milestones and tasks for this project. Items marked TBC or Not started have no confirmed data yet."
      />

      {loadError && <ErrorNote message={loadError} />}

      {busy ? (
        <Loading />
      ) : phases.length === 0 ? (
        <EmptyState title="No phases captured yet" description="Siyakha will publish the delivery phases here." />
      ) : (
        <ol className="space-y-6">
          {phases.map((phase, idx) => {
            const phaseTasks = tasks.filter((t) => t.phase_id === phase.id);
            const phaseMilestones = milestones.filter((m) => m.phase_id === phase.id);
            return (
              <li key={phase.id}>
                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="font-display text-2xl font-light text-muted-foreground tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-light tracking-tight">{phase.name}</h2>
                        {phase.description && (
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                      {statusLabel(phase.status)}
                    </span>
                  </div>

                  {phaseMilestones.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-3">
                        Milestones
                      </h3>
                      <ul className="divide-y divide-border">
                        {phaseMilestones.map((m) => (
                          <li key={m.id} className="py-3 text-sm flex items-start justify-between gap-4">
                            <span>
                              {m.title}
                              {m.detail && (
                                <span className="block text-xs text-muted-foreground mt-1">{m.detail}</span>
                              )}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                              {formatDate(m.due_date)} · {statusLabel(m.status)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-3">
                      Tasks
                    </h3>
                    {phaseTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Not started — no tasks captured.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <caption className="sr-only">Tasks for {phase.name}</caption>
                          <thead>
                            <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              <th scope="col" className="text-left py-2 pr-4 font-normal">Task</th>
                              <th scope="col" className="text-left py-2 pr-4 font-normal">Owner</th>
                              <th scope="col" className="text-left py-2 pr-4 font-normal">Priority</th>
                              <th scope="col" className="text-left py-2 pr-4 font-normal">Due</th>
                              <th scope="col" className="text-left py-2 font-normal">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {phaseTasks.map((t) => (
                              <tr key={t.id}>
                                <td className="py-3 pr-4">
                                  {t.title}
                                  {t.evidence_notes && (
                                    <span className="block text-xs text-muted-foreground mt-1">
                                      {t.evidence_notes}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 pr-4 text-muted-foreground">{t.owner ?? "—"}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{statusLabel(t.priority)}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{formatDate(t.due_date)}</td>
                                <td className="py-3 text-muted-foreground">{statusLabel(t.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default PortalTracker;
