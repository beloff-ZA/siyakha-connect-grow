/**
 * Client-side helpers for the secure "live project view" share mode.
 *
 * Live means live *saved design data* — current client-visible floors, placed
 * device markers with their saved directions/statuses, rack contents and cable
 * routes. Commercial content (proposal, BOQ, rates, totals, narrative,
 * milestones) always stays frozen at the moment the link was issued.
 *
 * Everything here is pure so it can be unit tested without a browser.
 */

/** Background refresh cadence for a live deck. */
export const LIVE_REFRESH_MS = 30_000;

export type LiveResolved = {
  state: string;
  link?: { resource_type?: string; live_project_view?: boolean } | null;
  live_updated_at?: string | null;
  snapshot?: unknown;
};

/** True only when the resolver confirmed a live project-pack view. */
export function isLiveView(res?: LiveResolved | null): boolean {
  return res?.state === "ok" && res?.link?.live_project_view === true && res?.link?.resource_type === "project_pack";
}

/**
 * Decides what to render after a background refresh attempt.
 *
 * A failed or non-ok refresh must never blank the client's view: the previous
 * valid payload is kept and the caller shows a concise warning instead.
 */
export function nextLiveState<T extends LiveResolved>(
  current: T | null,
  incoming: T | null,
): { data: T | null; stale: boolean } {
  if (incoming && incoming.state === "ok") return { data: incoming, stale: false };
  if (current) return { data: current, stale: true };
  return { data: incoming, stale: false };
}

/** Keeps a selection only while that marker still exists in the live design. */
export function keepSelection(selectedId: string | null, ids: readonly string[]): string | null {
  if (!selectedId) return null;
  return ids.includes(selectedId) ? selectedId : null;
}

/** Short "Updated …" label for the live status chip. */
export function updatedLabel(iso?: string | null, now: number = Date.now()): string {
  if (!iso) return "Updated just now";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "Updated just now";
  const secs = Math.max(0, Math.round((now - t) / 1000));
  if (secs < 45) return "Updated just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `Updated ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Updated ${hours} h ago`;
  return `Updated ${new Date(t).toLocaleDateString()}`;
}
