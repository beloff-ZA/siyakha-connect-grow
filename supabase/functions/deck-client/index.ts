// Client project-deck engagement API for /project-deck/:token.
//
// Security model:
//  - Every action is validated against the share token FIRST. Nothing about the
//    project or client is returned until viewer registration succeeds.
//  - The viewer session is an opaque random token; only its SHA-256 hash is stored.
//  - All reads are explicit column allowlists, so supplier cost, markup, margin,
//    internal notes and private attachments are structurally absent.
//  - No email or notification is ever sent from here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const privacyHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, ...privacyHeaders, "Content-Type": "application/json" },
  });

const hex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256 = async (v: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)));

const hmacKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const hmac = async (value: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(hmacKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
};

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const NOT_AVAILABLE = { state: "unavailable" as const };

const ACTIONS = new Set([
  "session",
  "register",
  "boq",
  "notes",
  "note_create",
  "note_reply",
  "accept",
]);

const NOTE_CATEGORIES = new Set(["general", "boq", "plans", "programme", "technical", "site_safety"]);
const NOTE_MAX = 2000;
const ACCEPTANCE_TERMS_VERSION = "2026-08-v1";
const ACCEPTANCE_TERMS =
  "I confirm that I have reviewed this BOQ revision and accept it as the basis for the next project stage, subject to the stated terms, exclusions and final contract.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const round2 = (v: number) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

const sanitizeText = (v: string, max = NOTE_MAX) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);

