import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortal, statusLabel } from "@/hooks/usePortal";
import { PageHeader, Panel, EmptyState, Loading, ErrorNote, NoProject, StatusPill } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";

type Task = { id: string; status: string };
type Milestone = { id: string; title: string; due_date: string | null; status: string };
type Update = { id: string; title: string; posted_at: string; status: string | null };

const PortalDashboard: React.FC = () => {
  const { client, clientUser, activeProject, loading, error } = usePortal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    document.title = "Client Dashboard | Siyakha Interlink";
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    (async () => {
      const [t, m, u] = await Promise.all([
        supabase.from("portal_tasks").select("id, status").eq("project_id", activeProject.id),
        supabase
          .from("portal_milestones")
          .select("id, title, due_date, status")
          .eq("project_id", activeProject.id)
          .neq("status", "complete")
          .order("due_date", { ascending: true, nullsFirst: false })
          .limit(5),
        supabase
          .from("portal_updates")
          .select("id, title, posted_at, status")
          .eq("project_id", activeProject.id)
          .order("posted_at", { ascending: false })
          .limit(4),
      ]);
      if (cancelled) return;
      setTasks((t.data ?? []) as Task[]);
      setMilestones((m.data ?? []) as Milestone[]);
      setUpdates((u.data ?? []) as Update[]);
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  if (loading) return <Loading label="Loading your dashboard…" />;
  if (error) return <ErrorNote message={error} />;

  const completed = tasks.filter((t) => t.status === "complete" || t.status === "done").length;
  const hasProgressData = tasks.length > 0;
  const progress = hasProgressData ? Math.round((completed / tasks.length) * 100) : null;

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Siyakha Client Portal"
        title={`Welcome, ${client?.display_name ?? clientUser?.full_name ?? "client"}`}
        description="Track project status, planning progress, approved documentation and site records in one place."
      />

      {!activeProject ? (
        <NoProject />
      ) : (
        <div className="space-y-8">
          <Panel>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">
                  Current project
                </p>
                <h2 className="font-display text-xl md:text-2xl font-light tracking-tight">
                  {activeProject.title}
                </h2>
                {activeProject.address && (
                  <p className="text-sm text-muted-foreground mt-2">{activeProject.address}</p>
                )}
              </div>
              <StatusPill status={activeProject.status} />
            </div>

            <dl className="grid sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Reference</dt>
                <dd className="mt-1 text-sm">{activeProject.reference ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Consultant</dt>
                <dd className="mt-1 text-sm">{activeProject.consultant ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Target date
                </dt>
                <dd className="mt-1 text-sm">{formatDate(activeProject.target_date)}</dd>
              </div>
            </dl>
          </Panel>

          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Overall progress">
              {busy ? (
                <Loading />
              ) : hasProgressData ? (
                <div>
                  <p className="font-display text-4xl font-light tracking-tight">{progress}%</p>
                  <div className="mt-4 h-1 bg-muted">
                    <div className="h-1 bg-foreground" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {completed} of {tasks.length} tracked tasks complete.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Progress reporting starts once implementation tasks are captured. Currently: not started.
                </p>
              )}
            </Panel>

            <Panel title="Client details">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Company</dt>
                  <dd>{client?.display_name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Contact</dt>
                  <dd>{client?.contact_name ?? clientUser?.full_name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Email</dt>
                  <dd className="break-all">{client?.contact_email ?? clientUser?.email ?? "—"}</dd>
                </div>
              </dl>
            </Panel>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Upcoming milestones">
              {busy ? (
                <Loading />
              ) : milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No milestones scheduled yet — dates are TBC.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {milestones.map((m) => (
                    <li key={m.id} className="py-3 flex items-start justify-between gap-4">
                      <span className="text-sm">{m.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                        {formatDate(m.due_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Recent updates">
              {busy ? (
                <Loading />
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No updates posted yet. Siyakha will publish progress notes here.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {updates.map((u) => (
                    <li key={u.id} className="py-3">
                      <p className="text-sm">{u.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {formatDate(u.posted_at)} · {statusLabel(u.status)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Quick links">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { to: "/portal/project", label: "Project overview" },
                { to: "/portal/tracker", label: "Planning tracker" },
                { to: "/portal/documents", label: "Documents" },
                { to: "/portal/site-images", label: "Site images" },

                { to: "/portal/support", label: "Raise a query" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center justify-between border border-border px-4 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                >
                  {l.label}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {!activeProject && clientUser === null && !loading && (
        <div className="mt-8">
          <EmptyState
            title="This account has no client portal access"
            description="You are signed in, but this email is not linked to a Siyakha client record. Contact nikita@siyakhatechnology.co.za."
          />
        </div>
      )}
    </div>
  );
};

export default PortalDashboard;
