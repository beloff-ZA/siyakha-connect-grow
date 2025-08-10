/* Secured Supabase Edge Function: send-email
   - Requires valid Supabase JWT (default verify_jwt=true)
   - Only 'siyakha_admin' can send to arbitrary recipients or custom HTML/from
   - Non-admins can only email themselves (to = their own email)
   - Simple rate limiting via email_sends table
*/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

const MAX_RECIPIENTS_ADMIN = 50;
const MAX_PER_HOUR_NON_ADMIN = 15;
const MAX_PER_HOUR_ADMIN = 300;

function isValidEmail(email: string) {
  // Basic RFC 5322-like check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildBrandedHtml(subject: string, safeText: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#0b1220; padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#0f172a;border-radius:12px;overflow:hidden;color:#e2e8f0;">
        <tr>
          <td style="background:#22c55e;padding:16px 20px;">
            <div style="font-weight:700;color:#0b1220;">Siyakha Technology</div>
            <div style="font-size:12px;color:#0b1220;">Service Notification</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="margin:0 0 8px 0;color:#e2e8f0;font-size:18px;line-height:1.4;">${escapeHtml(
              subject,
            )}</h2>
            <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">${safeText}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #1f2937;">
            <div style="font-size:12px;color:#94a3b8;">
              Siyakha Technology • support@siyakhatechnology.co.za<br/>
              This is an automated message. Please do not reply directly to this email.
            </div>
          </td>
        </tr>
      </table>
    </div>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing server configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // User-scoped client (RLS applies as the caller)
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  // Service role client for protected writes (bypass RLS)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const user = userData.user;

    // Check roles (self-readable via RLS)
    const { data: roles, error: roleErr } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roleErr) {
      console.error("Role check error", roleErr);
    }
    const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "siyakha_admin");

    const payload: Payload = await req.json();
    const subject = (payload.subject ?? "").toString().slice(0, 200);
    let recipients = Array.isArray(payload.to) ? payload.to : [];

    // Basic input validation
    recipients = recipients
      .map((e) => e?.toString().trim().toLowerCase())
      .filter((e) => !!e && isValidEmail(e));
    recipients = Array.from(new Set(recipients));

    if (!subject || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload: to[] and subject are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isAdmin) {
      // Non-admins can only email themselves
      const selfEmail = (user.email ?? "").toLowerCase();
      recipients = recipients.filter((e) => e === selfEmail);
      if (recipients.length !== 1) {
        return new Response(JSON.stringify({ error: "Non-admin can only send email to their own address" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else if (recipients.length > MAX_RECIPIENTS_ADMIN) {
      return new Response(JSON.stringify({ error: `Too many recipients (max ${MAX_RECIPIENTS_ADMIN})` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Rate limiting
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: sentCount, error: countErr } = await adminClient
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sinceIso);

    if (countErr) {
      console.error("email_sends count error", countErr);
    }

    const limit = isAdmin ? MAX_PER_HOUR_ADMIN : MAX_PER_HOUR_NON_ADMIN;
    if ((sentCount ?? 0) >= limit) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeText = escapeHtml((payload.text ?? "You have a new notification.").toString()).replace(/\n/g, "<br/>");
    const allowCustomHtml = isAdmin && typeof payload.html === "string" && payload.html.trim().length > 0;
    const brandHtml = allowCustomHtml ? payload.html! : buildBrandedHtml(subject, safeText);

    const from = isAdmin && payload.from ? payload.from : "Siyakha Technology <notifications@mail.siyakhatechnology.co.za>";

    const resendPayload = {
      from,
      to: recipients,
      subject,
      html: brandHtml,
      text: payload.text ?? "",
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return new Response(JSON.stringify({ error: "Failed to send email", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log the send for rate limiting/audit
    const { error: insertErr } = await adminClient.from("email_sends").insert({
      user_id: user.id,
      subject,
      to_emails: recipients,
      metadata: {
        ip: req.headers.get("x-forwarded-for") ?? null,
        is_admin: isAdmin,
      },
    });
    if (insertErr) {
      console.error("email_sends insert error", insertErr);
    }

    return new Response(JSON.stringify({ id: data.id, status: "sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("send-email error", e);
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});