/** Mirrors src/lib/deckViewer.ts revisionFingerprint — must stay identical. */
const revisionFingerprint = (input: {
  boq_id: string;
  revision_label?: string | null;
  version_no?: number | null;
  line_count: number;
  subtotal: number;
  vat: number;
  total: number;
}) => {
  const parts = [
    input.boq_id,
    (input.revision_label ?? "").trim(),
    String(input.version_no ?? 0),
    String(input.line_count),
    round2(input.subtotal).toFixed(2),
    round2(input.vat).toFixed(2),
    round2(input.total).toFixed(2),
  ].join("|");
  const fnv = (seed: number) => {
    let h = seed;
    for (let i = 0; i < parts.length; i += 1) {
      h ^= parts.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };
  return `${fnv(0x811c9dc5)}${fnv(0x7fffffff)}`;
};

const CLIENT_BOQ_STATUSES = ["shared", "published", "approved"];

const VIEWER_PUBLIC = "id, share_link_id, project_id, first_name, surname, email, consent_at, first_viewed_at, last_viewed_at";

/* -------------------------------------- generic client BOQ revision resolver */
/** Mirrors src/lib/deckBoqResolver.ts — generic, never project-specific. */
const isClientVisibleStatus = (status?: string | null) =>
  CLIENT_BOQ_STATUSES.includes(String(status ?? "").trim().toLowerCase());

const revisionSort = (a: any, b: any) =>
  Number(b.version_no ?? 0) - Number(a.version_no ?? 0) ||
  new Date(String(b.updated_at ?? 0)).getTime() - new Date(String(a.updated_at ?? 0)).getTime();

const resolveClientBoq = (rows: any[], designatedIds: (string | null | undefined)[]) => {
  if (!rows.length) return { boq: null, reason: "no_boq_for_project" as const };
  const eligible = rows.filter((r) => isClientVisibleStatus(r.status)).sort(revisionSort);
  const designated = designatedIds.filter(Boolean) as string[];
  if (!eligible.length)
    return {
      boq: null,
      reason: (rows.some((r) => designated.includes(r.id))
        ? "designated_revision_not_issued"
        : "no_issued_revision") as const,
    };
  for (const id of designated) {
    const hit = eligible.find((r) => r.id === id);
    if (hit) return { boq: hit, reason: null };
  }
  return { boq: eligible[0], reason: null };
};

/* ------------------------------------- internal "project viewed" notification */
const NOTIFY_RECIPIENT = "nikita@siyakhatechnology.co.za";
const NOTIFY_SENDER = Deno.env.get("SIYAKHA_NOTIFY_FROM") ?? "Siyakha Projects <notifications@siyakhatechnology.co.za>";
const ADMIN_ORIGIN = "https://siyakhatechnology.co.za";

const pad = (n: number) => String(n).padStart(2, "0");
const sastStamp = (iso: string | number | Date) => {
  const t = new Date(new Date(iso).getTime() + 2 * 60 * 60 * 1000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())} ${pad(t.getUTCHours())}:${pad(
    t.getUTCMinutes(),
  )} SAST`;
};

async function notifyInternalView(input: {
  admin: any;
  project_id: string;
  share_link_id: string;
  viewer_id: string;
  session_hash: string;
  first_name: string;
  surname: string;
  email: string;
  origin?: string | null;
}) {
  const { admin } = input;
  if (!input.viewer_id) return;
  const idempotencyKey = `deck_view:${input.viewer_id}:${input.session_hash.slice(0, 32)}`;

  // Reserve the access event first: a retry of the same request cannot resend.
  const { data: reserved, error: reserveError } = await admin
    .from("portal_deck_view_notifications")
    .insert({
      project_id: input.project_id,
      share_link_id: input.share_link_id,
      viewer_id: input.viewer_id,
      idempotency_key: idempotencyKey,
      recipient: NOTIFY_RECIPIENT,
      delivery_status: "pending",
    })
    .select("id")
    .maybeSingle();
  if (reserveError || !reserved) return; // duplicate key or table missing — never resend, never block

  const [{ data: project }] = await Promise.all([
    admin.from("portal_projects").select("title, client_id, site_id").eq("id", input.project_id).maybeSingle(),
  ]);
  const [{ data: client }, { data: site }] = await Promise.all([
    project?.client_id
      ? admin.from("portal_clients").select("display_name").eq("id", project.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    project?.site_id
      ? admin.from("portal_sites").select("name").eq("id", project.site_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const projectTitle = String(project?.title ?? "").trim() || "Untitled project";
  const subject = `Project viewed — ${projectTitle}`;
  const adminLink = `${ADMIN_ORIGIN}/helpdesk/project-management/${input.project_id}`;
  const rows: [string, string][] = [
    ["Project", projectTitle],
    ["Client", String(client?.display_name ?? "—")],
    ["Site", String(site?.name ?? "—")],
    ["Viewer", `${input.first_name} ${input.surname}`.trim()],
    ["Email", input.email],
    ["Viewed at", sastStamp(Date.now())],
    ["Admin project", adminLink],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#111"><p style="text-transform:uppercase;letter-spacing:.18em;font-size:10px;color:#666">Siyakha Technology</p><h2 style="font-size:16px;margin:8px 0 16px">${subject}</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666">${k}</td><td><strong>${String(v).replace(/[<>]/g, "")}</strong></td></tr>`,
    )
    .join("")}</table><p style="color:#666;font-size:12px;margin-top:16px">Internal notification only. The secure link is not included.</p></div>`;

  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const finish = (status: string, error?: string | null) =>
    admin
      .from("portal_deck_view_notifications")
      .update({ delivery_status: status, error_message: error ?? null, subject, sent_at: new Date().toISOString() })
      .eq("id", reserved.id);

  if (!apiKey) {
    await finish("blocked", "RESEND_API_KEY is not configured");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: NOTIFY_SENDER, to: [NOTIFY_RECIPIENT], subject, text, html }),
    });
    if (!res.ok) {
      await finish("failed", `provider ${res.status}`);
      return;
    }
    await finish("sent", null);
  } catch (e) {
    await finish("failed", String((e as Error)?.message ?? e).slice(0, 300));
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, ...privacyHeaders } });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const token = String(body.token ?? "").slice(0, 200);
  const action = String(body.action ?? "session").slice(0, 20);
  const session = String(body.session ?? "").slice(0, 200);
  const payload = (body.payload ?? {}) as Record<string, unknown>;

  if (!ACTIONS.has(action)) return json({ error: "Unsupported action" }, 400);
  if (!/^[A-Za-z0-9_-]{20,120}$/.test(token)) return json(NOT_AVAILABLE, 200);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const ipHash = await hmac(`deck:ip:${ip}`);
  const tokenHash = await sha256(token);
  const rateKey = await hmac(`deck:token:${tokenHash}:${action}`);
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  /* ------------------------------------------------------------ rate limiting */
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const [ipCount, keyCount] = await Promise.all([
    admin.from("portal_share_access_log").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("accessed_at", since),
    admin.from("portal_share_access_log").select("id", { count: "exact", head: true }).eq("rate_key", rateKey).gte("accessed_at", since),
  ]);
  if (ipCount.error || keyCount.error) return json({ state: "rate_limited" }, 429);
  const writeAction = action !== "session" && action !== "boq" && action !== "notes";
  if ((ipCount.count ?? 0) >= 200 || (keyCount.count ?? 0) >= (writeAction ? 10 : 120))
    return json({ state: "rate_limited" }, 429);

  /* -------------------------------------------------------- token validation */
  const { data: link, error: linkErr } = await admin
    .from("portal_share_links")
    .select("id, project_id, client_id, resource_type, resource_id, title, expires_at, revoked_at, comments_allowed")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (linkErr) return json(NOT_AVAILABLE, 200);

  const log = (outcome: string, detail?: string) =>
    admin.from("portal_share_access_log").insert({
      share_link_id: link?.id ?? null,
      ip_hash: ipHash,
      rate_key: rateKey,
      user_agent: userAgent,
      action: `deck_${action}`,
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
  if (new Date(link.expires_at as string).getTime() < Date.now()) {
    await log("expired");
    return json({ state: "expired" }, 200);
  }

  /* ------------------------------------------------------- viewer resolution */
  const sessionHash = session ? await sha256(session) : "";
  let viewer: Record<string, unknown> | null = null;
  if (sessionHash) {
    const { data } = await admin
      .from("portal_deck_viewers")
      .select(VIEWER_PUBLIC + ", session_expires_at")
      .eq("session_token_hash", sessionHash)
      .eq("share_link_id", link.id)
      .eq("project_id", link.project_id)
      .maybeSingle();
    const expiry = data?.session_expires_at as string | null;
    if (data && (!expiry || new Date(expiry).getTime() > Date.now())) viewer = data;
  }

  /* ------------------------------------------------------------- registration */
  if (action === "register") {
    const first = sanitizeText(String(payload.first_name ?? ""), 60);
    const surname = sanitizeText(String(payload.surname ?? ""), 60);
    const email = sanitizeText(String(payload.email ?? ""), 160).toLowerCase();
    const consent = payload.consent === true;
    if (!first || !surname || !EMAIL_RE.test(email) || !consent) {
      await log("denied", "invalid registration");
      return json({ state: "invalid", error: "First name, surname, a valid email address and consent are required." }, 400);
    }
    const newSession = randomToken();
    const newHash = await sha256(newSession);
    const expires = new Date(Math.min(new Date(link.expires_at as string).getTime(), Date.now() + 30 * 86400000)).toISOString();

    const { data: existing } = await admin
      .from("portal_deck_viewers")
      .select("id, view_count")
      .eq("share_link_id", link.id)
      .eq("email", email)
      .maybeSingle();

    let row: Record<string, unknown> | null = null;
    if (existing) {
      const { data, error } = await admin
        .from("portal_deck_viewers")
        .update({
          first_name: first,
          surname,
          consent_at: new Date().toISOString(),
          session_token_hash: newHash,
          session_expires_at: expires,
          last_viewed_at: new Date().toISOString(),
          view_count: Number(existing.view_count ?? 0) + 1,
          user_agent: userAgent,
        })
        .eq("id", existing.id)
        .select(VIEWER_PUBLIC)
        .maybeSingle();
      if (error) {
        await log("error", "viewer update failed");
        return json({ error: "Could not complete registration" }, 500);
      }
      row = data;
    } else {
      const { data, error } = await admin
        .from("portal_deck_viewers")
        .insert({
          share_link_id: link.id,
          project_id: link.project_id,
          first_name: first,
          surname,
          email,
          session_token_hash: newHash,
          session_expires_at: expires,
          user_agent: userAgent,
        })
        .select(VIEWER_PUBLIC)
        .maybeSingle();
      if (error) {
        await log("error", "viewer insert failed");
        return json({ error: "Could not complete registration" }, 500);
      }
      row = data;
    }
    await log("granted", "viewer registered");

    // Internal view notification. Never blocks deck access, never emails the
    // viewer, and never carries the share token or commercial detail.
    try {
      await notifyInternalView({
        admin,
        project_id: String(link.project_id),
        share_link_id: String(link.id),
        viewer_id: String((row as Record<string, unknown>)?.id ?? ""),
        session_hash: newHash,
        first_name: first,
        surname,
        email,
        origin: req.headers.get("origin"),
      });
    } catch (_e) {
      // Deliberately swallowed: mail must never prevent access.
    }

    return json({ state: "ok", viewer: row, session: newSession });
  }

  // Everything past this point requires a registered, in-scope viewer.
  if (!viewer) {
    await log("registration_required");
    return json({ state: "registration_required" }, 200);
  }

  const projectId = String(link.project_id);
  const viewerId = String(viewer.id);

  const touch = () =>
    admin
      .from("portal_deck_viewers")
      .update({ last_viewed_at: new Date().toISOString() })
      .eq("id", viewerId);

  /* --------------------------------------------------------- client BOQ view */
  const loadBoq = async () => {
    // All revisions for THIS project only; the resolver decides which one (if
    // any) is client-visible, so the deck can report a truthful pending state.
    const [{ data: boqs }, { data: projectRow }] = await Promise.all([
      admin
        .from("portal_boqs")
        .select("id, project_id, title, revision_label, version_no, status, vat_enabled, vat_rate, valid_until, updated_at")
        .eq("project_id", projectId),
      admin.from("portal_projects").select("design_boq_id").eq("id", projectId).maybeSingle(),
    ]);
    const designated = [
      link.resource_type === "boq" ? (link.resource_id as string | null) : null,
      (projectRow?.design_boq_id as string | null) ?? null,
    ];
    const resolved = resolveClientBoq(boqs ?? [], designated);
    const boq = resolved.boq;
    if (!boq)
      return {
        boq: null,
        lines: [],
        totals: { subtotal: 0, vat: 0, total: 0 },
        revision_hash: "",
        pending_reason: resolved.reason,
      };


    const [{ data: items }, { data: sections }] = await Promise.all([
      admin
        .from("portal_boq_items")
        .select(
          "id, section_id, item_code, description, specification, quantity, unit, customer_unit_rate, line_total, vat_applicable, is_included, sort_order",
        )
        .eq("boq_id", boq.id)
        .order("sort_order", { ascending: true }),
      admin.from("portal_boq_sections").select("id, title, sort_order").eq("boq_id", boq.id).order("sort_order"),
    ]);
    const sectionTitle = new Map((sections ?? []).map((s: any) => [s.id, s.title]));
    const sectionOrder = new Map((sections ?? []).map((s: any) => [s.id, s.sort_order ?? 0]));
    const lines = (items ?? [])
      .filter((i: any) => i.is_included !== false)
      .sort(
        (a: any, b: any) =>
          (sectionOrder.get(a.section_id) ?? 0) - (sectionOrder.get(b.section_id) ?? 0) ||
          (a.sort_order ?? 0) - (b.sort_order ?? 0),
      )
      .map((i: any) => ({
        item_code: i.item_code ?? null,
        description: i.description,
        specification: i.specification ?? null,
        quantity: Number(i.quantity),
        unit: i.unit,
        customer_unit_rate: Number(i.customer_unit_rate),
        line_total: Number(i.line_total),
        vat_applicable: i.vat_applicable !== false,
        section: sectionTitle.get(i.section_id) ?? "Schedule",
      }));

    let subtotal = 0;
    let vatable = 0;
    for (const l of lines) {
      subtotal = round2(subtotal + l.line_total);
      if (l.vat_applicable) vatable = round2(vatable + l.line_total);
    }
    const vat = boq.vat_enabled === false ? 0 : round2((vatable * Number(boq.vat_rate ?? 15)) / 100);
    const totals = { subtotal, vat, total: round2(subtotal + vat) };
    const revision_hash = revisionFingerprint({
      boq_id: boq.id,
      revision_label: boq.revision_label,
      version_no: boq.version_no,
      line_count: lines.length,
      ...totals,
    });
    return { boq, lines, totals, revision_hash, pending_reason: lines.length ? null : "no_client_lines" };
  };

  const loadAcceptances = async () =>
    (
      await admin
        .from("portal_boq_acceptances")
        .select("id, boq_id, revision_label, revision_hash, full_name, email, po_reference, subtotal, vat, total, vat_rate, accepted_at, status")
        .eq("project_id", projectId)
        .eq("viewer_id", viewerId)
        .order("accepted_at", { ascending: false })
    ).data ?? [];

  const loadDelivery = async () => {
    const { data } = await admin
      .from("portal_project_delivery_settings")
      .select(
        "project_id, executive_summary, delivery_objectives, team_size, duration_weeks, lead_engineer_count, lead_engineer_role, temp_cctv_enabled, temp_cctv_notes, power_backup_hours, power_backup_qualification, cctv_recording_mode, cctv_average_bitrate_kbps, cctv_duty_cycle, cctv_codec, hdd_raw_tb, hdd_usable_factor, methodology, benefits_narrative, assumptions, exclusions, stages, updated_at",
      )
      .eq("project_id", projectId)
      .maybeSingle();
    return data ?? null;
  };

  const loadEquipment = async () => {
    const [{ data: markers }, { data: rack }] = await Promise.all([
      admin
        .from("portal_floor_markers")
        .select("marker_type, model, equipment")
        .eq("project_id", projectId)
        .eq("client_visible", true)
        .is("archived_at", null),
      admin
        .from("portal_rack_equipment")
        .select("equipment_type, manufacturer, model, equipment_name, quantity, copper_ports, sfp_ports, sfp_plus_ports, poe_capable, network_layer")
        .eq("project_id", projectId)
        .eq("client_visible", true)
        .is("archived_at", null),
    ]);
    return { markers: markers ?? [], rack: rack ?? [] };
  };

  if (action === "session" || action === "boq") {
    await touch();
    const [boq, acceptances, delivery, equipment] = await Promise.all([
      loadBoq(),
      loadAcceptances(),
      loadDelivery(),
      loadEquipment(),
    ]);
    await log("granted", action);
    return json({
      state: "ok",
      viewer,
      link: { title: link.title, expires_at: link.expires_at, comments_allowed: link.comments_allowed },
      boq: boq.boq,
      boq_lines: boq.lines,
      boq_totals: boq.totals,
      revision_hash: boq.revision_hash,
      acceptances,
      delivery,
      equipment,
      terms: { text: ACCEPTANCE_TERMS, version: ACCEPTANCE_TERMS_VERSION },
    });
  }

  /* ------------------------------------------------------------- BOQ accept */
  if (action === "accept") {
    if (payload.confirmed !== true) {
      await log("denied", "acceptance not confirmed");
      return json({ state: "denied", error: "The acceptance confirmation must be checked." }, 400);
    }
    const current = await loadBoq();
    if (!current.boq) {
      await log("denied", "no client boq");
      return json({ state: "denied", error: "No BOQ revision is available for acceptance." }, 400);
    }
    const claimed = String(payload.revision_hash ?? "");
    if (claimed && claimed !== current.revision_hash) {
      await log("denied", "revision changed");
      return json({ state: "revision_changed", revision_hash: current.revision_hash }, 409);
    }

    const { data: already } = await admin
      .from("portal_boq_acceptances")
      .select("id")
      .eq("viewer_id", viewerId)
      .eq("revision_hash", current.revision_hash)
      .maybeSingle();
    if (already) {
      await log("granted", "acceptance repeat");
      return json({ state: "ok", repeat: true, acceptance_id: already.id, revision_hash: current.revision_hash });
    }

    const { data: inserted, error } = await admin
      .from("portal_boq_acceptances")
      .insert({
        project_id: projectId,
        boq_id: current.boq.id,
        revision_label: current.boq.revision_label,
        revision_hash: current.revision_hash,
        share_link_id: link.id,
        viewer_id: viewerId,
        full_name: `${viewer.first_name} ${viewer.surname}`.trim(),
        email: viewer.email,
        po_reference: sanitizeText(String(payload.po_reference ?? ""), 60) || null,
        subtotal: current.totals.subtotal,
        vat: current.totals.vat,
        total: current.totals.total,
        vat_rate: Number(current.boq.vat_rate ?? 15),
        terms_text: ACCEPTANCE_TERMS,
        terms_version: ACCEPTANCE_TERMS_VERSION,
      })
      .select("id, accepted_at")
      .maybeSingle();
    if (error) {
      await log("error", "acceptance failed");
      return json({ error: "Could not record the acceptance" }, 500);
    }
    await admin.from("portal_activity").insert({
      client_id: link.client_id,
      project_id: projectId,
      entity_type: "boq",
      entity_id: current.boq.id,
      action: "client_accepted_boq",
      detail: `${viewer.first_name} ${viewer.surname} accepted ${current.boq.revision_label ?? "the BOQ"}`,
      actor_type: "client",
    });
    await log("granted", "acceptance recorded");
    return json({
      state: "ok",
      repeat: false,
      acceptance_id: inserted?.id,
      accepted_at: inserted?.accepted_at,
      revision_hash: current.revision_hash,
      totals: current.totals,
    });
  }

  /* ---------------------------------------------------------- project notes */
  const loadThreads = async () => {
    const { data: threads } = await admin
      .from("portal_client_note_threads")
      .select("id, project_id, share_link_id, viewer_id, category, subject, status, created_at, last_message_at")
      .eq("project_id", projectId)
      .eq("share_link_id", link.id)
      .eq("viewer_id", viewerId)
      .order("last_message_at", { ascending: false });
    const ids = (threads ?? []).map((t: any) => t.id);
    const { data: messages } = ids.length
      ? await admin
          .from("portal_client_note_messages")
          .select("id, thread_id, project_id, author_kind, author_name, body, created_at")
          .in("thread_id", ids)
          .order("created_at", { ascending: true })
      : { data: [] as any[] };
    return (threads ?? []).map((t: any) => ({
      ...t,
      messages: (messages ?? []).filter((m: any) => m.thread_id === t.id),
    }));
  };

  if (action === "notes") {
    await touch();
    await log("granted", "notes listed");
    return json({ state: "ok", threads: await loadThreads() });
  }

  if (action === "note_create" || action === "note_reply") {
    const bodyText = sanitizeText(String(payload.body ?? ""));
    if (bodyText.length < 3) return json({ state: "invalid", error: "Please write a little more detail." }, 400);
    const authorName = `${viewer.first_name} ${viewer.surname}`.trim();

    let threadId = "";
    if (action === "note_create") {
      const category = NOTE_CATEGORIES.has(String(payload.category ?? "")) ? String(payload.category) : "general";
      const { data, error } = await admin
        .from("portal_client_note_threads")
        .insert({
          project_id: projectId,
          share_link_id: link.id,
          viewer_id: viewerId,
          category,
          subject: sanitizeText(String(payload.subject ?? ""), 120) || null,
          status: "open",
        })
        .select("id")
        .maybeSingle();
      if (error || !data) {
        await log("error", "thread insert failed");
        return json({ error: "Could not save the note" }, 500);
      }
      threadId = data.id;
    } else {
      const { data: thread } = await admin
        .from("portal_client_note_threads")
        .select("id")
        .eq("id", String(payload.thread_id ?? ""))
        .eq("project_id", projectId)
        .eq("share_link_id", link.id)
        .eq("viewer_id", viewerId)
        .maybeSingle();
      if (!thread) {
        await log("denied", "thread out of scope");
        return json({ state: "denied", error: "That conversation is not available on this link." }, 403);
      }
      threadId = thread.id;
    }

    const { error: msgErr } = await admin.from("portal_client_note_messages").insert({
      thread_id: threadId,
      project_id: projectId,
      author_kind: "client",
      author_name: authorName,
      viewer_id: viewerId,
      body: bodyText,
    });
    if (msgErr) {
      await log("error", "message insert failed");
      return json({ error: "Could not save the note" }, 500);
    }
    await admin
      .from("portal_client_note_threads")
      .update({ status: "open", last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", threadId);

    await log("granted", "note submitted");
    return json({ state: "ok", threads: await loadThreads() });
  }

  return json({ error: "Unsupported action" }, 400);
});
