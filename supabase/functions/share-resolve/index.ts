// Public resolver for branded client share links (/share/:token, /project-deck/:token).
//
// Security model:
//  - The stored snapshot is never trusted: it is re-sanitised against an explicit
//    key allowlist before it leaves this function.
//  - Storage paths are only signed after the database confirms the path belongs to
//    the shared project and to a current, client-visible row.
//  - Rate keys are HMACs over the server-trusted request address, never plain hashes.
//  - Acceptance is delegated to one transactional, idempotent database function.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Guest documents must never be cached, indexed, framed or referrer-leaked.
const privacyHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, ...privacyHeaders, "Content-Type": "application/json" },
  });

/** Keyed HMAC so a leaked log row cannot be reversed to an address or token. */
const hmacKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const hmac = async (value: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(hmacKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Generic response for missing / expired / revoked links so link existence never leaks.
const NOT_AVAILABLE = { state: "unavailable" as const };

const ACTIONS = new Set(["view", "comment", "approve"]);

/* ------------------------------------------------------------- sanitisation */

const pick = (row: unknown, keys: string[]) => {
  if (!row || typeof row !== "object") return null;
  const src = row as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in src) out[k] = src[k] ?? null;
  return out;
};

const pickList = (rows: unknown, keys: string[]) =>
  (Array.isArray(rows) ? rows : []).map((r) => pick(r, keys)).filter(Boolean) as Record<string, unknown>[];

const MARKER_KEYS = [
  "id", "floor_id", "marker_type", "label", "status", "discipline", "equipment", "model", "area",
  "x_norm", "y_norm", "is_placed", "direction_deg", "fov_deg", "coverage_range", "mounting_height_m",
  "environment", "lens_model", "radio_band", "ssid", "vlan", "switch_port", "nvr_id", "nvr_channel",
  "serial_number", "mac_address",
];
const ASSET_KEYS = [
  "id", "marker_id", "lifecycle_status", "asset_tag", "serial_number", "mac_address", "ip_address",
  "manufacturer", "model", "warranty_expiry", "installer", "installed_on", "test_result", "tested_on",
  "commissioned_on", "rack_label", "switch_label", "switch_port", "patch_panel", "patch_panel_port",
  "nvr_label", "nvr_channel", "area",
];
const FLOOR_KEYS = ["id", "level_number", "display_name", "floor_use", "notes", "plan_image_path"];
const CABLE_KEYS = [
  "id", "route_label", "cable_type", "service_type", "route_kind", "status", "source_label",
  "destination_label", "estimated_length_m", "measured_length_m", "floor_id", "waypoints",
  "patch_panel", "patch_panel_port", "switch_port", "fibre_strands",
];
const RACK_KEYS = [
  "id", "rack_marker_id", "floor_id", "equipment_name", "equipment_type", "manufacturer", "model",
  "description", "rack_units", "rack_position", "quantity", "role", "copper_ports", "sfp_ports",
  "sfp_plus_ports", "port_type", "poe_capable", "network_layer", "status",
];
const NVR_KEYS = ["id", "label", "manufacturer", "model", "channel_count", "channel_from", "channel_to", "status", "rack_marker_id"];
const BOQ_LINE_KEYS = [
  "item_code", "description", "specification", "quantity", "unit", "customer_unit_rate", "line_total",
  "vat_applicable", "line_kind", "discipline", "work_package", "section", "qty_procured", "qty_received",
  "qty_installed", "qty_tested", "qty_commissioned",
];
const PROJECT_KEYS = [
  "id", "title", "reference", "address", "status", "consultant", "description", "site_context",
  "objectives", "stakeholders", "planning_narrative", "design_concept", "project_approach",
  "start_date", "target_date",
];

/**
 * Rebuilds the client-visible document from an explicit allowlist. Anything the
 * stored JSON carries beyond these keys — costs, markups, suppliers, internal
 * notes, actor IDs, activity, raw audit JSON — is dropped here.
 */
const sanitiseSnapshot = (raw: unknown) => {
  const s = (raw ?? {}) as Record<string, any>;

  // Proposal / costing documents share the proposal document shape.
  const proposal = s.proposal
    ? {
        ...pick(s.proposal, [
          "proposal_number", "revision_label", "title", "status", "executive_summary",
          "project_understanding", "scope_of_work", "methodology", "deliverables", "assumptions",
          "exclusions", "warranty_terms", "payment_terms", "validity_days", "planned_start_date",
          "planned_completion_date", "prepared_by_name", "prepared_by_email", "issued_at",
          "client_name", "project_title", "site_name", "vat_enabled", "vat_rate", "totals",
        ]),
        lines: pickList(s.proposal.lines, BOQ_LINE_KEYS),
      }
    : undefined;

  const boqSnapshot = s.boq_snapshot
    ? {
        ...pick(s.boq_snapshot, ["title", "revision_label", "version_no", "vat_enabled", "vat_rate", "valid_until", "notes", "totals", "client_name", "project_title"]),
        lines: pickList(s.boq_snapshot.lines ?? s.boq_snapshot.items, BOQ_LINE_KEYS),
      }
    : undefined;

  const out: Record<string, unknown> = {
    generated_at: s.generated_at ?? null,
    revision_no: s.revision_no ?? null,
    lifecycle_stage: s.lifecycle_stage ?? null,
    client: pick(s.client, ["id", "display_name", "contact_name", "contact_email", "phone"]),
    site: pick(s.site, ["id", "name", "address", "city", "province", "venue_type", "contact_name", "contact_email", "contact_phone"]),
    project: pick(s.project, PROJECT_KEYS),
    narrative: pick(s.narrative, [
      "executive_summary", "project_understanding", "scope_of_work", "methodology", "deliverables",
      "assumptions", "exclusions", "warranty_terms", "payment_terms", "validity_days",
      "planned_start_date", "planned_completion_date", "proposal_number", "proposal_revision",
    ]),
    floors: (Array.isArray(s.floors) ? s.floors : []).map((f: any) => ({
      ...pick(f, FLOOR_KEYS),
      markers: pickList(f?.markers, MARKER_KEYS).map((m, i) => {
        const src = (f.markers ?? [])[i] ?? {};
        return { ...m, asset: pick(src.asset, ASSET_KEYS) };
      }),
    })),
    nvrs: pickList(s.nvrs, NVR_KEYS),
    cables: pickList(s.cables, CABLE_KEYS),
    rackEquipment: pickList(s.rackEquipment, RACK_KEYS),
    boq: pick(s.boq, ["id", "title", "revision_label", "version_no", "vat_enabled", "vat_rate", "valid_until", "notes"]),
    boqLines: pickList(s.boqLines, BOQ_LINE_KEYS),
    totals: pick(s.totals, ["subtotal", "vat", "total"]),
    variations: pickList(s.variations, ["id", "reference", "title", "description", "discipline", "status", "customer_amount", "raised_on", "decided_on"]),
    tasks: pickList(s.tasks, ["id", "title", "owner", "priority", "due_date", "status"]),
    milestones: pickList(s.milestones, ["id", "title", "detail", "due_date", "status"]),
    planRevisions: pickList(s.planRevisions, ["id", "floor_id", "revision_label", "page_number", "page_count", "is_current", "created_at"]),
    proposals: pickList(s.proposals, ["id", "proposal_number", "revision_label", "status", "issued_at", "created_at"]),
    assets: pickList(s.assets, ASSET_KEYS),
    gallery: pickList(s.gallery, ["id", "caption", "taken_at", "storage_path"]),
    documents: pickList(s.documents, ["id", "title", "category", "version", "document_date", "reference"]),
    // Internal registers are structurally absent from guest snapshots.
    queries: [],
    activity: [],
    stageHistory: [],
  };
  if (proposal) out.proposal = proposal;
  if (boqSnapshot) out.boq_snapshot = boqSnapshot;
  return out;
};

/* ------------------------------------------------------------- live overlay */

/**
 * Replaces ONLY the saved-design portions of a frozen snapshot with the current
 * client-visible design for the link's own trusted project id. Narrative,
 * commercial, BOQ, proposal and milestone data always stay frozen.
 *
 * Fails closed: any query error returns null and the caller keeps the snapshot.
 */
const liveDesignOverlay = async (
  admin: ReturnType<typeof createClient>,
  projectId: string,
  snapshot: Record<string, any>,
) => {
  const [floors, markers, racks, cables] = await Promise.all([
    admin
      .from("portal_floors")
      .select("id, level_number, display_name, floor_use, notes, plan_image_path")
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .order("level_number", { ascending: true }),
    admin
      .from("portal_floor_markers")
      .select(MARKER_KEYS.join(", "))
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .eq("is_placed", true)
      .is("archived_at", null),
    admin
      .from("portal_rack_equipment")
      .select(RACK_KEYS.join(", "))
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .is("archived_at", null),
    admin
      .from("portal_cable_routes")
      .select(CABLE_KEYS.join(", "))
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .is("archived_at", null),
  ]);
  if (floors.error || markers.error || racks.error || cables.error) return null;

  const byFloor = new Map<string, Record<string, unknown>[]>();
  for (const m of pickList(markers.data, MARKER_KEYS)) {
    const key = String(m.floor_id ?? "");
    if (!byFloor.has(key)) byFloor.set(key, []);
    byFloor.get(key)!.push(m);
  }

  return {
    ...snapshot,
    floors: pickList(floors.data, FLOOR_KEYS).map((f) => ({
      ...f,
      markers: byFloor.get(String(f.id ?? "")) ?? [],
    })),
    rackEquipment: pickList(racks.data, RACK_KEYS),
    cables: pickList(cables.data, CABLE_KEYS),
  };
};

/* ------------------------------------------------------------------- handler */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, ...privacyHeaders } });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  let token = "";
  let action = "view";
  let message = "";
  let accessToken = "";
  let refresh = false;
  try {
    const body = await req.json();
    refresh = body?.refresh === true;
    token = String(body?.token ?? "").slice(0, 200);
    action = String(body?.action ?? "view").slice(0, 20);
    message = String(body?.message ?? "").slice(0, 2000);
    accessToken = String(body?.access_token ?? "").slice(0, 4000);
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!ACTIONS.has(action)) return json({ error: "Unsupported action" }, 400);
  if (!/^[A-Za-z0-9_-]{20,120}$/.test(token)) return json(NOT_AVAILABLE, 200);

  // Server-trusted address data only (never a client-supplied header value).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";
  const ipHash = await hmac(`share:ip:${ip}`);
  const tokenHash = await sha256(token);
  const rateKey = await hmac(`share:token:${tokenHash}:${action}`);
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  // Rate limiting for guest links: per address, and per token+action.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const [ipCount, keyCount] = await Promise.all([
    admin.from("portal_share_access_log").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("accessed_at", since),
    admin.from("portal_share_access_log").select("id", { count: "exact", head: true }).eq("rate_key", rateKey).gte("accessed_at", since),
  ]);
  // Fail closed: a counting error must not open the gate.
  if (ipCount.error || keyCount.error) return json({ state: "rate_limited" }, 429);
  const perActionCap = action === "view" ? 60 : 10;
  if ((ipCount.count ?? 0) >= 60 || (keyCount.count ?? 0) >= perActionCap) return json({ state: "rate_limited" }, 429);

  const { data: link, error: linkErr } = await admin
    .from("portal_share_links")
    .select(
      "id, project_id, client_id, resource_type, resource_id, revision_label, title, snapshot, permission_scope, download_allowed, comments_allowed, approval_allowed, require_client_login, live_project_view, recipient_label, expires_at, revoked_at, access_count, first_accessed_at",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (linkErr) return json(NOT_AVAILABLE, 200);

  const log = (outcome: string, detail?: string) =>
    admin.from("portal_share_access_log").insert({
      share_link_id: link?.id ?? null,
      ip_hash: ipHash,
      rate_key: rateKey,
      user_agent: userAgent,
      action,
      outcome,
      detail: detail ?? null,
    });

  if (!link) {
    await log("not_found");
    return json(NOT_AVAILABLE, 200);
  }
  if (link.revoked_at) {
    await log("revoked");
    return json({ state: "revoked" }, 200);
  }
  if (new Date(link.expires_at).getTime() < Date.now()) {
    await log("expired");
    return json({ state: "expired" }, 200);
  }

  // Relationship validation: the link must point at its own project's client.
  const { data: proj, error: projErr } = await admin
    .from("portal_projects")
    .select("id, client_id")
    .eq("id", link.project_id)
    .maybeSingle();
  if (projErr || !proj || (link.client_id && proj.client_id !== link.client_id)) {
    await log("denied", "relationship mismatch");
    return json(NOT_AVAILABLE, 200);
  }

  // Optional "client login required" mode: the visitor must present a valid
  // session belonging to an active portal user of the same client. Verified for
  // every action, not only the initial view.
  let sessionUserId: string | null = null;
  if (link.require_client_login) {
    let ok = false;
    if (accessToken) {
      const { data: u } = await admin.auth.getUser(accessToken);
      if (u?.user) {
        const { data: cu } = await admin
          .from("portal_client_users")
          .select("id")
          .eq("user_id", u.user.id)
          .eq("client_id", link.client_id)
          .eq("status", "active")
          .maybeSingle();
        ok = !!cu;
        if (ok) sessionUserId = u.user.id;
      }
    }
    if (!ok) {
      await log("login_required");
      return json({ state: "login_required" }, 200);
    }
  }

  if (action === "comment") {
    if (!link.comments_allowed) {
      await log("denied", "comments not permitted");
      return json({ state: "denied" }, 403);
    }
    if (!message.trim()) return json({ error: "A message is required" }, 400);
    const { error } = await admin.from("portal_queries").insert({
      project_id: link.project_id,
      subject: `Shared document query — ${link.title}`,
      message: `${message}\n\n(Submitted from share link${link.recipient_label ? ` for ${link.recipient_label}` : ""}.)`,
      status: "open",
    });
    if (error) {
      await log("error", "query not stored");
      return json({ error: "Could not submit" }, 500);
    }
    await log("granted", "comment submitted");
    return json({ state: "ok" });
  }

  if (action === "approve") {
    if (!link.approval_allowed) {
      await log("denied", "approval not permitted");
      return json({ state: "denied" }, 403);
    }
    const snapshotHash = await sha256(JSON.stringify(link.snapshot ?? {}));
    const { data: res, error } = await admin.rpc("portal_share_accept", {
      _share_link_id: link.id,
      _snapshot_hash: snapshotHash,
      _user_id: sessionUserId,
      _note: message || null,
    });
    if (error) {
      await log("error", "acceptance failed");
      return json({ error: "Could not record acceptance" }, 500);
    }
    const out = res as { ok: boolean; reason?: string };
    if (!out?.ok) {
      await log("denied", out?.reason ?? "acceptance rejected");
      return json({ state: out?.reason === "unavailable" ? "unavailable" : "denied" }, out?.reason === "unavailable" ? 200 : 403);
    }
    await log("granted", "approval recorded");
    return json({ state: "ok" });
  }

  // View: re-sanitise the stored JSON, then sign only verified project images.
  let snapshot = sanitiseSnapshot(link.snapshot);

  // Live project view: saved plan/device data only, and only for project packs.
  const liveEligible = link.live_project_view === true && link.resource_type === "project_pack";
  let liveUpdatedAt: string | null = null;
  if (liveEligible) {
    const live = await liveDesignOverlay(admin, link.project_id, snapshot);
    if (!live) {
      await log("error", "live design unavailable");
      return json({ state: "unavailable" }, 200);
    }
    snapshot = live as typeof snapshot;
    liveUpdatedAt = new Date().toISOString();
  }

  const signIfOwned = async (path: unknown) => {
    if (typeof path !== "string" || !path) return null;
    const { data: allowed, error } = await admin.rpc("portal_share_path_allowed", {
      _project_id: link.project_id,
      _path: path,
    });
    if (error || allowed !== true) return null;
    const bucket = path.includes("/photos/") ? "client-photos" : "client-documents";
    const { data } = await admin.storage.from(bucket).createSignedUrl(path, 900);
    return data?.signedUrl ?? null;
  };

  for (const f of snapshot.floors as Record<string, unknown>[]) {
    const url = await signIfOwned(f.plan_image_path);
    delete f.plan_image_path;
    f.plan_image_url = url;
  }
  for (const g of snapshot.gallery as Record<string, unknown>[]) {
    const path = g.storage_path;
    delete g.storage_path;
    g.photo_url =
      (await (async () => {
        if (typeof path !== "string" || !path) return null;
        const { data: allowed, error } = await admin.rpc("portal_share_path_allowed", {
          _project_id: link.project_id,
          _path: path,
        });
        if (error || allowed !== true) return null;
        const { data } = await admin.storage.from("client-photos").createSignedUrl(path, 900);
        return data?.signedUrl ?? null;
      })()) ?? null;
  }

  // Background refreshes are still rate-limited and logged, but must not inflate
  // the unique/initial view statistics for the link.
  if (!refresh) await admin.rpc("portal_share_register_view", { _share_link_id: link.id });
  await log("granted", refresh ? "live refresh" : null);

  return json({
    state: "ok",
    link: {
      resource_type: link.resource_type,
      title: link.title,
      revision_label: link.revision_label,
      expires_at: link.expires_at,
      permission_scope: link.permission_scope,
      download_allowed: link.download_allowed,
      comments_allowed: link.comments_allowed,
      approval_allowed: link.approval_allowed,
      live_project_view: liveEligible,
    },
    live_updated_at: liveUpdatedAt,
    snapshot,
  });
});
