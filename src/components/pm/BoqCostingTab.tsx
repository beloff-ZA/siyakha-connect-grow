import React, { useMemo, useState } from "react";
import BoqManager from "@/components/helpdesk/BoqManager";
import PrintSurface from "./PrintSurface";
import BoqPrintView from "./BoqPrintView";
import { Panel, Field, selectCls } from "./ui";
import { useToast } from "@/hooks/use-toast";
import { buildSnapshot, type ProposalSnapshot } from "@/lib/proposals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";

const BoqCostingTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
}> = ({ ws, projectId, setProjectId }) => {
  const { toast } = useToast();
  const { projects, clients, sites } = ws;
  const [snapshot, setSnapshot] = useState<ProposalSnapshot | null>(null);

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  const openCustomerPrint = async (boqId: string) => {
    try {
      setSnapshot(await buildSnapshot(projectId, boqId));
    } catch (e) {
      toast({ title: "Could not build document", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    }
  };

  return (
    <div>
      <Panel title="BOQ & costing">
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
        <p className="mt-3 text-xs text-muted-foreground">
          Supplier names, supplier costs, markup and margin stay internal. The customer document is generated from a
          client-safe snapshot only.
        </p>
      </Panel>

      {projectId ? (
        <BoqManager projectId={projectId} onPrintCustomerBoq={openCustomerPrint} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a project to open its bill of quantities.</p>
      )}

      <PrintSurface open={!!snapshot} title="Customer bill of quantities" onClose={() => setSnapshot(null)}>
        {snapshot && <BoqPrintView snapshot={snapshot} />}
      </PrintSurface>
    </div>
  );
};

export default BoqCostingTab;
