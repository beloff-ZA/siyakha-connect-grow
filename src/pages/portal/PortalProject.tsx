import React, { useEffect } from "react";
import { usePortal } from "@/hooks/usePortal";
import { PageHeader, Panel, Loading, ErrorNote, NoProject, StatusPill } from "@/components/portal/ui";
import { formatDate } from "@/lib/portalFiles";

const Block: React.FC<{ title: string; value?: string | null }> = ({ title, value }) => (
  <Panel title={title}>
    {value ? (
      <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
        {value.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">To be confirmed.</p>
    )}
  </Panel>
);

const PortalProject: React.FC = () => {
  const { activeProject, loading, error } = usePortal();

  useEffect(() => {
    document.title = "Project Overview | Siyakha Client Portal";
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} />;
  if (!activeProject) return <NoProject />;

  const p = activeProject;

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Project overview" title={p.title} />

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <StatusPill status={p.status} />
        {p.reference && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Ref {p.reference}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <Panel title="Key information">
          <dl className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Address</dt>
              <dd className="mt-1">{p.address ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Consultant</dt>
              <dd className="mt-1">{p.consultant ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Start date</dt>
              <dd className="mt-1">{formatDate(p.start_date)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Target date</dt>
              <dd className="mt-1">{formatDate(p.target_date)}</dd>
            </div>
          </dl>
        </Panel>

        <Block title="Description & scope" value={p.description} />
        <Block title="Site context" value={p.site_context} />
        <Block title="Objectives" value={p.objectives} />
        <Block title="Stakeholders" value={p.stakeholders} />
        <Block title="Planning narrative" value={p.planning_narrative} />
        <Block title="Risks & notes" value={p.risks_notes} />
      </div>
    </div>
  );
};

export default PortalProject;
