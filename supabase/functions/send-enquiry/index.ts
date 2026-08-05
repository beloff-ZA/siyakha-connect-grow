// Public edge function — website enquiry form (no auth required)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const RECIPIENTS = ["nikita@siyakhatechnology.co.za"];
const FROM = "Siyakha Website <notifications@mail.siyakhatechnology.co.za>";
const FALLBACK_FROM = "Siyakha Website <onboarding@resend.dev>";
// Last-resort delivery while the branded sending domain is pending verification
const FALLBACK_RECIPIENTS = ["nikitajacobs01@gmail.com"];

function esc(s: unknown) {
  return (s ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const EnquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).default(""),
  region: z.enum(["South Africa", "GCC", "UK", "Other"]),
  clientType: z.enum(["Estates", "Commercial", "Schools", "Government", "Event Wi-Fi", "Other"]),
  timeline: z.enum(["0–3 months", "3–6 months", "6–12 months", "12+ months / planning"]),
  role: z.enum(["Brand representative", "Agency", "Venue owner or manager", "Event organiser", "Public sector", "Other"]),
  message: z.string().trim().min(1).max(4000),
  humanConfirmed: z.literal(true),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (!RESEND_API_KEY) return json({ error: "Email service not configured" }, 500);

  try {
    const parsed = EnquirySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please complete all required fields and confirm you are human." }, 400);
    const { name, email, company, phone, region, clientType, timeline, role, message } = parsed.data;

    if (!isEmail(email)) return json({ error: "A valid email is required." }, 400);

    const subject = `Project enquiry — ${clientType || "General"} · ${region || "—"} · ${company || name}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
        <h2 style="margin:0 0 12px">New project enquiry</h2>
        <p><strong>Client type:</strong> ${esc(clientType)}<br/>
        <strong>Region:</strong> ${esc(region)}<br/>
        <strong>Timeline:</strong> ${esc(timeline)}<br/>
        <strong>Role:</strong> ${esc(role)}</p>
        <hr/>
        <p><strong>Name:</strong> ${esc(name)}<br/>
        <strong>Company:</strong> ${esc(company)}<br/>
        <strong>Email:</strong> ${esc(email)}<br/>
        <strong>Phone:</strong> ${esc(phone) || "—"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${esc(message).replace(/\n/g, "<br/>")}</p>
      </div>`;

    const send = (from: string, to: string[]) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, reply_to: email, subject, html }),
      });

    let res = await send(FROM, RECIPIENTS);
    let data = await res.json();
    if (!res.ok) {
      console.error("Resend error (primary from)", data);
      // Fallback to a verified sending domain if the branded domain is not verified
      res = await send(FALLBACK_FROM, FALLBACK_RECIPIENTS);
      data = await res.json();
      if (!res.ok) {
        console.error("Resend error (fallback from)", data);
        return json({ error: "Failed to send enquiry" }, 502);
      }
    }
    return json({ id: data.id, status: "sent" });
  } catch (e) {
    console.error("send-enquiry error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
