
/* Supabase Edge Function: send-email
   Sends branded email notifications using Resend.
   Inputs (JSON):
   {
     "to": string[]; // recipients
     "subject": string;
     "html": string;   // optional, will be generated from fallback if missing
     "text": string;   // optional
     "from"?: string;  // optional override
   }
*/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { to, subject, html, text, from } = await req.json();
    if (!Array.isArray(to) || to.length === 0 || !subject) {
      return new Response(JSON.stringify({ error: "Invalid payload: to[] and subject are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const brandHtml =
      html ??
      `
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
              <h2 style="margin:0 0 8px 0;color:#e2e8f0;font-size:18px;line-height:1.4;">${subject}</h2>
              <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">
                ${text ? text.replace(/\n/g, "<br/>") : "You have a new notification."}
              </p>
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
      </div>
      `;

    const payload = {
      from: from ?? "Siyakha Technology <notifications@mail.siyakhatechnology.co.za>",
      to,
      subject,
      html: brandHtml,
      text: text ?? "",
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return new Response(JSON.stringify({ error: "Failed to send email", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
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
