import { supabase } from "@/integrations/supabase/client";
import { generateToken, hashToken } from "@/lib/shareLinks";

/**
 * Admin-side data access for the site-delivery layer (daily site updates,
 * photos, issues, floor progress and the two guest links).
 *
 * Guest access never uses these functions — technicians and clients go through
 * the `site-delivery` edge function, which validates the share token first.
 */

const db = supabase as unknown as { from: (t: string) => any };

export const SITE_PHOTO_BUCKET = "site-progress";

export type PhotoCategory = "before" | "during" | "after" | "issue" | "completed";

export const PHOTO_CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "during", label: "During" },
  { value: "after", label: "After" },
  { value: "issue", label: "Issue" },
  { value: "completed", label: "Completed work" },
];

export const ISSUE_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const ISSUE_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

/**
 * Client requirement (written request, 15 Sep 2026): every daily report must be
 * accompanied by site photographs taken with the approved Timestamp App.
 */
export const TIMESTAMP_EVIDENCE_NOTICE =
  "Client requirement: take site photos using the approved Timestamp App, then upload them here.";

/** Diary categories. Free text in the database, so this list can grow freely. */
export const UPDATE_CATEGORIES = [
  "Health & Safety",
  "Cabling",
  "Site Work",
  "Site Constraint",
  "Procurement",
  "Additional Routing",
  "Testing & Commissioning",
  "Snagging",
  "Delay / Standing Time",
  "Other",
] as const;

/**
 * Scope baseline categories taken from the existing Sun International network
 * infrastructure scope of works. Office reporting only — quantities live in the
 * scope document and are never restated or invented here.
 */
export const BASELINE_CATEGORIES = [
  "LAN Move",
  "LAN New Install",
  "WiFi Access Points",
  "Surveillance Cameras",
  "Biometric Readers",
] as const;

/* ------------------------------------------- additional / out-of-scope work */

export const SCOPE_STATUSES = [
  { value: "identified", label: "Identified" },
  { value: "under_review", label: "Under review" },
  { value: "approved_to_proceed", label: "Approved to proceed" },
  { value: "completed", label: "Completed" },
  { value: "not_proceeding", label: "Not proceeding" },
] as const;

export const SCOPE_SOURCES = [
  { value: "field_update", label: "Field engineer update" },
  { value: "admin_update", label: "Office update" },
  { value: "client_instruction", label: "Client instruction" },
  { value: "site_condition", label: "Site condition" },
] as const;

/**
 * Operational register of additional works identified on site. Deliberately
 * carries no rates, costs, margins or totals — commercial decisions are handled
 * outside this project workflow.
 */
export type ScopeChange = {
  id: string;
  project_id: string;
  floor_id: string | null;
  update_id: string | null;
  issue_id: string | null;
  work_date: string;
  area_label: string | null;
  title: string;
  description: string | null;
  trigger_reason: string | null;
  source: string;
  baseline_category: string | null;
  status: string;
  internal_notes: string | null;
  client_visible: boolean;
  raised_by_name: string | null;
  created_at: string;
};

export const scopeStatusLabel = (value: string) =>
  SCOPE_STATUSES.find((s) => s.value === value)?.label ?? value.replace(/_/g, " ");

export const scopeSourceLabel = (value: string) =>
  SCOPE_SOURCES.find((s) => s.value === value)?.label ?? value.replace(/_/g, " ");

export async function addScopeChange(input: {
  project_id: string;
  work_date: string;
  title: string;
  description?: string;
  trigger_reason?: string;
  floor_id?: string | null;
  update_id?: string | null;
  area_label?: string;
  source?: string;
  baseline_category?: string | null;
  raised_by_name?: string;
}) {
  if (!input.title.trim()) throw new Error("Give the additional work a short title.");
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await db.from("portal_scope_changes").insert({
    project_id: input.project_id,
    work_date: input.work_date,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    trigger_reason: input.trigger_reason?.trim() || null,
    floor_id: input.floor_id || null,
    update_id: input.update_id || null,
    area_label: input.area_label?.trim() || null,
    source: input.source ?? "site_condition",
    baseline_category: input.baseline_category || null,
    status: "under_review",
    client_visible: false,
    raised_by_name: input.raised_by_name?.trim() || null,
    created_by: auth.user?.id ?? null,
  });
  if (error) throw error;
}

