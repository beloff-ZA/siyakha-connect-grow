import React from "react";
import { usePmWorkspace } from "@/hooks/usePmWorkspace";
import ProjectRegister from "@/components/pm/ProjectRegister";

/**
 * Clean project register. Each project opens its own workspace at
 * /helpdesk/project-management/:projectId — the advanced commercial modules
 * (deals, proposals, lifecycle, assets, catalogue, reports) remain in the
 * codebase and are simply not part of this primary workflow.
 */
const ProjectManagement: React.FC = () => {
  const ws = usePmWorkspace();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Siyakha Technology Solutions</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Clients &amp; projects</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every client project in one register. Open a project to manage its building schedule, plans, bill of
          quantities, documents and secure view-only link. Documents are generated for download and manual review —
          nothing is emailed automatically.
        </p>
      </header>

      {ws.error && (
        <p className="mb-4 border border-destructive p-3 text-sm text-destructive">Could not load workspace: {ws.error}</p>
      )}

      {ws.loading ? <p className="text-sm text-muted-foreground">Loading workspace…</p> : <ProjectRegister ws={ws} />}
    </div>
  );
};

export default ProjectManagement;
