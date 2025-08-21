
/* Public Edge Function: log-support-call
   - Accepts JSON payload from public web form
   - Validates required fields
   - Inserts into public.inbound_support_requests using service role (bypass RLS)
   - Sends notification email to accounts@siyakhatechnology.co.za via Resend
   - Returns a JSON response
*/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  full_name: string;
  contact_number: string;
  whatsapp_number?: string;
  email: string;
  category: string;
  description: string;
  preferred_channel?: string | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esc(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildHtml(p: Payload, meta: { ip: string | null; ua: string | null; id?: string }) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#0b1220; padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#0f172a;border-radius:12px;overflow:hidden;color:#e2e8f0;">
        <tr>
          <td style="background:#22c55e;padding:16px 20px;">
            <div style="font-weight:700;color:#0b1220;">Siyakha Technology</div>
            <div style="font-size:12px;color:#0b1220;">New Support Request</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="margin:0 0 16px 0;color:#e2e8f0;font-size:18px;line-height:1.4;">New Support Request ${meta.id ? `(#${esc(meta.id)})` : ""}</h2>
            <table cellspacing="0" cellpadding="6" style="width:100%;font-size:14px;color:#cbd5e1;">
              <tr><td style="width:180px;color:#94a3b8;">Full name</td><td>${esc(p.full_name)}</td></tr>
              <tr><td style="color:#94a3b8;">Email</td><td>${esc(p.email)}</td></tr>
              <tr><td style="color:#94a3b8;">Contact number</td><td>${esc(p.contact_number)}</td></tr>
              <tr><td style="color:#94a3b8;">WhatsApp number</td><td>${esc(p.whatsapp_number ?? "")}</td></tr>
              <tr><td style="color:#94a3b8;">Category</td><td>${esc(p.category)}</td></tr>
              <tr><td style="color:#94a3b8;">Preferred channel</td><td>${esc(p.preferred_channel ?? "unspecified")}</td></tr>
            </table>
            <div style="margin-top:16px;color:#e2e8f0;font-weight:600;">Description</div>
            <div style="margin-top:6px;color:#cbd5e1;white-space:pre-wrap;">${esc(p.description)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #1f2937;">
            <div style="font-size:12px;color:#94a3b8;">
              Source: web • IP: ${esc(String(meta.ip ?? ""))} • User-Agent: ${esc(String(meta.ua ?? ""))}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing function configuration");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent") || null;

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Basic validation
  const { full_name, contact_number, email, category, description } = payload || {};
  if (
    !full_name ||
    !contact_number ||
    !email ||
    !isValidEmail(String(email)) ||
    !category ||
    !description
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Missing or invalid fields. Required: full_name, contact_number, email (valid), category, description",
      }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Insert into DB
  const insertRow = {
    full_name: String(full_name),
    contact_number: String(contact_number),
    whatsapp_number: payload.whatsapp_number ? String(payload.whatsapp_number) : null,
    email: String(email).toLowerCase(),
    category: String(category),
    description: String(description),
    preferred_channel: payload.preferred_channel ?? null,
    status: "new",
    source: "web",
    ip,
    user_agent: ua,
  };

  const { data: inserted, error: insertErr } = await admin
    .from("inbound_support_requests")
    .insert(insertRow)
    .select("id")
    .single();

  if (insertErr) {
    console.error("Insert error", insertErr);
    return new Response(JSON.stringify({ error: "Failed to log request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Send email via Resend
  const subject = `New Support Request: ${payload.category} — ${payload.full_name}`;
  const html = buildHtml(payload, { ip, ua, id: inserted?.id });
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Siyakha Technology <notifications@mail.siyakhatechnology.co.za>",
      to: ["nikita@siyakhatechnology.co.za"],
      subject,
      html,
      text:
        `New support request\n\n` +
        `Full name: ${payload.full_name}\nEmail: ${payload.email}\n` +
        `Contact number: ${payload.contact_number}\nWhatsApp: ${payload.whatsapp_number ?? ""}\n` +
        `Category: ${payload.category}\nPreferred channel: ${payload.preferred_channel ?? "unspecified"}\n\n` +
        `Description:\n${payload.description}\n\n` +
        `Source: web • IP: ${ip ?? ""} • User-Agent: ${ua ?? ""}`,
    }),
  });

  const emailData = await emailRes.json().catch(() => null);
  if (!emailRes.ok) {
    console.error("Resend email error", emailData);
    // Still return 200 for successful logging, but include email failure info
    return new Response(
      JSON.stringify({
        id: inserted?.id,
        status: "logged_email_failed",
        email_error: emailData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  return new Response(JSON.stringify({ id: inserted?.id, status: "logged_and_emailed" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
