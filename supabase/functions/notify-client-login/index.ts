import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const FALLBACK_RECIPIENT = "nikita@siyakhatechnology.co.za";
/** Suppress repeat notifications for the same user inside this window. */
const DEDUPE_MINUTES = 10;

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

const joburgTime = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // The browser only ever says "a login happened" and (optionally) that this is a test.
    let body: { test?: boolean } = {};
    try {
      body = (await req.json()) as { test?: boolean };
    } catch {
      body = {};
    }
    const isTest = body.test === true;

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Identity is derived from the JWT only — never from the request body.
    const { data: userData, error: userErr } = await caller.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: settings } = await admin
      .from("portal_notification_settings")
      .select("login_notify_enabled, recipient_email")
      .limit(1)
      .maybeSingle();

    const recipient = settings?.recipient_email?.trim() || FALLBACK_RECIPIENT;
    const enabled = settings?.login_notify_enabled ?? true;

    if (isTest) {
      const { data: isAdmin } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .in("role", ["siyakha_admin", "admin", "super_admin"])
        .maybeSingle();
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
    } else if (!enabled) {
      return json({ success: true, skipped: "disabled" });
    }

    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);
    const nowIso = new Date().toISOString();

    // Client / site / project context is resolved server-side from the caller's identity.
    const { data: clientUser } = await admin
      .from("portal_client_users")
      .select("id, client_id, email, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    let clientName = "Siyakha admin";
    let siteSummary = "—";
    let projectSummary = "—";

    if (clientUser) {
      const { data: client } = await admin
        .from("portal_clients")
        .select("display_name")
        .eq("id", clientUser.client_id)
        .maybeSingle();
      clientName = client?.display_name ?? "Unknown client";

      const { data: assignments } = await admin
        .from("portal_project_assignments")
        .select("project_id")
        .eq("client_user_id", clientUser.id);
      const projectIds = (assignments ?? []).map((a) => a.project_id);

      if (projectIds.length) {
        const { data: projects } = await admin
          .from("portal_projects")
          .select("title, site_id")
          .in("id", projectIds);
        projectSummary = (projects ?? []).map((p) => p.title).join(", ") || "—";

        const siteIds = [...new Set((projects ?? []).map((p) => p.site_id).filter(Boolean))];
        if (siteIds.length) {
          const { data: sites } = await admin
            .from("portal_sites")
            .select("display_name")
            .in("id", siteIds as string[]);
          siteSummary = (sites ?? []).map((s) => s.display_name).join(", ") || "—";
        }
      }
    }

    // Deduplication / rate protection: one notification per user per window.
    if (!isTest) {
      const since = new Date(Date.now() - DEDUPE_MINUTES * 60_000).toISOString();
      const { count } = await admin
        .from("portal_login_notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event_kind", "client_login")
        .gte("created_at", since);
      if ((count ?? 0) > 0) return json({ success: true, skipped: "duplicate" });
    }

    const fullName = clientUser?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "—";
    const email = clientUser?.email ?? user.email ?? "—";
    const subject = `Client portal login — ${clientName}`;

    const rows: [string, string][] = [
      ["Client user", fullName],
      ["Email", email],
      ["Company", clientName],
      ["Site", siteSummary],
      ["Project", projectSummary],
      ["Signed in", joburgTime(nowIso) + " (Africa/Johannesburg)"],
      ["Browser", userAgent || "Not reported"],
    ];

    const html = `<div style="font-family:Helvetica,Arial,sans-serif;color:#111">
      <h2 style="font-weight:400">${isTest ? "Test notification — " : ""}Client portal login</h2>
      <p style="color:#555;font-size:14px">${escape(clientName)} accessed the Siyakha client portal.</p>
      <table style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 16px 6px 0;color:#777">${escape(k)}</td><td style="padding:6px 0">${escape(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="color:#999;font-size:12px;margin-top:24px">Siyakha Interlink · automated portal notification. No credentials or session data are included.</p>
    </div>`;

    let deliveryStatus = "sent";
    let errorMessage: string | null = null;

    if (!resendKey) {
      deliveryStatus = "failed";
      errorMessage = "RESEND_API_KEY is not configured";
    } else {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Siyakha Portal <notifications@siyakhatechnology.co.za>",
            to: [recipient],
            subject: isTest ? `[Test] ${subject}` : subject,
            html,
          }),
        });
        if (!res.ok) {
          deliveryStatus = "failed";
          errorMessage = `Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`;
        }
      } catch (e) {
        deliveryStatus = "failed";
        errorMessage = e instanceof Error ? e.message.slice(0, 300) : "Unknown send error";
      }
    }

    await admin.from("portal_login_notifications").insert({
      user_id: user.id,
      client_user_id: clientUser?.id ?? null,
      client_id: clientUser?.client_id ?? null,
      user_email: email,
      full_name: fullName,
      client_name: clientName,
      site_summary: siteSummary,
      project_summary: projectSummary,
      recipient_email: recipient,
      user_agent: userAgent || null,
      event_kind: isTest ? "test" : "client_login",
      delivery_status: deliveryStatus,
      error_message: errorMessage,
      signed_in_at: nowIso,
    });

    // Never block the client's sign-in on email delivery.
    return json({ success: deliveryStatus === "sent", delivery_status: deliveryStatus, error: errorMessage });
  } catch (e) {
    console.error("notify-client-login error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
