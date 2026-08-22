import { supabase } from "@/integrations/supabase/client";

/**
 * Single transactional entry point for every plan-device change.
 *
 * The server mutates the device and reconciles the project's nominated design
 * bill of quantities inside one transaction, so a device and its quantity can
 * never drift apart. Geometry-only changes (move, aim, rename) reconcile to a
 * no-op; only catalogue linkage, archiving, restoring and deleting shift
 * quantities.
 */
export type MarkerAction = "save" | "archive" | "restore" | "delete";

export type Reconciliation =
  | { reconciled: true; boq_id: string; added: number; updated: number; removed: number }
  | { reconciled: false; reason: string; status?: string };

export type MarkerTransactionResult = {
  action: MarkerAction;
  marker_id: string | null;
  project_id: string;
  reconciliation: Reconciliation;
};

export async function markerTransaction(
  action: MarkerAction,
  payload: Record<string, unknown>,
): Promise<MarkerTransactionResult> {
  const { data, error } = await supabase.rpc("portal_marker_transaction", {
    _action: action,
    _payload: payload as never,
  });
  if (error) throw new Error(error.message);
  return data as unknown as MarkerTransactionResult;
}

/** Human summary of what the design change did to the bill, for toasts. */
export function reconciliationNote(r: Reconciliation | undefined): string | undefined {
  if (!r) return undefined;
  if (!r.reconciled) {
    if (r.reason === "no_design_boq") return "No design bill is linked to this project yet.";
    if (r.reason === "boq_not_draft") return `The linked bill is ${r.status} — quantities were left untouched.`;
    return undefined;
  }
  const { added, updated, removed } = r;
  if (!added && !updated && !removed) return "Bill of quantities unchanged.";
  return `Bill updated: ${added} added, ${updated} adjusted, ${removed} removed.`;
}
