import React, { useMemo } from "react";
import FloorPlansManager from "@/components/helpdesk/FloorPlansManager";
import { Panel, Field, selectCls } from "./ui";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

/**
 * Plan upload and concept design entry point. Client → site → project selection
 * reuses the workspace data, and the plan workspace itself is the existing
 * FloorPlansManager so there is a single place where plans and devices live.
 */
const PlansDesignTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
}> = ({ ws, projectId, setProjectId }) => {
  const { projects, clients, sites } = ws;

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  return (
    <div>
      <Panel title="Plans & concept design">
        <Field label="Client → site → project">
          <select className={selectCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select a project…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <p className="mt-3 text-xs text-muted-foreground">
          Add the levels or areas, upload the plan as a PDF or image and design across every discipline. Original files and
          earlier revisions are always retained, coordinates are stored normalised to the plan image, and each product you
          place feeds the linked bill of quantities automatically.
        </p>
      </Panel>

      {projectId ? (
        <FloorPlansManager projectId={projectId} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a project to open its plan workspace.</p>
      )}
    </div>
  );
};

export default PlansDesignTab;
