/**
 * Pure rules for the client project deck: viewer registration gate, client-safe
 * BOQ presentation, BOQ acceptance and two-way project notes.
 *
 * Everything here is deliberately free of database and network access so the
 * security-critical rules (allowlisting, explicit acceptance, revision
 * identity, project scoping) can be proven by unit tests.
 */

import { isSensitiveKey } from "./reporting";

/* ------------------------------------------------------------- deck sections */

export const DECK_TABS = [
  { value: "overview", label: "Overview" },
  { value: "scope", label: "Scope" },
  { value: "design", label: "Design & plans" },
  { value: "schedule", label: "Schedule of works" },
  { value: "boq", label: "BOQ & acceptance" },
  { value: "notes", label: "Project notes" },
  { value: "programme", label: "Programme" },
  { value: "documents", label: "Documents" },
  { value: "next", label: "Next steps" },
] as const;

export type DeckTab = (typeof DECK_TABS)[number]["value"];

/* ------------------------------------------------------- viewer registration */

export type ViewerRegistration = {
  first_name: string;
  surname: string;
  email: string;
  consent: boolean;
};

export const CONSENT_TEXT =
  "I agree that my name and email address are stored only to identify project viewers and to maintain the project audit trail for this secure link.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

/** Field-level validation for the registration gate. No password is ever asked. */
export function validateRegistration(input: Partial<ViewerRegistration>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!(input.first_name ?? "").trim()) errors.first_name = "First name is required.";
  if (!(input.surname ?? "").trim()) errors.surname = "Surname is required.";
  if (!(input.email ?? "").trim()) errors.email = "Email address is required.";
  else if (!isValidEmail(input.email as string)) errors.email = "Enter a valid email address.";
  if (!input.consent) errors.consent = "Please confirm the privacy statement to continue.";
  return errors;
}

export const registrationIsValid = (input: Partial<ViewerRegistration>) =>
  Object.keys(validateRegistration(input)).length === 0;

export type DeckViewer = {
  id: string;
  share_link_id: string;
  project_id: string;
  first_name: string;
  surname: string;
  email: string;
  consent_at: string;
  first_viewed_at: string;
  last_viewed_at: string;
};

export const viewerFullName = (v: Pick<DeckViewer, "first_name" | "surname">) =>
  `${v.first_name} ${v.surname}`.trim();

/** A stored viewer record only belongs to the link and project it was created for. */
export const viewerMatchesScope = (
  viewer: Pick<DeckViewer, "share_link_id" | "project_id">,
  scope: { share_link_id: string; project_id: string },
) => viewer.share_link_id === scope.share_link_id && viewer.project_id === scope.project_id;

/**
 * Legacy storage key prefix. Viewer access is NEVER persisted: this exists only
 * so older builds' stored sessions can be purged from browser storage.
 */
export const viewerSessionKey = (token: string) => `siyakha.deck.session.${token}`;

/* ------------------------------------------------------- client-safe BOQ view */

/** The only BOQ line fields a client may ever see. */
export const CLIENT_BOQ_LINE_KEYS = [
  "item_code",
  "description",
  "specification",
  "quantity",
  "unit",
  "customer_unit_rate",
  "line_total",
  "vat_applicable",
  "section",
] as const;

export const CLIENT_BOQ_HEADER_KEYS = [
  "id",
  "title",
  "revision_label",
  "version_no",
  "status",
  "vat_enabled",
  "vat_rate",
  "valid_until",
  "updated_at",
] as const;

export type ClientBoqLine = {
  item_code?: string | null;
  description: string;
  specification?: string | null;
  quantity: number;
  unit: string;
  customer_unit_rate: number;
  line_total: number;
  vat_applicable?: boolean | null;
  section?: string | null;
};

/** Rebuilds a line from the allowlist, dropping supplier / margin / internal data. */
export function toClientBoqLine(row: Record<string, unknown>): ClientBoqLine {
  const out: Record<string, unknown> = {};
  for (const key of CLIENT_BOQ_LINE_KEYS) if (key in row) out[key] = row[key] ?? null;
  return out as unknown as ClientBoqLine;
}

