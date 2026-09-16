// Secure site-delivery API for the two guest links off one project:
//   /field/:token          -> link_role = 'field'   (technician, can write)
//   /site-progress/:token  -> link_role = 'client'  (read-only, approved only)
//
// Security model:
//  - The share token is validated FIRST on every request. Nothing about the
//    project is returned before the token, its role, expiry and revocation pass.
//  - The project id is never accepted from the client; it always comes from the
//    validated link row.
//  - Client responses are rebuilt from explicit key allowlists, so costs,
//    margins, supplier data and internal notes cannot leak structurally.
//  - "Remember this device" is an opaque random token; only its hash is stored,
//    it expires, and revoking the link kills it.
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

const NOT_AVAILABLE = { state: "unavailable" as const };

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const DOCUMENTS_BUCKET = "client-documents";
const PHOTO_BUCKET = "site-progress";

const FIELD_ACTIONS = new Set(["job", "remember", "upload_url", "submit_update", "report_issue"]);
const CLIENT_ACTIONS = new Set(["client_view"]);

const PHOTO_CATEGORIES = new Set(["before", "during", "after", "issue", "completed"]);
const SEVERITIES = new Set(["low", "medium", "high", "critical"]);

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const clean = (v: unknown, max = 4000) => str(v, max).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
const pct = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;
};
const uuidOrNull = (v: unknown) =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { ...cors, ...privacyHeaders } });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid body" }, 400);
  }

  const token = str(body.token, 200);
  const action = str(body.action, 30) || "job";
  const device = str(body.device, 200);
  const payload = (body.payload ?? {}) as Record<string, unknown>;

  if (!/^[A-Za-z0-9_-]{20,120}$/.test(token)) return json(NOT_AVAILABLE);
  if (!FIELD_ACTIONS.has(action) && !CLIENT_ACTIONS.has(action)) return json({ error: "Unsupported action" }, 400);

  /* ------------------------------------------------------ token validation */
  const tokenHash = await sha256(token);
  const { data: link } = await admin
    .from("portal_share_links")
    .select("id, project_id, client_id, title, link_role, assignee_label, expires_at, revoked_at, resource_type, access_count")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!link || link.resource_type !== "site_delivery") return json(NOT_AVAILABLE);
  if (link.revoked_at) return json({ state: "revoked" });
  if (new Date(link.expires_at as string).getTime() < Date.now()) return json({ state: "expired" });

  const role = (link.link_role as string) ?? "client";
  if (FIELD_ACTIONS.has(action) && role !== "field") return json({ state: "denied" });
  if (CLIENT_ACTIONS.has(action) && role !== "client") return json({ state: "denied" });

  const projectId = link.project_id as string;

  const logAccess = async (outcome: string, detail?: string) => {
    await admin.from("portal_share_access_log").insert({
      share_link_id: link.id,
      action: `site_${action}`,
      outcome,
      detail: detail ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
    await admin
      .from("portal_share_links")
      .update({
        access_count: (link.access_count as number ?? 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", link.id);
  };

  const signedPhotos = async (rows: any[]) =>
    Promise.all(
      rows.map(async (r) => {
        let url: string | null = null;
        if (r.storage_path) {
          const { data } = await admin.storage.from(PHOTO_BUCKET).createSignedUrl(r.storage_path, 900);
          url = data?.signedUrl ?? null;
        }
        return {
          id: r.id,
          category: r.category,
          caption: r.caption,
          floor_id: r.floor_id,
          taken_at: r.taken_at,
          client_visible: r.client_visible,
          url,
        };
      }),
    );

  const floorsWithProgress = async (clientOnly: boolean) => {
    let q = admin
      .from("portal_floors")
      .select("id, level_number, display_name, floor_use, plan_image_path, client_visible, sort_order")
      .eq("project_id", projectId)
      .order("sort_order");
    if (clientOnly) q = q.eq("client_visible", true);
    const [{ data: floors }, { data: progress }] = await Promise.all([
      q,
      admin.from("portal_floor_progress").select("floor_id, progress_pct, status, note").eq("project_id", projectId),
    ]);
    return Promise.all(
      (floors ?? []).map(async (f: any) => {
        const p = (progress ?? []).find((x: any) => x.floor_id === f.id);
        let drawing_url: string | null = null;
        if (f.plan_image_path) {
          const { data } = await admin.storage.from(DOCUMENTS_BUCKET).createSignedUrl(f.plan_image_path, 900);
          drawing_url = data?.signedUrl ?? null;
        }
        return {
          id: f.id,
          level_number: f.level_number,
          display_name: f.display_name,
          floor_use: f.floor_use,
          progress_pct: p?.progress_pct ?? 0,
          status: p?.status ?? "not_started",
          note: p?.note ?? null,
          drawing_url,
        };
      }),
    );
  };

  const projectHeader = async () => {
    const [{ data: project }, { data: client }] = await Promise.all([
      admin
        .from("portal_projects")
        .select("id, title, reference, address, status, description, start_date, target_date, site_id")
        .eq("id", projectId)
        .maybeSingle(),
      link.client_id
        ? admin.from("portal_clients").select("display_name").eq("id", link.client_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    let site: any = null;
    if (project?.site_id) {
      const { data } = await admin
        .from("portal_sites")
        .select("name, address, city, province")
        .eq("id", project.site_id)
        .maybeSingle();
      site = data;
    }
    return {
      title: project?.title ?? link.title,
      reference: project?.reference ?? null,
      status: project?.status ?? null,
      scope: project?.description ?? null,
      address: project?.address ?? site?.address ?? null,
      start_date: project?.start_date ?? null,
      target_date: project?.target_date ?? null,
      client_name: (client as any)?.display_name ?? null,
      site_name: site?.name ?? null,
      site_location: [site?.city, site?.province].filter(Boolean).join(", ") || null,
    };
  };

  /* ------------------------------------------------------------ field role */
  if (role === "field") {
    const { data: access } = await admin
      .from("portal_field_access")
      .select("id, technician_name, role_label, device_session_hash, device_expires_at, revoked_at")
      .eq("share_link_id", link.id)
      .maybeSingle();
    if (!access || access.revoked_at) return json({ state: "revoked" });

    let deviceRemembered = false;
    if (device) {
      const hash = await sha256(device);
      deviceRemembered =
        access.device_session_hash === hash &&
        !!access.device_expires_at &&
        new Date(access.device_expires_at as string).getTime() > Date.now();
    }

    if (action === "remember") {
      const fresh = randomToken();
      await admin
        .from("portal_field_access")
        .update({
          device_session_hash: await sha256(fresh),
          device_label: str(payload.device_label, 120) || null,
          device_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        })
        .eq("id", access.id);
      await logAccess("granted", "device remembered");
      return json({ state: "ok", device: fresh });
    }

    if (action === "upload_url") {
      const ext = (str(payload.extension, 8) || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
      const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
      const { data, error } = await admin.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
      if (error) return json({ error: "Upload could not be prepared" }, 500);
      return json({ state: "ok", path, token: data.token, signedUrl: data.signedUrl, bucket: PHOTO_BUCKET });
    }

    if (action === "submit_update") {
      const insert = {
        project_id: projectId,
        floor_id: uuidOrNull(payload.floor_id),
        area_label: clean(payload.area_label, 200) || null,
        shift_date: /^\d{4}-\d{2}-\d{2}$/.test(str(payload.shift_date, 10))
          ? str(payload.shift_date, 10)
          : new Date().toISOString().slice(0, 10),
        submitted_by_name: clean(payload.submitted_by_name, 160) || (access.technician_name as string),
        field_access_id: access.id,
        source: "field",
        work_completed: clean(payload.work_completed) || null,
        work_outstanding: clean(payload.work_outstanding) || null,
        blockers: clean(payload.blockers) || null,
        materials_required: clean(payload.materials_required) || null,
        team_onsite: clean(payload.team_onsite, 500) || null,
        progress_pct: pct(payload.progress_pct),
        next_shift_plan: clean(payload.next_shift_plan) || null,
        notes: clean(payload.notes) || null,
        approval_status: "submitted",
        client_visible: false,
      };
      if (!insert.work_completed && !insert.work_outstanding && !insert.notes) {
        return json({ error: "Add what was completed or what is outstanding before submitting." }, 400);
      }
      const { data: created, error } = await admin.from("portal_site_updates").insert(insert).select("id").maybeSingle();
      if (error) return json({ error: "The update could not be saved." }, 500);

      const photos = Array.isArray(payload.photos) ? payload.photos.slice(0, 40) : [];
      if (photos.length) {
        await admin.from("portal_site_update_photos").insert(
          photos.map((p: any, i: number) => ({
            project_id: projectId,
            update_id: created!.id,
            floor_id: uuidOrNull(p?.floor_id) ?? insert.floor_id,
            category: PHOTO_CATEGORIES.has(str(p?.category, 20)) ? str(p?.category, 20) : "during",
            caption: clean(p?.caption, 300) || null,
            storage_path: str(p?.storage_path, 400),
            mime_type: str(p?.mime_type, 120) || null,
            file_size: Number.isFinite(Number(p?.file_size)) ? Number(p?.file_size) : null,
            sort_order: i,
          })).filter((p) => p.storage_path),
        );
      }

      await admin.from("portal_activity").insert({
        project_id: projectId,
        entity_type: "site_update",
        entity_id: created!.id,
        action: "field_update_submitted",
        detail: `${insert.submitted_by_name} submitted a site update`,
        actor_type: "field",
      });
      await admin
        .from("portal_field_access")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", access.id);
      await logAccess("granted", "update submitted");
      return json({ state: "ok", id: created!.id });
    }

    if (action === "report_issue") {
      const title = clean(payload.title, 200);
      if (!title) return json({ error: "Give the issue a short title." }, 400);
      const severity = SEVERITIES.has(str(payload.severity, 20)) ? str(payload.severity, 20) : "medium";
      const { data: created, error } = await admin
        .from("portal_site_issues")
        .insert({
          project_id: projectId,
          floor_id: uuidOrNull(payload.floor_id),
          location_note: clean(payload.location_note, 300) || null,
          title,
          description: clean(payload.description) || null,
          severity,
          status: "open",
          reported_by_name: clean(payload.reported_by_name, 160) || (access.technician_name as string),
          field_access_id: access.id,
        })
        .select("id")
        .maybeSingle();
      if (error) return json({ error: "The issue could not be saved." }, 500);

      const photos = Array.isArray(payload.photos) ? payload.photos.slice(0, 20) : [];
      if (photos.length) {
        await admin.from("portal_site_update_photos").insert(
          photos.map((p: any, i: number) => ({
            project_id: projectId,
            issue_id: created!.id,
            floor_id: uuidOrNull(p?.floor_id) ?? uuidOrNull(payload.floor_id),
            category: "issue",
            caption: clean(p?.caption, 300) || null,
            storage_path: str(p?.storage_path, 400),
            sort_order: i,
          })).filter((p) => p.storage_path),
        );
      }
      await admin.from("portal_activity").insert({
        project_id: projectId,
        entity_type: "site_issue",
        entity_id: created!.id,
        action: "field_issue_reported",
        detail: `${severity} issue reported: ${title}`,
        actor_type: "field",
      });
      await logAccess("granted", "issue reported");
      return json({ state: "ok", id: created!.id });
    }

    // action === "job"
    const [header, floors, updatesRes, issuesRes, docsRes] = await Promise.all([
      projectHeader(),
      floorsWithProgress(false),
      admin
        .from("portal_site_updates")
        .select(
          "id, shift_date, submitted_at, submitted_by_name, floor_id, area_label, work_completed, work_outstanding, blockers, materials_required, team_onsite, progress_pct, next_shift_plan, notes, approval_status, client_visible",
        )
        .eq("project_id", projectId)
        .order("submitted_at", { ascending: false })
        .limit(60),
      admin
        .from("portal_site_issues")
        .select("id, title, description, severity, status, floor_id, location_note, opened_at, reported_by_name")
        .eq("project_id", projectId)
        .order("opened_at", { ascending: false })
        .limit(60),
      admin
        .from("portal_documents")
        .select("id, title, category, storage_path, document_date, reference")
        .eq("project_id", projectId)
        .order("document_date", { ascending: false })
        .limit(40),
    ]);

    const documents = await Promise.all(
      (docsRes.data ?? []).map(async (d: any) => {
        let url: string | null = null;
        if (d.storage_path) {
          const { data } = await admin.storage.from(DOCUMENTS_BUCKET).createSignedUrl(d.storage_path, 900);
          url = data?.signedUrl ?? null;
        }
        return { id: d.id, title: d.title, category: d.category, reference: d.reference, url };
      }),
    );

    const updates = updatesRes.data ?? [];
    const photoRes = await admin
      .from("portal_site_update_photos")
      .select("id, update_id, issue_id, category, caption, floor_id, taken_at, storage_path, client_visible")
      .eq("project_id", projectId)
      .order("sort_order")
      .limit(400);
    const photos = await signedPhotos(photoRes.data ?? []);

    await logAccess("granted", "job opened");
    return json({
      state: "ok",
      role: "field",
      technician: { id: access.id, name: access.technician_name, role_label: access.role_label },
      device_remembered: deviceRemembered,
      project: header,
      floors,
      updates,
      issues: issuesRes.data ?? [],
      documents,
      photos: photos.map((p) => ({ ...p, update_id: (photoRes.data ?? []).find((r: any) => r.id === p.id)?.update_id ?? null })),
      today: new Date().toISOString().slice(0, 10),
    });
  }

  /* ----------------------------------------------------------- client role */
  const [header, floors, updatesRes, issuesRes, docsRes] = await Promise.all([
    projectHeader(),
    floorsWithProgress(true),
    admin
      .from("portal_site_updates")
      .select("id, shift_date, submitted_at, floor_id, area_label, work_completed, work_outstanding, next_shift_plan, progress_pct, approved_at, published_at")
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .in("approval_status", ["approved", "locked"])
      .order("shift_date", { ascending: false })
      .limit(120),
    admin
      .from("portal_site_issues")
      .select("id, title, description, severity, status, floor_id, location_note, opened_at, resolved_at")
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .eq("internal_only", false)
      .order("opened_at", { ascending: false })
      .limit(60),
    admin
      .from("portal_documents")
      .select("id, title, category, storage_path, document_date, reference")
      .eq("project_id", projectId)
      .order("document_date", { ascending: false })
      .limit(40),
  ]);

  const approvedIds = (updatesRes.data ?? []).map((u: any) => u.id);
  let clientPhotos: any[] = [];
  if (approvedIds.length) {
    const { data } = await admin
      .from("portal_site_update_photos")
      .select("id, update_id, category, caption, floor_id, taken_at, storage_path, client_visible")
      .eq("project_id", projectId)
      .eq("client_visible", true)
      .in("update_id", approvedIds)
      .order("sort_order")
      .limit(300);
    clientPhotos = (await signedPhotos(data ?? [])).map((p, i) => ({
      ...p,
      update_id: (data ?? [])[i]?.update_id ?? null,
    }));
  }

  const documents = await Promise.all(
    (docsRes.data ?? []).map(async (d: any) => {
      let url: string | null = null;
      if (d.storage_path) {
        const { data } = await admin.storage.from(DOCUMENTS_BUCKET).createSignedUrl(d.storage_path, 900);
        url = data?.signedUrl ?? null;
      }
      return { id: d.id, title: d.title, category: d.category, reference: d.reference, url };
    }),
  );

  const overall = floors.length
    ? Math.round(floors.reduce((s, f) => s + (f.progress_pct ?? 0), 0) / floors.length)
    : 0;

  await logAccess("granted", "client view");
  return json({
    state: "ok",
    role: "client",
    project: header,
    overall_progress: overall,
    last_updated: (updatesRes.data ?? [])[0]?.shift_date ?? null,
    floors,
    updates: updatesRes.data ?? [],
    issues: issuesRes.data ?? [],
    photos: clientPhotos,
    documents,
  });
});
