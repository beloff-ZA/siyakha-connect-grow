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

  // Internal notification — never blocks the customer.
  if (RESEND_API_KEY) {
    const c = call as Record<string, string>;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Siyakha Technology <notifications@angoladay.info>",
          to: ["nikita@siyakhatechnology.co.za"],
          subject: `Job card signed off: ${c.call_ref} — ${c.end_customer_company}`,
          text:
            `Job card ${c.call_ref} has been signed off by the customer.\n\n` +
            `Customer: ${c.end_customer_company}\nSite: ${c.site_address ?? ""} ${c.city ?? ""}\n` +
            `SIT/Call number: ${c.sit_number ?? ""}\nEngineer: ${c.engineer_name ?? ""}\n\n` +
            `Signed by: ${name}\nRating: ${rating}/5\nComment: ${comment || "—"}\nSigned at: ${signedAt}`,
        }),
      });
    } catch (e) {
      console.error("notify failed", e);
    }
  }

  return json({ ok: true, signed_at: signedAt });
});
