import React, { useMemo, useState } from "react";
import BoqManager from "@/components/helpdesk/BoqManager";
import PrintSurface from "./PrintSurface";
import BoqPrintView from "./BoqPrintView";
import ShareDialog, { type ShareTarget } from "./ShareDialog";
import PlanBoqSyncPanel from "./PlanBoqSyncPanel";
import { Button } from "@/components/ui/button";
import { Panel, Field, selectCls } from "./ui";
import { useToast } from "@/hooks/use-toast";
import { buildSnapshot, type ProposalSnapshot } from "@/lib/proposals";
import type { PmWorkspace } from "@/hooks/usePmWorkspace";
import { Share2 } from "lucide-react";


const BoqCostingTab: React.FC<{
  ws: PmWorkspace;
  projectId: string;
  setProjectId: (id: string) => void;
}> = ({ ws, projectId, setProjectId }) => {
  const { toast } = useToast();
  const { projects, clients, sites, boqs } = ws;
  const [snapshot, setSnapshot] = useState<ProposalSnapshot | null>(null);
  const [shareBoqId, setShareBoqId] = useState("");
  const [share, setShare] = useState<ShareTarget | null>(null);
  const [busy, setBusy] = useState(false);

  const options = useMemo(
    () =>
      projects.map((p) => {
        const client = clients.find((c) => c.id === p.client_id)?.display_name ?? "Unassigned";
        const site = sites.find((s) => s.id === p.site_id)?.name;
        return { id: p.id, label: [client, site, p.title].filter(Boolean).join(" — ") };
      }),
    [projects, clients, sites],
  );

  const projectBoqs = useMemo(() => boqs.filter((b) => b.project_id === projectId), [boqs, projectId]);
  const [syncBoqId, setSyncBoqId] = useState("");
  const syncBoq = useMemo(() => projectBoqs.find((b) => b.id === syncBoqId) ?? null, [projectBoqs, syncBoqId]);


  const openCustomerPrint = async (boqId: string) => {
    try {
      setSnapshot(await buildSnapshot(projectId, boqId));
    } catch (e) {
      toast({ title: "Could not build document", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    }
  };

  /** Freezes a client-safe BOQ snapshot and opens the share manager. */
  const openShare = async () => {
    const boq = projectBoqs.find((b) => b.id === shareBoqId);
    if (!boq) return toast({ title: "Select a BOQ to share", variant: "destructive" as never });
    setBusy(true);
    try {
      const snap = await buildSnapshot(projectId, boq.id);
      const project = projects.find((p) => p.id === projectId);
      setShare({
        resource_type: "boq",
        resource_id: boq.id,
        revision_label: (boq as any).revision_label ?? null,
        title: `${(boq as any).title} — bill of quantities`,
        project_id: projectId,
        client_id: project?.client_id ?? null,
        snapshot: { boq_snapshot: snap },
      });
    } catch (e) {
      toast({ title: "Could not prepare share", description: (e as any)?.message ?? String(e), variant: "destructive" as never });
    } finally {
      setBusy(false);
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

        {projectId && projectBoqs.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Share a bill of quantities with the client">
              <select className={selectCls} value={shareBoqId} onChange={(e) => setShareBoqId(e.target.value)}>
                <option value="">Select a BOQ…</option>
                {projectBoqs.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.title} · {b.revision_label} ({b.status})
                  </option>
                ))}
              </select>
            </Field>
            <Button size="sm" variant="outline" onClick={openShare} disabled={busy || !shareBoqId}>
              <Share2 className="mr-2 h-4 w-4" strokeWidth={1.5} /> Share with client
            </Button>
          </div>
        )}

        {projectId && (
          <div className="mt-4">
            <Field label="BOQ used for design (plan) quantity sync">
              <select className={selectCls} value={syncBoqId} onChange={(e) => setSyncBoqId(e.target.value)}>
                <option value="">Select the BOQ the design should feed…</option>
                {projectBoqs.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.title} · {b.revision_label} ({b.status})
                  </option>
                ))}
              </select>
            </Field>
            {projectBoqs.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                This project has no bill of quantities yet. Create a draft BOQ below before syncing the design.
              </p>
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Supplier names, supplier costs, markup and margin stay internal. The customer document and every share link are
          generated from a client-safe snapshot only, and nothing is emailed.
        </p>
      </Panel>

      {projectId && syncBoq && (
        <PlanBoqSyncPanel
          projectId={projectId}
          boqId={syncBoq.id}
          boqStatus={(syncBoq as any).status}
          boqLabel={`${(syncBoq as any).title} · ${(syncBoq as any).revision_label}`}
          onSynced={ws.reload}
        />
      )}



      {projectId ? (
        <BoqManager projectId={projectId} onPrintCustomerBoq={openCustomerPrint} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a project to open its bill of quantities.</p>
      )}

      <PrintSurface open={!!snapshot} title="Customer bill of quantities" onClose={() => setSnapshot(null)}>
        {snapshot && <BoqPrintView snapshot={snapshot} />}
      </PrintSurface>

      <ShareDialog open={!!share} onOpenChange={(v) => !v && setShare(null)} target={share} />
    </div>
  );
};

export default BoqCostingTab;