export const toClientBoqLines = (rows: readonly Record<string, unknown>[]) => rows.map(toClientBoqLine);

/** True when no allowlisted key is itself an internal commercial field. */
export const clientBoqAllowlistIsSafe = () => !CLIENT_BOQ_LINE_KEYS.some((k) => isSensitiveKey(k));

export type ClientBoqSection = { title: string; lines: ClientBoqLine[]; subtotal: number };

const round2 = (v: number) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

export function groupBoqSections(lines: readonly ClientBoqLine[]): ClientBoqSection[] {
  const map = new Map<string, ClientBoqLine[]>();
  for (const l of lines) {
    const key = (l.section ?? "Schedule").trim() || "Schedule";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(l);
  }
  return [...map.entries()].map(([title, rows]) => ({
    title,
    lines: rows,
    subtotal: round2(rows.reduce((n, r) => n + Number(r.line_total ?? 0), 0)),
  }));
}

export type BoqTotalsView = { subtotal: number; vat: number; total: number };

export function clientBoqTotals(
  lines: readonly ClientBoqLine[],
  opts: { vat_enabled?: boolean | null; vat_rate?: number | null },
): BoqTotalsView {
  let subtotal = 0;
  let vatable = 0;
  for (const l of lines) {
    const total = Number(l.line_total ?? 0);
    subtotal = round2(subtotal + total);
    if (l.vat_applicable !== false) vatable = round2(vatable + total);
  }
  const vat = opts.vat_enabled === false ? 0 : round2((vatable * Number(opts.vat_rate ?? 15)) / 100);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

export const BOQ_NOT_ISSUED_MESSAGE = "BOQ not yet issued for client review.";

/** Only an issued revision may be shown to a client — pricing is never synthesised. */
export const CLIENT_VISIBLE_BOQ_STATUSES = ["shared", "published", "approved"] as const;

export const isClientVisibleBoq = (boq: { status?: string | null } | null | undefined) =>
  !!boq && (CLIENT_VISIBLE_BOQ_STATUSES as readonly string[]).includes((boq.status ?? "").toLowerCase());

export const REVISION_SCOPE_NOTE =
  "The quantities and pricing shown belong to the BOQ revision displayed above. A new revision supersedes this schedule and requires a fresh review.";

/* --------------------------------------------------------- revision identity */

export type RevisionFingerprintInput = {
  boq_id: string;
  revision_label?: string | null;
  version_no?: number | null;
  line_count: number;
  subtotal: number;
  vat: number;
  total: number;
};

/**
 * Deterministic, immutable identifier for exactly one priced revision. Any
 * change to the revision label, line count or totals produces a different
 * fingerprint, so an earlier acceptance can never silently transfer.
 */
export function revisionFingerprint(input: RevisionFingerprintInput): string {
  const parts = [
    input.boq_id,
    (input.revision_label ?? "").trim(),
    String(input.version_no ?? 0),
    String(input.line_count),
    round2(input.subtotal).toFixed(2),
    round2(input.vat).toFixed(2),
    round2(input.total).toFixed(2),
  ].join("|");
  // FNV-1a 32-bit, twice with different offsets, for a short stable hex digest.
  const fnv = (seed: number) => {
    let h = seed;
    for (let i = 0; i < parts.length; i += 1) {
      h ^= parts.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };
  return `${fnv(0x811c9dc5)}${fnv(0x7fffffff)}`;
}

/* ------------------------------------------------------------- BOQ acceptance */

export const ACCEPTANCE_TERMS_VERSION = "2026-08-v1";

export const ACCEPTANCE_TERMS =
  "I confirm that I have reviewed this BOQ revision and accept it as the basis for the next project stage, subject to the stated terms, exclusions and final contract.";

export type BoqAcceptance = {
  id: string;
  project_id: string;
  boq_id: string;
  revision_label: string | null;
  revision_hash: string;
  viewer_id: string | null;
  full_name: string;
  email: string;
  po_reference: string | null;
  subtotal: number;
  vat: number;
  total: number;
  vat_rate: number;
  accepted_at: string;
  status: string;
};

export type AcceptanceState = "none" | "accepted" | "previous_revision";

export const PREVIOUS_REVISION_MESSAGE = "Accepted previous revision — new acceptance required.";

/**
 * Acceptance is always tied to one exact revision fingerprint. A newer revision
 * reports "previous_revision" rather than presenting the old acceptance as valid.
 */
export function acceptanceState(
  acceptances: readonly Pick<BoqAcceptance, "revision_hash" | "accepted_at">[],
  currentHash: string,
): AcceptanceState {
  if (!acceptances.length) return "none";
  if (acceptances.some((a) => a.revision_hash === currentHash)) return "accepted";
  return "previous_revision";
}

export type AcceptancePayload = {
  boq_id: string;
  revision_hash: string;
  confirmed: boolean;
  po_reference?: string;
  trigger?: "user" | "render" | "mount" | "effect";
};

/**
 * Guard in front of the single acceptance write path. Viewing a deck, opening
 * the BOQ tab or registering as a viewer can never satisfy this.
 */
export function assertAcceptanceAllowed(payload: AcceptancePayload): void {
  if ((payload.trigger ?? "user") !== "user")
    throw new Error("An acceptance requires the viewer to click Accept BOQ.");
  if (!payload.confirmed) throw new Error("The acceptance confirmation must be checked.");
  if (!payload.boq_id) throw new Error("An acceptance must reference a BOQ revision.");
  if (!payload.revision_hash) throw new Error("An acceptance must reference an exact revision fingerprint.");
}

export const PO_REFERENCE_MAX = 60;

export const cleanPoReference = (value: string | null | undefined) =>
  (value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, PO_REFERENCE_MAX) || null;

/* ------------------------------------------------------------- project notes */

export const NOTE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "boq", label: "BOQ" },
  { value: "plans", label: "Plans" },
  { value: "programme", label: "Programme" },
  { value: "technical", label: "Technical" },
  { value: "site_safety", label: "Site / safety" },
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number]["value"];

