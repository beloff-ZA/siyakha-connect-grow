/**
 * Reusable resolver that decides which BOQ revision a client deck may show.
 *
 * It is deliberately generic: no project, client or token is special-cased. The
 * rules are:
 *   1. Only revisions belonging to the deck's own project are considered.
 *   2. Only revisions with a client-visible status may ever be shown.
 *   3. Among eligible revisions, a revision explicitly designated for the deck
 *      (share-link resource, or the project's designated BOQ) wins; otherwise
 *      the newest revision (highest version, then most recently updated) wins.
 *   4. When nothing is eligible, the resolver reports a truthful reason code so
 *      the deck can render a client-safe "BOQ not yet issued" state instead of
 *      inventing pricing.
 */

export const CLIENT_VISIBLE_BOQ_STATUSES = ["shared", "published", "approved"] as const;

export type BoqCandidate = {
  id: string;
  project_id?: string | null;
  status?: string | null;
  version_no?: number | null;
  updated_at?: string | null;
};

export type BoqPendingReason =
  | "no_boq_for_project"
  | "no_issued_revision"
  | "no_client_lines"
  | "designated_revision_not_issued";

export const BOQ_PENDING_MESSAGES: Record<BoqPendingReason, string> = {
  no_boq_for_project: "BOQ not yet issued for client review.",
  no_issued_revision: "BOQ not yet issued for client review.",
  no_client_lines: "BOQ not yet issued for client review.",
  designated_revision_not_issued: "BOQ not yet issued for client review.",
};

export const normalizedStatus = (status?: string | null) => String(status ?? "").trim().toLowerCase();

export const isClientVisibleStatus = (status?: string | null) =>
  (CLIENT_VISIBLE_BOQ_STATUSES as readonly string[]).includes(normalizedStatus(status));

/** A candidate must belong to this project — a deck can never cross projects. */
export const inProjectScope = (candidate: BoqCandidate, projectId: string) =>
  !candidate.project_id || candidate.project_id === projectId;

const time = (value?: string | null) => {
  const t = new Date(String(value ?? "")).getTime();
  return Number.isFinite(t) ? t : 0;
};

/** Newest first: highest version number, then most recently updated. */
export function sortRevisions<T extends BoqCandidate>(rows: readonly T[]): T[] {
  return [...rows].sort(
    (a, b) => Number(b.version_no ?? 0) - Number(a.version_no ?? 0) || time(b.updated_at) - time(a.updated_at),
  );
}

export type ResolveBoqResult<T extends BoqCandidate> =
  | { boq: T; reason: null; designated: boolean }
  | { boq: null; reason: BoqPendingReason; designated: false };

export function resolveClientBoq<T extends BoqCandidate>(
  candidates: readonly T[],
  opts: { project_id: string; designated_ids?: readonly (string | null | undefined)[] },
): ResolveBoqResult<T> {
  const scoped = candidates.filter((c) => inProjectScope(c, opts.project_id));
  if (!scoped.length) return { boq: null, reason: "no_boq_for_project", designated: false };

  const eligible = sortRevisions(scoped.filter((c) => isClientVisibleStatus(c.status)));
  const designatedIds = (opts.designated_ids ?? []).filter(Boolean) as string[];

  if (!eligible.length) {
    const designatedExists = scoped.some((c) => designatedIds.includes(c.id));
    return {
      boq: null,
      reason: designatedExists ? "designated_revision_not_issued" : "no_issued_revision",
      designated: false,
    };
  }

  for (const id of designatedIds) {
    const hit = eligible.find((c) => c.id === id);
    if (hit) return { boq: hit, reason: null, designated: true };
  }
  return { boq: eligible[0], reason: null, designated: false };
}

/** Applied after lines are loaded: an issued revision with no client lines is still pending. */
export const pendingReasonForLines = (lineCount: number): BoqPendingReason | null =>
  lineCount > 0 ? null : "no_client_lines";