export async function patchScopeChange(id: string, patch: Partial<ScopeChange>) {
  const { error } = await db.from("portal_scope_changes").update(patch).eq("id", id);
  if (error) throw error;
}

export type ApprovalStatus = "draft" | "submitted" | "approved" | "locked";

export type SiteUpdate = {
  id: string;
  project_id: string;
  floor_id: string | null;
  area_label: string | null;
  shift_date: string;
  submitted_at: string;
  submitted_by_name: string;
  source: string;
  category: string | null;
  photos_outstanding: boolean;
  baseline_category: string | null;
  backdated: boolean;
  photo_evidence_required: boolean;
  photo_evidence_override_reason: string | null;
  photo_evidence_override_by: string | null;
  photo_evidence_override_at: string | null;
  work_completed: string | null;
  work_outstanding: string | null;
  blockers: string | null;
  materials_required: string | null;
  team_onsite: string | null;
  progress_pct: number;
  next_shift_plan: string | null;
  notes: string | null;
  internal_notes: string | null;
  client_visible: boolean;
  approval_status: ApprovalStatus;
  approved_at: string | null;
  published_at: string | null;
  locked_at: string | null;
};

export type SitePhoto = {
  id: string;
  update_id: string | null;
  issue_id: string | null;
  floor_id: string | null;
  category: PhotoCategory;
  caption: string | null;
  storage_path: string;
  original_storage_path: string | null;
  original_filename: string | null;
  original_file_size: number | null;
  exif_captured_at: string | null;
  uploaded_at: string;
  timestamp_confirmed: boolean;
  taken_at: string;
  client_visible: boolean;
  sort_order: number;
};

export type SiteIssue = {
  id: string;
  project_id: string;
  update_id: string | null;
  floor_id: string | null;
  location_note: string | null;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  reported_by_name: string | null;
  client_visible: boolean;
  internal_only: boolean;
  opened_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
};

export type FloorProgress = {
  id: string;
  floor_id: string;
  progress_pct: number;
  status: string;
  admin_override: boolean;
  note: string | null;
  updated_at: string;
};

