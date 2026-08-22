import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Panel, Chip, Stat } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import { designQty, isMismatch, loadReconciliation, syncBoqFromPlan, type PlanBoqReconciliation } from "@/lib/planBoqSync";
import { disciplineLabel } from "@/lib/productCatalog";
import { RefreshCw } from "lucide-react";

const db = supabase as unknown as { from: (t: string) => any };

type Activity = { id: string; action: string; detail: string | null; created_at: string };

/**
 * Design → BOQ reconciliation. Quantities on plan-linked lines are controlled by the
 * design; rates, supplier costs, markup, specifications and manual lines are never
 * touched by a sync.
 */
const PlanBoqSyncPanel: React.FC<{
  projectId: string;
  boqId: string;
  boqStatus: string;
  boqLabel: string;
  onSynced?: () => void;
}> = ({ projectId, boqId, boqStatus, boqLabel, onSynced }) => {
  const { toast } = useToast();
  const [data, setData] = useState<PlanBoqReconciliation | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [rec, act] = await Promise.all([
        loadReconciliation(projectId, boqId),
        db
          .from("portal_boq_activity")
          .select("id, action, detail, created_at")
          .eq("boq_id", boqId)
          .eq("action", "plan_sync")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setData(rec);
      setActivity((act.data ?? []) as Activity[]);
    } catch (e) {
      setError((e as any)?.message ?? String(e));
    }
  }, [projectId, boqId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resync = async () => {
    setBusy(true);
    try {
      const res = await syncBoqFromPlan(boqId);
      toast({
        title: "Design synced to BOQ",
        description: `${res.added ?? 0} added, ${res.updated ?? 0} updated, ${res.removed ?? 0} removed. Rates and manual lines untouched.`,
      });
      await load();
      onSynced?.();
    } catch (e) {
      toast({ title: "Sync blocked", description: (e as any)?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const rows = data?.rows ?? [];
  const mismatches = rows.filter(isMismatch).length;
  const locked = boqStatus !== "draft";

  return (
    <Panel
      title="Design ↔ BOQ reconciliation"
      actions={
        <Button size="sm" variant="outline" onClick={resync} disabled={busy || locked}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> {busy ? "Syncing…" : "Re-sync from plan"}
        </Button>
      }
    >
      {error && <p className="mb-4 border border-destructive p-3 text-sm text-destructive">{error}</p>}

      {locked && (
        <p className="mb-4 border border-border p-3 text-xs text-muted-foreground">
          {boqLabel} is <strong>{boqStatus}</strong>. Shared, approved and superseded bills are locked — create a new draft
          revision before syncing the design into it.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Plan-linked products" value={rows.length} />
        <Stat label="Placed instances" value={rows.reduce((n, r) => n + r.placed, 0)} />
        <Stat label="Unplaced instances" value={rows.reduce((n, r) => n + r.unplaced, 0)} hint="Still real project devices" />
        <Stat label="Mismatches" value={mismatches} hint={mismatches ? "Re-sync to align" : "In balance"} />
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No plan devices are linked to catalogue products on this project yet. Link products in the plan device manager, then
          sync.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Discipline</th>
                <th className="py-2 pr-4 text-right">Placed</th>
                <th className="py-2 pr-4 text-right">Unplaced</th>
                <th className="py-2 pr-4 text-right">Design qty</th>
                <th className="py-2 pr-4 text-right">BOQ qty</th>
                <th className="py-2">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.product_id} className="border-b border-border/60">
                  <td className="py-3 pr-4">
                    {r.product?.name ?? "Unknown product"}
                    <span className="block text-xs text-muted-foreground">
                      {[r.product?.manufacturer, r.product?.model].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{disciplineLabel(r.product?.discipline)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{r.placed}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{r.unplaced}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{designQty(r)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{r.boqQuantity ?? "—"}</td>
                  <td className="py-3">
                    {isMismatch(r) ? (
                      <Chip className="border-destructive text-destructive">Mismatch</Chip>
                    ) : (
                      <Chip>Plan-linked — quantity controlled by design</Chip>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.unlinkedMarkers > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {data.unlinkedMarkers} plan device{data.unlinkedMarkers === 1 ? "" : "s"} on this project are not linked to a
          catalogue product and are excluded from quantity sync.
        </p>
      )}

      {activity.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Sync activity</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {activity.map((a) => (
              <li key={a.id}>
                {new Date(a.created_at).toLocaleString()} — {a.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
};

export default PlanBoqSyncPanel;
