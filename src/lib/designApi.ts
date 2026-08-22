import { supabase } from "@/integrations/supabase/client";

/**
 * Single transactional entry point for every plan-device change.
 *
 * The server mutates the device and settles the project's nominated design bill
 * of quantities inside one transaction, so a device and its quantity can never
 * drift apart. Geometry-only changes (move, aim, rename) are commercially inert.
 * Quantity-bearing changes either reconcile a valid draft bill or abort
 * completely — unless the caller explicitly confirms an unbilled design.
 */
export type MarkerAction = "save" | "archive" | "restore" | "delete";

export type Reconciliation =
  | { reconciled: true; boq_id: string; added: number; updated: number; removed: number; commercial?: boolean }
  | { reconciled: false; reason: string; status?: string; commercial?: boolean };

export type MarkerTransactionResult = {
  action: MarkerAction;
  marker_id: string | null;
  project_id: string;
  quantity_bearing?: boolean;
  reconciliation: Reconciliation;
};

const rpc = supabase.rpc.bind(supabase) as unknown as (
  name: string,
  args?: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>;

async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/** True when the server refused because no draft design bill is nominated. */
export const isUnbilledRejection = (message: string) =>
  /no draft design bill of quantities is nominated|carry no quantities/i.test(message);

export async function markerTransaction(
  action: MarkerAction,
  payload: Record<string, unknown>,
): Promise<MarkerTransactionResult> {
  return call<MarkerTransactionResult>("portal_marker_transaction", {
    _action: action,
    _payload: payload,
  });
}

export type DuplicateResult = {
  marker_id: string;
  label: string;
  project_id: string;
  quantity_bearing: boolean;
  reconciliation: Reconciliation;
};

/** Duplicate keeps product linkage, discipline, optics, environment and placement. */
export async function duplicateMarker(
  markerId: string,
  payload: Record<string, unknown> = {},
): Promise<DuplicateResult> {
  return call<DuplicateResult>("portal_duplicate_marker", {
    _marker_id: markerId,
    _payload: payload,
  });
}

export type BulkCreateInput = {
  floor_id: string;
  count: number;
  label_prefix: string;
  /** Catalogue product for billable devices. Omit only with allow_unbilled. */
  product_id?: string | null;
  marker_type?: string;
  discipline?: string | null;
  notes?: string | null;
  client_visible?: boolean;
  allow_unbilled?: boolean;
};

export type BulkCreateResult = {
  created: number;
  marker_ids: string[];
  project_id: string;
  quantity_bearing: boolean;
  reconciliation: Reconciliation;
};

export async function bulkCreateMarkers(input: BulkCreateInput): Promise<BulkCreateResult> {
  return call<BulkCreateResult>("portal_bulk_create_markers", { _payload: input });
}

export type CopyLayoutInput = {
  source_floor_id: string;
  target_floor_ids: string[];
  /** merge (default) adds to the target; replace clears replaceable planned devices first. */
  mode?: "merge" | "replace";
  include_routes?: boolean;
  allow_unbilled?: boolean;
};

export type CopyLayoutResult = {
  copied: number;
  removed: number;
  routes_created: number;
  protected: number;
  mode: "merge" | "replace";
  project_id: string;
  quantity_bearing: boolean;
  reconciliation: Reconciliation;
};

export async function copyFloorLayout(input: CopyLayoutInput): Promise<CopyLayoutResult> {
  return call<CopyLayoutResult>("portal_copy_floor_layout", { _payload: input });
}

/** Catalogue product state changes. Referenced products can only be archived. */
export async function productLifecycle(action: "archive" | "restore" | "delete", productId: string) {
  return call<{ action: string; product_id: string; linked_markers: number; linked_boq_items: number }>(
    "portal_product_lifecycle",
    { _action: action, _product_id: productId },
  );
}

/** Client-safe catalogue projection: never supplier, cost, markup or client rate. */
export type ClientCatalogueProduct = {
  id: string;
  sku: string | null;
  name: string;
  manufacturer: string | null;
  model: string | null;
  specification: string | null;
  default_marker_type: string | null;
  discipline: string | null;
  default_fov_deg: number | null;
  default_coverage_range: string | null;
  default_coverage_radius_m: number | null;
  unit: string | null;
};

export async function clientCatalogue(projectId: string): Promise<ClientCatalogueProduct[]> {
  const data = await call<ClientCatalogueProduct[] | null>("portal_client_catalogue", {
    _project_id: projectId,
  });
  return data ?? [];
}

/** Atomic plan revision lifecycle. */
export type PlanRevisionAction = "create" | "attach_preview" | "make_current" | "archive";

export async function planRevisionTransaction(
  action: PlanRevisionAction,
  payload: Record<string, unknown>,
) {
  return call<{ action: string; revision_id: string; revision_label?: string; floor_id: string }>(
    "portal_plan_revision_transaction",
    { _action: action, _payload: payload },
  );
}

/** Admin-only client account state transitions, audited, never emailed. */
export async function setClientUserState(
  clientUserId: string,
  status: "active" | "invited" | "suspended" | "revoked",
  portalRole?: "client_admin" | "client_editor" | "client_viewer",
) {
  return call<{ client_user_id: string; status: string; portal_role: string }>(
    "portal_set_client_user_state",
    { _client_user_id: clientUserId, _status: status, _portal_role: portalRole ?? null },
  );
}

/** Human summary of what the design change did to the bill, for toasts. */
export function reconciliationNote(r: Reconciliation | undefined): string | undefined {
  if (!r) return undefined;
  if (r.reconciled !== true) {
    const reason = (r as { reason?: string }).reason;
    const status = (r as { status?: string }).status;
    if (reason === "unbilled_confirmed") return "Saved as an unbilled design — no bill quantities were changed.";
    if (reason === "no_design_boq") return "No design bill is linked to this project yet.";
    if (reason === "boq_not_draft") return `The linked bill is ${status} — quantities were left untouched.`;
    return undefined;
  }
  const { added, updated, removed } = r;
  if (!added && !updated && !removed) return "Bill of quantities unchanged.";
  return `Bill updated: ${added} added, ${updated} adjusted, ${removed} removed.`;
}
