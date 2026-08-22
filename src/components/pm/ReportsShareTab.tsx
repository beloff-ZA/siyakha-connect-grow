import React from "react";
import { useSearchParams } from "react-router-dom";
import ProposalsTab from "./ProposalsTab";
import ReportsTab from "./ReportsTab";
import ShareViewTab from "./ShareViewTab";
import { REPORT_VIEWS, parseReportView } from "@/lib/reporting";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

/**
 * "Reports & share" for one URL-scoped project. It only arranges the existing
 * proposal, project-report and secure-link tabs — there is no separate
 * reporting engine, and nothing is created until the user clicks Generate or
 * Create inside one of them.
 */
const ReportsShareTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
  locked?: boolean;
}> = ({ ws, projectId, setProjectId, locked = true }) => {
  const [params, setParams] = useSearchParams();
  const view = parseReportView(params.get("view"));

  const select = (next: string) => {
    const value = parseReportView(next);
    const draft = new URLSearchParams(params);
    draft.set("section", "share");
    draft.set("view", value);
    setParams(draft, { replace: true });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
        {REPORT_VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => select(v.value)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] ${
              view === v.value ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        Documents are produced for this project only. Supplier cost, markup, margin, internal notes and private images
        are never included in anything a client can see, and no document, report or link exists until you create it.
      </p>

      {view === "proposal" && <ProposalsTab ws={ws} initialProjectId={projectId} locked={locked} />}
      {view === "report" && <ReportsTab ws={ws} projectId={projectId} setProjectId={setProjectId} locked={locked} />}
      {view === "link" && <ShareViewTab ws={ws} projectId={projectId} setProjectId={setProjectId} locked={locked} />}
    </div>
  );
};

export default ReportsShareTab;
