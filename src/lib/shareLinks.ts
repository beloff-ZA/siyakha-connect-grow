import { supabase } from "@/integrations/supabase/client";

/**
 * Secure client share links.
 *
 * A link is a cryptographically strong random token. Only its SHA-256 hash is
 * stored, so a database reader can never reconstruct a working link. The frozen
 * snapshot of the shared document is stored on the row, which guarantees that
 * later live edits never change what the client sees.
 */

const db = supabase as any;

export type ShareResourceType = "proposal" | "costing" | "boq" | "project_pack" | "report" | "floor_plan_view";

export type SharePermission = "view" | "view_download" | "view_comment" | "view_approve";

export type ShareLink = {
  id: string;
  resource_type: ShareResourceType;
  resource_id: string | null;
  revision_label: string | null;
  title: string;
  project_id: string;
  client_id: string | null;
  permission_scope: SharePermission;
  download_allowed: boolean;
  comments_allowed: boolean;
  approval_allowed: boolean;
  require_client_login: boolean;
  recipient_label: string | null;
  recipient_email: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  access_count: number;
  first_accessed_at: string | null;
  last_accessed_at: string | null;
};

export const RESOURCE_LABELS: Record<ShareResourceType, string> = {
  proposal: "Proposal",
  costing: "Official costing",
  boq: "Bill of quantities",
  project_pack: "Full project pack",
  report: "Project report",
  floor_plan_view: "Floor-plan view",
};

export const PERMISSIONS: { value: SharePermission; label: string }[] = [
  { value: "view", label: "View only" },
  { value: "view_download", label: "View + download" },
  { value: "view_comment", label: "View + comment / query" },
  { value: "view_approve", label: "View + approve / accept" },
];

export const permissionLabel = (v: string) => PERMISSIONS.find((p) => p.value === v)?.label ?? v;

/** 32 random bytes, base64url — unguessable and URL safe. */
export const generateToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/** Document-style share page (single frozen revision). */
export const shareUrl = (token: string) => `${window.location.origin}/share/${token}`;

/** Default client delivery: branded, read-only Project Portfolio Deck. */
export const deckUrl = (token: string) => `${window.location.origin}/project-deck/${token}`;

/** Packs and reports are delivered as a portfolio deck by default. */
export const isDeckResource = (t: ShareResourceType) => t === "project_pack" || t === "report";

export const linkUrlFor = (t: ShareResourceType, token: string) => (isDeckResource(t) ? deckUrl(token) : shareUrl(token));

export type CreateShareInput = {
  resource_type: ShareResourceType;
  resource_id?: string | null;
  revision_label?: string | null;
  title: string;
  project_id: string;
  client_id?: string | null;
  /** Frozen, client-safe snapshot of exactly what is shared. */
  snapshot: unknown;
  permission_scope: SharePermission;
  /** Independent capability flags. Omit to derive them from permission_scope. */
  download_allowed?: boolean;
  comments_allowed?: boolean;
  approval_allowed?: boolean;
  require_client_login: boolean;
  recipient_label?: string | null;
  recipient_email?: string | null;
  expires_at: string;
};

/** Creates a link and returns the one-time plaintext URL. */
export async function createShareLink(input: CreateShareInput): Promise<{ link: ShareLink; url: string }> {
  const token = generateToken();
  const token_hash = await hashToken(token);
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await db
    .from("portal_share_links")
    .insert({
      token_hash,
      resource_type: input.resource_type,
      resource_id: input.resource_id ?? null,
      revision_label: input.revision_label ?? null,
      title: input.title,
      project_id: input.project_id,
      client_id: input.client_id ?? null,
      snapshot: input.snapshot ?? {},
      permission_scope: input.permission_scope,
      download_allowed: input.download_allowed ?? input.permission_scope === "view_download",
      comments_allowed: input.comments_allowed ?? input.permission_scope === "view_comment",
      approval_allowed: input.approval_allowed ?? input.permission_scope === "view_approve",
      require_client_login: input.require_client_login,
      recipient_label: input.recipient_label?.trim() || null,
      recipient_email: input.recipient_email?.trim() || null,
      expires_at: input.expires_at,
      created_by: auth.user?.id ?? null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return { link: data as ShareLink, url: linkUrlFor(input.resource_type, token) };
}

/**
 * A link's token, snapshot and resource identity are immutable at database
 * level. A lost link is replaced by revoking it and creating a new one, so a
 * frozen document can never silently change under a recipient.
 */


/** Toggle download / comment / acceptance on an already issued link. */
export async function updateShareCapabilities(
  id: string,
  flags: Partial<Pick<ShareLink, "download_allowed" | "comments_allowed" | "approval_allowed">>,
) {
  const { error } = await db.from("portal_share_links").update(flags).eq("id", id);
  if (error) throw error;
}

export async function loadShareLinks(filter: { project_id?: string; resource_id?: string }) {
  let q = db.from("portal_share_links").select("*").order("created_at", { ascending: false });
  if (filter.project_id) q = q.eq("project_id", filter.project_id);
  if (filter.resource_id) q = q.eq("resource_id", filter.resource_id);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ShareLink[];
}

export async function setShareExpiry(id: string, expires_at: string) {
  const { error } = await db.from("portal_share_links").update({ expires_at }).eq("id", id);
  if (error) throw error;
}

export async function revokeShareLink(id: string) {
  const { error } = await db.from("portal_share_links").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function loadShareAccessLog(shareLinkId: string) {
  const { data, error } = await db
    .from("portal_share_access_log")
    .select("id, accessed_at, action, outcome, detail, user_agent")
    .eq("share_link_id", shareLinkId)
    .order("accessed_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export const shareState = (l: ShareLink) =>
  l.revoked_at ? "revoked" : new Date(l.expires_at).getTime() < Date.now() ? "expired" : "active";

export const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

/** Resolves a share token through the public edge function. */
export async function resolveShare(token: string, body: { action?: string; message?: string; access_token?: string } = {}) {
  const { data, error } = await supabase.functions.invoke("share-resolve", { body: { token, ...body } });
  if (error) throw error;
  return data as {
    state: "ok" | "expired" | "revoked" | "unavailable" | "login_required" | "rate_limited" | "denied";
    link?: {
      resource_type: ShareResourceType;
      title: string;
      revision_label: string | null;
      expires_at: string;
      permission_scope: SharePermission;
      download_allowed: boolean;
      comments_allowed: boolean;
      approval_allowed: boolean;
    };
    snapshot?: any;
  };
}
