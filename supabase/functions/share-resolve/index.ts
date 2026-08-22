// Public resolver for branded client share links (/share/:token).
// Guests never receive private storage paths or admin metadata: the function
// resolves the frozen snapshot server-side and mints short-lived signed URLs
// only for the plan images belonging to the shared project.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Generic response for missing / expired / revoked links so link existence never leaks.
const NOT_AVAILABLE = { state: "unavailable" as const };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  let token = "";
  let action = "view";
  let message = "";
  let accessToken = "";
  try {
    const body = await req.json();
    token = String(body?.token ?? "");
    action = String(body?.action ?? "view");
    message = String(body?.message ?? "").slice(0, 2000);
    accessToken = String(body?.access_token ?? "");
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!/^[A-Za-z0-9_-]{20,120}$/.test(token)) return json(NOT_AVAILABLE, 200);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";
  const ipHash = await sha256(`share:${ip}`);
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  // Rate limiting for guest links: max 60 attempts per address per 10 minutes.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("portal_share_access_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("accessed_at", since);
  if ((count ?? 0) > 60) return json({ state: "rate_limited" }, 429);

  const tokenHash = await sha256(token);
  const { data: link } = await admin
    .from("portal_share_links")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const log = (outcome: string, detail?: string, id?: string) =>
    admin.from("portal_share_access_log").insert({
      share_link_id: id ?? link?.id ?? null,
      ip_hash: ipHash,
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

  // Optional "client login required" mode: the visitor must present a valid
  // session belonging to an active portal user of the same client.
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
      }
    }
    if (!ok) {
      await log("login_required");
      return json({ state: "login_required" }, 200);
    }
  }

  if (action === "comment" || action === "approve") {
    if (action === "comment" && !link.comments_allowed) {
      await log("denied", "comments not permitted");
      return json({ state: "denied" }, 403);
    }
    if (action === "approve" && !link.approval_allowed) {
      await log("denied", "approval not permitted");
      return json({ state: "denied" }, 403);
    }
    if (action === "comment") {
      if (!message.trim()) return json({ error: "A message is required" }, 400);
      await admin.from("portal_queries").insert({
        project_id: link.project_id,
        subject: `Shared document query — ${link.title}`,
        message: `${message}\n\n(Submitted from share link${link.recipient_label ? ` for ${link.recipient_label}` : ""}.)`,
        status: "open",
      });
      await log("granted", "comment submitted");
      return json({ state: "ok" });
    }
    if (link.resource_type === "proposal" && link.resource_id) {
      await admin
        .from("portal_proposals")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", link.resource_id)
        .eq("status", "issued");
    }
    await admin.from("portal_activity").insert({
      client_id: link.client_id,
      project_id: link.project_id,
      entity_type: "share_link",
      entity_id: link.id,
      action: "client_approved",
      detail: `${link.title} accepted via secure share link${message ? `: ${message}` : ""}`,
      actor_type: "client",
    });
    await log("granted", "approval recorded");
    return json({ state: "ok" });
  }

  // View: sign plan images referenced by the frozen snapshot.
  const snapshot = (link.snapshot ?? {}) as Record<string, unknown>;
  const floors = Array.isArray((snapshot as any).floors) ? ((snapshot as any).floors as any[]) : [];
  for (const f of floors) {
    if (f?.plan_image_path) {
      const { data } = await admin.storage.from("client-documents").createSignedUrl(f.plan_image_path, 900);
      f.plan_image_url = data?.signedUrl ?? null;
      delete f.plan_image_path;
    }
  }

  // Gallery photos live in a private bucket: mint short-lived URLs and drop paths.
  const gallery = Array.isArray((snapshot as any).gallery) ? ((snapshot as any).gallery as any[]) : [];
  for (const g of gallery) {
    if (g?.storage_path) {
      const { data } = await admin.storage.from("client-photos").createSignedUrl(g.storage_path, 900);
      g.photo_url = data?.signedUrl ?? null;
      delete g.storage_path;
    }
  }

  await admin
    .from("portal_share_links")
    .update({
      access_count: (link.access_count ?? 0) + 1,
      first_accessed_at: link.first_accessed_at ?? new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", link.id);
  await log("granted");

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
    },
    snapshot,
  });
});