export const parseNoteCategory = (value: string | null | undefined): NoteCategory =>
  NOTE_CATEGORIES.find((c) => c.value === value)?.value ?? "general";

export const NOTE_STATUSES = ["open", "replied", "resolved"] as const;
export type NoteStatus = (typeof NOTE_STATUSES)[number];

export const NOTE_MIN = 3;
export const NOTE_MAX = 2000;

/** Plain text only: control characters stripped, no markup interpretation. */
export function sanitizeNoteBody(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, NOTE_MAX);
}

export function validateNote(body: string): string | null {
  const clean = sanitizeNoteBody(body);
  if (clean.length < NOTE_MIN) return "Please write a little more detail.";
  if (body.length > NOTE_MAX) return `Notes are limited to ${NOTE_MAX} characters.`;
  return null;
}

export type ClientNoteMessage = {
  id: string;
  thread_id: string;
  project_id: string;
  author_kind: "client" | "siyakha";
  author_name: string;
  body: string;
  created_at: string;
};

export type ClientNoteThread = {
  id: string;
  project_id: string;
  share_link_id: string | null;
  viewer_id: string | null;
  category: NoteCategory;
  subject: string | null;
  status: NoteStatus;
  created_at: string;
  last_message_at: string;
  messages: ClientNoteMessage[];
};

/** Threads never cross a project or a share link on the client surface. */
export function scopeThreads<T extends { project_id: string; share_link_id: string | null }>(
  threads: readonly T[],
  scope: { project_id: string; share_link_id: string },
): T[] {
  return threads.filter((t) => t.project_id === scope.project_id && t.share_link_id === scope.share_link_id);
}

export function threadCounts(threads: readonly { status: string }[]) {
  const count = (s: string) => threads.filter((t) => t.status === s).length;
  return { total: threads.length, open: count("open"), replied: count("replied"), resolved: count("resolved") };
}

/** Simple client-side spam guard; the server applies its own rate limit. */
export const NOTE_RATE_WINDOW_MS = 60_000;
export const NOTE_RATE_MAX = 5;

export function noteRateExceeded(timestamps: readonly number[], now = Date.now()) {
  return timestamps.filter((t) => now - t < NOTE_RATE_WINDOW_MS).length >= NOTE_RATE_MAX;
}
