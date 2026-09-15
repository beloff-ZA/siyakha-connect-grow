// Public edge function: job-card-signoff
// Lets an end customer view a customer-safe job card via a secret token and
// sign it off once. Append-only: an already signed card can never be re-signed.
// On signing (and on staff-triggered resend) it emails a replica of the Satio
// service request / sign-off form.
import { createClient } from "npm:@supabase/supabase-js@2";
import { jobCardSheetDocument, jobCardSheetFileName, jobCardSheetHtml, JOB_CARD_SHEET_CSS } from "../_shared/jobCardSheet.ts";

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

const STAFF_ROLES = ["admin", "siyakha_admin", "super_admin", "project_manager", "engineer"];

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
  "site_survey",
].join(", ");

function clean(input: unknown, max = 2000) {
  return String(input ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
}

const validEmail = (v?: string | null) => (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null);

type Row = Record<string, unknown>;

/** Sends the sheet replica. Never throws — notification must not block signing. */
async function emailSheet(card: Row, items: Row[], extraTo: (string | null)[]) {
  if (!RESEND_API_KEY) return [];
  const to = Array.from(
    new Set(
      [
        "accounts@siyakhatechnology.co.za",
        "admin@siyakhatechnology.co.za",
        ...extraTo.map((v) => validEmail(typeof v === "string" ? v : null)),
      ].filter(Boolean) as string[],
    ),
  );

  const sheet = jobCardSheetHtml(card, items as never);
  const doc = jobCardSheetDocument(card, items as never);
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111">` +
    `<p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 6px">Siyakha Technology Solutions</p>` +
    `<p style="margin:0 0 14px;font-size:13px">Completed and signed job card — a copy of the signed sign-off form is below and attached.</p>` +
    `<style>${JOB_CARD_SHEET_CSS}</style>${sheet}` +
    `<p style="margin-top:18px;font-size:12px;color:#666">Siyakha Technology Solutions · 087 723 9183</p>` +
    `</div>`;

  const ref = String(card.sit_number ?? card.call_ref ?? "");
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Siyakha Technology <notifications@angoladay.info>",
        to,
        subject: `Signed job card ${card.call_ref} — ${card.end_customer_company}${ref ? ` (SIT ${ref})` : ""}`,
        html,
        text:
          `Signed job card ${card.call_ref}\n` +
          `End customer: ${card.end_customer_company}\nSite: ${card.site_address ?? ""} ${card.city ?? ""}\n` +
          `Engineer: ${card.engineer_name ?? ""}\nWork done: ${card.fault_solution ?? ""}\n` +
          `Signed by: ${card.signed_by_name ?? ""} at ${card.signed_at ?? ""}\n` +
          `Rating: ${card.satisfaction_rating ?? ""}/5\nComment: ${card.signoff_comment ?? "—"}\n\n` +
          `The completed sign-off form is attached.`,
        attachments: [
          {
            filename: jobCardSheetFileName(card),
            content: btoa(unescape(encodeURIComponent(doc))),
          },
        ],
      }),
    });
    return to;
  } catch (e) {
    console.error("notify failed", e);
    return [];
  }
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

  const { data: itemsData } = await admin
    .from("logged_call_items")
    .select("description, quantity, serial_number")
    .eq("call_id", (call as Row).id as string)
    .order("sort_order", { ascending: true });
  const items = (itemsData ?? []) as Row[];

  const { data: contacts } = await admin
    .from("logged_calls")
    .select("contact_email, client_email")
    .eq("signoff_token", token)
    .maybeSingle();
  const contactRow = (contacts ?? {}) as Row;

  if (action === "fetch") {
    return json({
      ok: true,
      card: call,
      items,
      already_signed: (call as Row).signoff_status === "signed",
    });
  }

  // Staff-only: re-send the signed sheet without touching the record.
  if (action === "resend") {
    const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    if (!jwt) return json({ ok: false, error: "Sign in required" }, 401);
    const { data: userData } = await admin.auth.getUser(jwt);
    const uid = userData?.user?.id;
    if (!uid) return json({ ok: false, error: "Sign in required" }, 401);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", uid);
    const allowed = (roles ?? []).some((r: Row) => STAFF_ROLES.includes(String(r.role)));
    if (!allowed) return json({ ok: false, error: "Not allowed" }, 403);
    if ((call as Row).signoff_status !== "signed") {
      return json({ ok: false, error: "This job card has not been signed off yet" }, 400);
    }
    const sent = await emailSheet(call as Row, items, [
      contactRow.client_email as string,
      contactRow.contact_email as string,
    ]);
    return json({ ok: true, sent_to: sent });
  }

  if (action !== "sign") return json({ ok: false, error: "Unknown action" }, 400);

  if ((call as Row).signoff_status === "signed") {
    return json({ ok: true, already_signed: true, signed_at: (call as Row).signed_at });
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
  if (email && !validEmail(email)) {
    return json({ ok: false, error: "Please enter a valid email address" }, 400);
  }

  // Signing moment as captured on the sheet; must be sane (not far in future).
  let signedAt = new Date().toISOString();
  const supplied = clean(body.signed_at, 40);
  if (supplied) {
    const d = new Date(supplied);
    const skew = d.getTime() - Date.now();
    if (!Number.isNaN(d.getTime()) && skew < 60 * 60 * 1000 && skew > -1000 * 60 * 60 * 24 * 30) {
      signedAt = d.toISOString();
    }
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

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

  const signedCard: Row = {
    ...(call as Row),
    signoff_status: "signed",
    signed_by_name: name,
    signature_data: signature,
    satisfaction_rating: rating,
    signoff_comment: comment || null,
    signed_at: signedAt,
  };

  await emailSheet(signedCard, items, [
    contactRow.client_email as string,
    contactRow.contact_email as string,
    email,
  ]);

  return json({ ok: true, signed_at: signedAt });
});
