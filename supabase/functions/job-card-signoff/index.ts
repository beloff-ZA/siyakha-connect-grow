// Public edge function: job-card-signoff
// Lets an end customer view a customer-safe job card via a secret token and
// sign it off once. Append-only: an already signed card can never be re-signed.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const CUSTOMER_FIELDS = [
  "id",
  "call_ref",
  "sit_number",
  "logging_customer",
  "customer_order_ref",
  "end_customer_company",
  "end_customer_first_name",
  "end_customer_last_name",
  "contact_number",
  "site_address",
  "city",
  "fault_description",
  "engineer_name",
  "logged_at",
  "arrival_at",
  "departure_at",
  "opening_km",
  "closing_km",
  "fault_solution",
  "change_control",
  "signoff_status",
  "signed_by_name",
  "signed_at",
  "satisfaction_rating",
  "signoff_comment",
  "signature_data",
].join(", ");

function clean(input: unknown, max = 2000) {
  return String(input ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ ok: false, error: "Server not configured" }, 500);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const action = clean(body.action, 20);
  const token = clean(body.token, 100);
  if (!token || token.length < 20) return json({ ok: false, error: "Invalid link" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: call, error } = await admin
    .from("logged_calls")
    .select(CUSTOMER_FIELDS)
    .eq("signoff_token", token)
    .maybeSingle();

  if (error) {
    console.error("lookup failed", error);
    return json({ ok: false, error: "Could not load this job card" }, 500);
  }
  if (!call) return json({ ok: false, error: "This sign-off link is not valid" }, 404);

  const { data: items } = await admin
    .from("logged_call_items")
    .select("description, quantity, serial_number")
    .eq("call_id", (call as Record<string, string>).id)
    .order("sort_order", { ascending: true });

  if (action === "fetch") {
    return json({
      ok: true,
      card: call,
      items: items ?? [],
      already_signed: (call as Record<string, string>).signoff_status === "signed",
    });
  }

  if (action !== "sign") return json({ ok: false, error: "Unknown action" }, 400);

  if ((call as Record<string, string>).signoff_status === "signed") {
    return json({ ok: true, already_signed: true, signed_at: (call as Record<string, string>).signed_at });
  }

  const name = clean(body.signed_by_name, 120);
  const email = clean(body.signed_by_email, 160);
  const signature = String(body.signature_data ?? "");
  const rating = Number(body.satisfaction_rating);
  const comment = clean(body.signoff_comment, 1500);

  if (name.length < 2) return json({ ok: false, error: "Please enter your full name" }, 400);
  if (!signature.startsWith("data:image/") || signature.length > 400_000) {
    return json({ ok: false, error: "Please sign in the signature box" }, 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ ok: false, error: "Please rate the service from 1 to 5" }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address" }, 400);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const signedAt = new Date().toISOString();

  const { error: updErr } = await admin
    .from("logged_calls")
    .update({
      signoff_status: "signed",
      signed_by_name: name,
      signed_by_email: email || null,
      signature_data: signature,
      satisfaction_rating: rating,
      signoff_comment: comment || null,
      signed_at: signedAt,
      signed_ip: ip,
      signed_user_agent: req.headers.get("user-agent"),
      status: "signed_off",
    })
    .eq("signoff_token", token)
    .neq("signoff_status", "signed");

  if (updErr) {
    console.error("sign failed", updErr);
    return json({ ok: false, error: "Could not save your sign-off" }, 500);
  }

  // Completed job card email — never blocks the customer.
  if (RESEND_API_KEY) {
    const c = call as Record<string, string>;
    try {
      const { data: contacts } = await admin
        .from("logged_calls")
        .select("contact_email, client_email")
        .eq("signoff_token", token)
        .maybeSingle();

      const valid = (v?: string | null) => (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null);
      const to = Array.from(
        new Set(
          [
            "accounts@siyakhatechnology.co.za",
            "admin@siyakhatechnology.co.za",
            valid((contacts as Record<string, string> | null)?.client_email),
            valid((contacts as Record<string, string> | null)?.contact_email),
            valid(email),
          ].filter(Boolean) as string[],
        ),
      );

      const esc = (v: unknown) =>
        String(v ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const row = (label: string, value: unknown) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;width:210px">${label}</td>` +
        `<td style="padding:6px 10px;border-bottom:1px solid #eee;white-space:pre-wrap">${esc(value)}</td></tr>`;

      const mins =
        c.arrival_at && c.departure_at
          ? Math.max(0, Math.round((new Date(c.departure_at).getTime() - new Date(c.arrival_at).getTime()) / 60000))
          : null;
      const km =
        c.opening_km !== null && c.closing_km !== null ? Number(c.closing_km) - Number(c.opening_km) : null;
      const itemRows = (items ?? [])
        .map(
          (it: Record<string, unknown>) =>
            `<li>${esc(it.description)}${it.serial_number ? ` — S/N ${esc(it.serial_number)}` : ""} (Qty ${esc(it.quantity)})</li>`,
        )
        .join("");

      const html =
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:680px">` +
        `<p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0">Siyakha Technology Solutions</p>` +
        `<h2 style="margin:6px 0 2px">Completed job card — ${esc(c.call_ref)}</h2>` +
        `<p style="margin:0 0 14px;color:#666">Signed off by the customer on site${c.sit_number ? ` · SIT ${esc(c.sit_number)}` : ""}</p>` +
        `<table style="border-collapse:collapse;width:100%;font-size:14px">` +
        row("Customer logging the call", c.logging_customer) +
        row("Customer order / reference", c.customer_order_ref) +
        row("End customer", c.end_customer_company) +
        row("Site contact", [c.end_customer_first_name, c.end_customer_last_name].filter(Boolean).join(" ")) +
        row("Contact number", c.contact_number) +
        row("Site address", [c.site_address, c.city].filter(Boolean).join(", ")) +
        row("Engineer", c.engineer_name) +
        row("Fault / request logged", c.fault_description) +
        row("Work done on site", c.fault_solution) +
        row("Equipment change control", c.change_control) +
        row("Arrival", c.arrival_at ? new Date(c.arrival_at).toLocaleString("en-ZA") : "—") +
        row("Departure", c.departure_at ? new Date(c.departure_at).toLocaleString("en-ZA") : "—") +
        row("Time on site", mins === null ? "—" : `${Math.floor(mins / 60)} hrs ${mins % 60} min`) +
        row("Kilometres travelled", km === null || km < 0 ? "—" : `${km} km`) +
        row("Items used", itemRows ? `<ul style="margin:0;padding-left:18px">${itemRows}</ul>` : "None recorded") +
        row("Signed by", name) +
        row("Service rating", `${rating}/5`) +
        row("Customer comment", comment || "—") +
        row("Signed at", new Date(signedAt).toLocaleString("en-ZA")) +
        `</table>` +
        `<p style="margin:16px 0 4px;font-size:12px;color:#666">Customer signature</p>` +
        `<img src="${signature}" alt="Customer signature" style="max-height:110px;border:1px solid #eee;padding:6px" />` +
        `<p style="margin-top:18px;font-size:12px;color:#666">Siyakha Technology Solutions · 087 723 9183</p>` +
        `</div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Siyakha Technology <notifications@angoladay.info>",
          to,
          subject: `Signed job card ${c.call_ref} — ${c.end_customer_company}${c.sit_number ? ` (SIT ${c.sit_number})` : ""}`,
          html,
          text:
            `Job card ${c.call_ref} has been signed off by the customer.\n\n` +
            `Client (logged by): ${c.logging_customer ?? ""}\nEnd customer: ${c.end_customer_company}\n` +
            `Site: ${c.site_address ?? ""} ${c.city ?? ""}\n` +
            `SIT/Call number: ${c.sit_number ?? ""}\nEngineer: ${c.engineer_name ?? ""}\n\n` +
            `Work done: ${c.fault_solution ?? ""}\n\n` +
            `Signed by: ${name}\nRating: ${rating}/5\nComment: ${comment || "—"}\nSigned at: ${signedAt}`,
        }),
      });
    } catch (e) {
      console.error("notify failed", e);
    }
  }

  return json({ ok: true, signed_at: signedAt });
});
