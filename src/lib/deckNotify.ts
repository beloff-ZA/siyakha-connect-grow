/**
 * Pure rules for the internal "project viewed" notification sent to Siyakha
 * when a viewer successfully passes the project-deck gate.
 *
 * The notification is internal only: the client/viewer is never emailed, the
 * share token never leaves the server, and no commercial detail is included.
 * Delivery is always non-blocking — the deck opens whether or not mail is sent.
 */

export const NOTIFY_RECIPIENT = "nikita@siyakhatechnology.co.za";
export const NOTIFY_SENDER = "Siyakha Projects <notifications@siyakhatechnology.co.za>";

export type NotifyEvent = {
  /** Outcome of the gate submission. Only a granted registration notifies. */
  outcome: "granted" | "invalid" | "expired" | "revoked" | "not_found" | "error" | "rate_limited";
  /** The HTTP method of the request — preflight/bot probes never notify. */
  method?: string;
  viewer_id?: string | null;
  first_name?: string | null;
  surname?: string | null
  email?: string | null;
  consent?: boolean;
};

/**
 * One successful gate submission is exactly one view event. A refresh re-gates
 * and therefore produces a new event, and a new notification.
 */
export function shouldNotify(event: NotifyEvent): boolean {
  if ((event.method ?? "POST").toUpperCase() !== "POST") return false;
  if (event.outcome !== "granted") return false;
  if (event.consent === false) return false;
  if (!event.viewer_id) return false;
  if (!String(event.first_name ?? "").trim() || !String(event.surname ?? "").trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(event.email ?? "").trim());
}

/**
 * Idempotency key for one unique access event: the viewer plus the session
 * issued for that entry. Retries of the same request reuse the key and must not
 * send a second email; a later re-entry mints a new session and a new key.
 */
export const notifyIdempotencyKey = (input: { viewer_id: string; session_hash: string }) =>
  `deck_view:${input.viewer_id}:${String(input.session_hash).slice(0, 32)}`;

const pad = (n: number) => String(n).padStart(2, "0");

/** SAST (UTC+2, no DST) rendering of an access timestamp. */
export function formatSast(iso: string | Date): string {
  const d = new Date(iso);
  const t = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())} ${pad(t.getUTCHours())}:${pad(
    t.getUTCMinutes(),
  )} SAST`;
}

export const adminProjectLink = (origin: string, projectId: string) =>
  `${String(origin).replace(/\/+$/, "")}/helpdesk/project-management/${projectId}`;

export type NotifyContent = {
  project_title?: string | null;
  client_name?: string | null;
  site_name?: string | null;
  first_name: string;
  surname: string;
  email: string;
  accessed_at: string;
  admin_link: string;
};

export const notifySubject = (projectTitle?: string | null) =>
  `Project viewed — ${String(projectTitle ?? "").trim() || "Untitled project"}`;

/** Fields that may never appear in the notification body. */
export const NOTIFY_FORBIDDEN_KEYS = [
  "token",
  "share_token",
  "supplier_cost",
  "supplier_name",
  "markup_percent",
  "margin",
  "internal_notes",
  "banking_details",
  "subtotal",
  "vat",
  "total",
] as const;

export function notifyLines(content: NotifyContent): [string, string][] {
  return [
    ["Project", String(content.project_title ?? "—")],
    ["Client", String(content.client_name ?? "—")],
    ["Site", String(content.site_name ?? "—")],
    ["Viewer", `${content.first_name} ${content.surname}`.trim()],
    ["Email", content.email],
    ["Viewed at", content.accessed_at],
    ["Admin project", content.admin_link],
  ];
}

/** Plain-text body. Deliberately carries no token and no commercial values. */
export const notifyText = (content: NotifyContent) =>
  notifyLines(content)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export const bodyIsSafe = (body: string, token?: string) => {
  const lower = body.toLowerCase();
  if (token && lower.includes(token.toLowerCase())) return false;
  return !NOTIFY_FORBIDDEN_KEYS.some((key) => lower.includes(key));
};

/** Configuration gate: without a provider key the hook records a blocker only. */
export type NotifyConfig = { api_key?: string | null; sender?: string | null };

export const configBlocker = (config: NotifyConfig): string | null => {
  if (!String(config.api_key ?? "").trim()) return "RESEND_API_KEY is not configured";
  if (!String(config.sender ?? "").trim()) return "Verified Siyakha sender address is not configured";
  return null;
};

/** A mail failure is recorded for audit but never blocks deck access. */
export const accessGrantedDespiteMail = (mail: { ok: boolean; error?: string | null }) => ({
  access_granted: true,
  delivery_status: mail.ok ? "sent" : "failed",
  error_message: mail.ok ? null : (mail.error ?? "Unknown send error"),
});
