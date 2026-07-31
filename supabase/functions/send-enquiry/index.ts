// Public edge function — website enquiry form (no auth required)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RECIPIENTS = ["nikita@siyakhatechnology.co.za"];
const FROM = "Siyakha Website <notifications@mail.siyakhatechnology.co.za>";

function esc(s: unknown) {
  return (s ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (!RESEND_API_KEY) return json({ error: "Email service not configured" }, 500);

  try {
    const p = await req.json();
    const name = (p.name ?? "").toString().trim().slice(0, 120);
    const email = (p.email ?? "").toString().trim().slice(0, 200);
    const company = (p.company ?? "").toString().trim().slice(0, 160);
    const phone = (p.phone ?? "").toString().trim().slice(0, 60);
    const region = (p.region ?? "").toString().trim().slice(0, 60);
    const clientType = (p.clientType ?? "").toString().trim().slice(0, 60);
    const timeline = (p.timeline ?? "").toString().trim().slice(0, 60);
    const message = (p.message ?? "").toString().trim().slice(0, 4000);

    if (!name || !isEmail(email) || !message) return json({ error: "Name, valid email and message are required." }, 400);

    const subject = `Project enquiry — ${clientType || "General"} · ${region || "—"} · ${company || name}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
        <h2 style="margin:0 0 12px">New project enquiry</h2>
        <p><strong>Client type:</strong> ${esc(clientType)}<br/>
        <strong>Region:</strong> ${esc(region)}<br/>
        <strong>Timeline:</strong> ${esc(timeline)}</p>
        <hr/>
        <p><strong>Name:</strong> ${esc(name)}<br/>
        <strong>Company:</strong> ${esc(company)}<br/>
        <strong>Email:</strong> ${esc(email)}<br/>
        <strong>Phone:</strong> ${esc(phone) || "—"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${esc(message).replace(/\n/g, "<br/>")}</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: RECIPIENTS, reply_to: email, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return json({ error: "Failed to send enquiry" }, 502);
    }
    return json({ id: data.id, status: "sent" });
  } catch (e) {
    console.error("send-enquiry error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