export type FieldAccess = {
  id: string;
  project_id: string;
  share_link_id: string;
  technician_name: string;
  technician_email: string | null;
  role_label: string;
  device_label: string | null;
  device_expires_at: string | null;
  last_seen_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type DeliveryLink = {
  id: string;
  title: string;
  link_role: "client" | "field";
  assignee_label: string | null;
  recipient_label: string | null;
  expires_at: string;
  revoked_at: string | null;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
};

export type SiteFloor = {
  id: string;
  level_number: number;
  display_name: string;
  floor_use: string | null;
  plan_image_path: string | null;
  client_visible: boolean;
  sort_order: number;
};

/* --------------------------------------------------------------- link paths */

export const fieldUrl = (token: string) => `${window.location.origin}/field/${token}`;
export const clientProgressUrl = (token: string) => `${window.location.origin}/site-progress/${token}`;

/* ------------------------------------------------------------------- loaders */

export async function loadSiteDelivery(projectId: string) {
  const [floors, progress, updates, photos, issues, links, access, scope] = await Promise.all([
    db.from("portal_floors").select("id, level_number, display_name, floor_use, plan_image_path, client_visible, sort_order")
      .eq("project_id", projectId).order("sort_order"),
    db.from("portal_floor_progress").select("*").eq("project_id", projectId),
    db.from("portal_site_updates").select("*").eq("project_id", projectId).order("shift_date", { ascending: false }).order("submitted_at", { ascending: false }),
    db.from("portal_site_update_photos").select("*").eq("project_id", projectId).order("sort_order"),
    db.from("portal_site_issues").select("*").eq("project_id", projectId).order("opened_at", { ascending: false }),
    db.from("portal_share_links").select("id, title, link_role, assignee_label, recipient_label, expires_at, revoked_at, access_count, last_accessed_at, created_at")
      .eq("project_id", projectId).eq("resource_type", "site_delivery").order("created_at", { ascending: false }),
    db.from("portal_field_access").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    db.from("portal_scope_changes").select("*").eq("project_id", projectId).order("work_date", { ascending: false }),
  ]);
  const firstError = [floors, progress, updates, photos, issues, links, access, scope].find((r: any) => r.error)?.error;
  if (firstError) throw firstError;
  return {
    floors: (floors.data ?? []) as SiteFloor[],
    progress: (progress.data ?? []) as FloorProgress[],
    updates: (updates.data ?? []) as SiteUpdate[],
    photos: (photos.data ?? []) as SitePhoto[],
    issues: (issues.data ?? []) as SiteIssue[],
    links: (links.data ?? []) as DeliveryLink[],
    access: (access.data ?? []) as FieldAccess[],
    scopeChanges: (scope.data ?? []) as ScopeChange[],
  };
}

export type SiteDeliveryData = Awaited<ReturnType<typeof loadSiteDelivery>>;

/* -------------------------------------------------------- photo evidence */

export type EvidenceState = {
  photoCount: number;
  confirmedCount: number;
  required: boolean;
  overridden: boolean;
  /** True when the day may be treated as complete / publishable to the client. */
  satisfied: boolean;
};

export const evidenceState = (
  update: Pick<SiteUpdate, "photo_evidence_required" | "photo_evidence_override_reason">,
  photos: Pick<SitePhoto, "update_id" | "timestamp_confirmed">[],
  updateId: string,
): EvidenceState => {
  const mine = photos.filter((p) => p.update_id === updateId);
  const overridden = !!update.photo_evidence_override_reason?.trim();
  const required = update.photo_evidence_required !== false;
  return {
    photoCount: mine.length,
    confirmedCount: mine.filter((p) => p.timestamp_confirmed).length,
    required,
    overridden,
    satisfied: !required || overridden || mine.length > 0,
  };
};

/** Per-day compliance indicators shown on the admin dashboard. */
export const complianceFlags = (update: SiteUpdate, evidence: EvidenceState) => [
  { label: "Daily report submitted", done: true },
  {
    label: evidence.overridden && !evidence.photoCount ? "Photo evidence waived" : "Timestamped photos received",
    done: evidence.photoCount > 0 || evidence.overridden,
  },
  { label: "Admin approved", done: update.approval_status === "approved" || update.approval_status === "locked" },
  { label: "Client published", done: !!update.client_visible && !!update.published_at },
];

export const EVIDENCE_BLOCKED_MESSAGE =
  "This daily report has no site photos yet. Attach the timestamped photos, or record an override reason first.";

/** Records why the office is publishing a day without photo evidence. */
export async function overridePhotoEvidence(id: string, reason: string) {
  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Give a reason for waiving the photo requirement.");
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await db.from("portal_site_updates").update({
    photo_evidence_override_reason: trimmed,
    photo_evidence_override_by: auth.user?.id ?? null,
    photo_evidence_override_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

/* ------------------------------------------------------------ admin actions */

export async function approveUpdate(id: string, clientVisible: boolean, evidence?: EvidenceState) {
  if (clientVisible && evidence && !evidence.satisfied) throw new Error(EVIDENCE_BLOCKED_MESSAGE);
  const now = new Date().toISOString();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await db.from("portal_site_updates").update({
    approval_status: "approved",
    client_visible: clientVisible,
    approved_at: now,
    approved_by: auth.user?.id ?? null,
    published_at: clientVisible ? now : null,
  }).eq("id", id);
  if (error) throw error;
}

export async function setUpdateVisibility(id: string, clientVisible: boolean, evidence?: EvidenceState) {
  if (clientVisible && evidence && !evidence.satisfied) throw new Error(EVIDENCE_BLOCKED_MESSAGE);
  const { error } = await db.from("portal_site_updates")
    .update({ client_visible: clientVisible, published_at: clientVisible ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function lockUpdate(id: string) {
  const { error } = await db.from("portal_site_updates")
    .update({ approval_status: "locked", locked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function unlockUpdate(id: string) {
  const { error } = await db.from("portal_site_updates")
    .update({ approval_status: "approved", locked_at: null })
    .eq("id", id);
  if (error) throw error;
}

export async function setPhotoVisibility(id: string, clientVisible: boolean) {
  const { error } = await db.from("portal_site_update_photos").update({ client_visible: clientVisible }).eq("id", id);
  if (error) throw error;
}

/** Office correction of the engineer's timestamp declaration. */
export async function setPhotoTimestampConfirmed(id: string, confirmed: boolean) {
  const { error } = await db.from("portal_site_update_photos").update({ timestamp_confirmed: confirmed }).eq("id", id);
  if (error) throw error;
}

export async function patchIssue(id: string, patch: Partial<SiteIssue>) {
  const { error } = await db.from("portal_site_issues").update(patch).eq("id", id);
  if (error) throw error;
}

export async function setFloorProgress(projectId: string, floorId: string, progress_pct: number, status: string, note?: string | null) {
  const { error } = await db.from("portal_floor_progress").upsert(
    {
      project_id: projectId,
      floor_id: floorId,
      progress_pct: Math.min(100, Math.max(0, Math.round(progress_pct))),
      status,
      admin_override: true,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id,floor_id" },
  );
  if (error) throw error;
}

/* --------------------------------------------------------------- link issue */

export async function issueDeliveryLink(input: {
  project_id: string;
  client_id?: string | null;
  title: string;
  role: "client" | "field";
  assignee_label?: string | null;
  technician_email?: string | null;
  days: number;
}) {
  const token = generateToken();
  const token_hash = await hashToken(token);
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await db.from("portal_share_links").insert({
    token_hash,
    resource_type: "site_delivery",
    resource_id: null,
    title: input.title,
    project_id: input.project_id,
    client_id: input.client_id ?? null,
    snapshot: {},
    permission_scope: input.role === "field" ? "view_comment" : "view",
    download_allowed: false,
    comments_allowed: input.role === "field",
    approval_allowed: false,
    require_client_login: false,
    live_project_view: false,
    link_role: input.role,
    assignee_label: input.assignee_label?.trim() || null,
    recipient_label: input.assignee_label?.trim() || null,
    expires_at: new Date(Date.now() + Math.max(1, input.days) * 86400000).toISOString(),
    created_by: auth.user?.id ?? null,
  }).select("id").maybeSingle();
  if (error) throw error;

  if (input.role === "field") {
    const { error: accessError } = await db.from("portal_field_access").insert({
      project_id: input.project_id,
      share_link_id: data.id,
      technician_name: input.assignee_label?.trim() || "Field technician",
      technician_email: input.technician_email?.trim() || null,
    });
    if (accessError) throw accessError;
  }

  return { url: input.role === "field" ? fieldUrl(token) : clientProgressUrl(token) };
}

export async function revokeDeliveryLink(id: string) {
  const now = new Date().toISOString();
  const { error } = await db.from("portal_share_links").update({ revoked_at: now }).eq("id", id);
  if (error) throw error;
  await db.from("portal_field_access")
    .update({ revoked_at: now, device_session_hash: null, device_expires_at: null })
    .eq("share_link_id", id);
}

export async function forgetDevice(accessId: string) {
  const { error } = await db.from("portal_field_access")
    .update({ device_session_hash: null, device_expires_at: null, device_label: null })
    .eq("id", accessId);
  if (error) throw error;
}

/* ------------------------------------------------------------ pure helpers */

export const overallProgress = (progress: { progress_pct: number }[]) =>
  progress.length ? Math.round(progress.reduce((s, p) => s + (p.progress_pct ?? 0), 0) / progress.length) : 0;

export const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);

export const updatedToday = (updates: { shift_date: string }[]) => updates.some((u) => isToday(u.shift_date));

/** Groups updates into a newest-first daily timeline. */
export function dailyTimeline<T extends { shift_date: string }>(updates: T[]) {
  const map = new Map<string, T[]>();
  for (const u of updates) {
    const list = map.get(u.shift_date) ?? [];
    list.push(u);
    map.set(u.shift_date, list);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([date, rows]) => ({ date, rows }));
}

export function deliveryCounts(data: {
  updates: SiteUpdate[];
  photos: SitePhoto[];
  issues: SiteIssue[];
}) {
  return {
    updates: data.updates.length,
    awaitingApproval: data.updates.filter((u) => u.approval_status === "submitted").length,
    photos: data.photos.length,
    daysMissingEvidence: data.updates.filter(
      (u) => !evidenceState(u, data.photos, u.id).satisfied,
    ).length,
    openIssues: data.issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
    blockers: data.updates.filter((u) => !!u.blockers?.trim()).length,
    outstanding: data.updates.filter((u) => !!u.work_outstanding?.trim()).length,
  };
}

export const severityTone = (s: string) =>
  s === "critical" || s === "high" ? "border-foreground font-semibold" : "border-muted-foreground text-muted-foreground";
