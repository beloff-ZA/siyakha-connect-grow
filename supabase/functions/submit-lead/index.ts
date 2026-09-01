/**
 * Public edge function: submit-lead
 *
 * - No auth required (verify_jwt = false) — it is the public website enquiry API.
 * - Validates every field with Zod, rejects honeypot/too-fast bot submissions.
 * - Rate limits per hashed IP.
 * - Stores the lead with server-side privileges (service role never leaves here).
 * - Emails the owner via Resend. Email failure NEVER fails the stored lead.
 *
 * Required secret: RESEND_API_KEY (already configured for this project's other
 * mail functions). Without it the lead is still stored and flagged 'skipped'.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

import {
  buildLeadEmailRequests,
  LEAD_FROM,
  LEAD_OWNER_RECIPIENTS,
  LEAD_PRIMARY_RECIPIENT,
} from "./leadEmail.ts";

const OWNER_EMAIL = LEAD_PRIMARY_RECIPIENT;
const PHONE = "087 723 9183";
const WHATSAPP = "+27815012993";

const SERVICES = [
  "Managed IT Services",
  "Remote IT Support",
  "Field Support Engineers / Smart Hands",
  "Office Networking & Structured Cabling",
  "Business Wi-Fi",
  "School ICT & Wi-Fi",
  "Student Accommodation Connectivity",
  "Commercial CCTV & Access Control",
  "Restaurant Technology",
  "Websites, Hosting & Domains",
  "Business Process & AI Solutions",
  "Other",
] as const;

const FOCUS_AREAS = [
  "AI voice agents",
  "Enquiry handling",
  "Appointment booking",
  "Workflow automation",
  "Document processing",
  "CRM follow-up automation",
  "Operational process improvement",
] as const;

const LOCATIONS = ["Johannesburg / Sandton", "Durban / KZN", "Other"] as const;

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional().transform((v) => (v && v.length ? v : null));

const LeadSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  company: nullableText(160),
  work_email: z.string().trim().email().max(200),
  phone: nullableText(40),
  whatsapp: nullableText(40),
  service: z.enum(SERVICES),
  location: z.enum(LOCATIONS),
  focus_areas: z.array(z.enum(FOCUS_AREAS)).max(7).optional().default([]),
  budget_range: nullableText(80),
  timeline: nullableText(80),
  project_description: z.string().trim().min(20).max(4000),
  consent: z.literal(true),
  honeypot: z.string().max(200).optional().default(""),
  form_started_at: z.number().nullable().optional(),
  utm_source: nullableText(300),
  utm_medium: nullableText(300),
  utm_campaign: nullableText(300),
  utm_term: nullableText(300),
  utm_content: nullableText(300),
  gclid: nullableText(300),
  landing_page: nullableText(300),
  referrer: nullableText(300),
  source: z.string().trim().max(120).optional().default("website"),
  page_path: nullableText(300),
});

function esc(value: unknown) {
  return (value ?? "—").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildEmail(lead: Record<string, unknown>) {
  const waDigits = (lead.whatsapp as string | null)?.replace(/[^\d]/g, "") ?? "";
  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#111"><strong>${esc(value)}</strong></td></tr>`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:680px">
    <h2 style="margin:0 0 4px">New project enquiry</h2>
    <p style="margin:0 0 16px;color:#555">${esc(lead.service)} · ${esc(lead.location)} · ${esc(lead.created_at)}</p>
    <table cellpadding="0" cellspacing="0" style="font-size:14px">
      ${row("Name", lead.full_name)}
      ${row("Company", lead.company)}
      ${row("Work email", lead.work_email)}
      ${row("Phone", lead.phone)}
      ${row("WhatsApp", lead.whatsapp)}
      ${row("Service", lead.service)}
      ${row("Location", lead.location)}
      ${row("Focus areas", Array.isArray(lead.focus_areas) && lead.focus_areas.length ? (lead.focus_areas as string[]).join(", ") : "—")}
      ${row("Budget", lead.budget_range)}
      ${row("Timeline", lead.timeline)}
    </table>
    <h3 style="margin:20px 0 6px;font-size:15px">Project description</h3>
    <p style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(lead.project_description)}</p>
    <h3 style="margin:20px 0 6px;font-size:15px">Attribution</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:13px">
      ${row("Source", lead.source)}
      ${row("Landing page", lead.landing_page)}
      ${row("Referrer", lead.referrer)}
      ${row("utm_source", lead.utm_source)}
      ${row("utm_medium", lead.utm_medium)}
      ${row("utm_campaign", lead.utm_campaign)}
      ${row("utm_term", lead.utm_term)}
      ${row("utm_content", lead.utm_content)}
      ${row("gclid", lead.gclid)}
      ${row("Consent given", lead.consent ? "Yes" : "No")}
      ${row("Lead ID", lead.id)}
    </table>
    <p style="margin:24px 0 0">
      <a href="tel:${esc(lead.phone ?? "")}" style="background:#111;color:#fff;padding:10px 16px;text-decoration:none;display:inline-block;margin-right:8px">Call back</a>
      <a href="mailto:${esc(lead.work_email)}?subject=Siyakha%20Technology%20—%20your%20enquiry" style="background:#111;color:#fff;padding:10px 16px;text-decoration:none;display:inline-block;margin-right:8px">Reply by email</a>
      ${waDigits ? `<a href="https://wa.me/${waDigits}" style="background:#25D366;color:#fff;padding:10px 16px;text-decoration:none;display:inline-block">WhatsApp</a>` : ""}
    </p>
    <p style="margin-top:24px;font-size:12px;color:#777">Siyakha Technology · ${PHONE} · WhatsApp ${WHATSAPP} · ${OWNER_EMAIL}</p>
  </div>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "Server not configured" }, 500);

  try {
    const parsed = LeadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return json(
        { error: "Please check the highlighted fields and try again.", fields: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const input = parsed.data;

    // Spam gates: hidden honeypot field, and submissions faster than a human.
    if (input.honeypot && input.honeypot.trim().length > 0) {
      return json({ error: "Submission rejected." }, 400);
    }
    if (input.form_started_at && Date.now() - input.form_started_at < 2500) {
      return json({ error: "That was a little too fast — please try again." }, 429);
    }
    if (!input.phone && !input.whatsapp) {
      return json({ error: "A phone or WhatsApp number is required." }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const ipHash = await sha256(`siyakha-lead:${ip}`);
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 400);

    // Rate limit: max 5 enquiries per hashed IP per hour.
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("website_leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso);
    if ((count ?? 0) >= 5) {
      return json({ error: "Too many enquiries from this connection. Please email or WhatsApp us instead." }, 429);
    }

    // Duplicate protection: same email + service + description within the day.
    const dedupeKey = await sha256(
      [
        input.work_email.toLowerCase(),
        input.service,
        input.project_description.toLowerCase().replace(/\s+/g, " "),
        new Date().toISOString().slice(0, 10),
      ].join("|"),
    );

    const insertRow = {
      status: "new",
      source: input.source || "website",
      landing_page: input.landing_page,
      referrer: input.referrer,
      service: input.service,
      location: input.location,
      focus_areas: input.service === "Business Process & AI Solutions" ? input.focus_areas : [],
      full_name: input.full_name,
      company: input.company,
      work_email: input.work_email.toLowerCase(),
      phone: input.phone,
      whatsapp: input.whatsapp,
      project_description: input.project_description,
      budget_range: input.budget_range,
      timeline: input.timeline,
      consent: true,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_term: input.utm_term,
      utm_content: input.utm_content,
      gclid: input.gclid,
      ip_hash: ipHash,
      user_agent: userAgent,
      dedupe_key: dedupeKey,
      notification_status: RESEND_API_KEY ? "pending" : "skipped",
    };

    const { data: inserted, error: insertError } = await admin
      .from("website_leads")
      .insert(insertRow)
      .select("*")
      .single();

    let lead = inserted;
    let duplicate = false;

    if (insertError) {
      // Unique dedupe violation → treat as the same lead, do not create a copy.
      if ((insertError as { code?: string }).code === "23505") {
        const { data: existing } = await admin
          .from("website_leads")
          .select("*")
          .eq("dedupe_key", dedupeKey)
          .maybeSingle();
        if (existing) {
          duplicate = true;
          lead = existing;
        }
      }
      if (!lead) {
        console.error("submit-lead insert error", insertError);
        return json({ error: "We could not store your enquiry. Please WhatsApp or call us." }, 500);
      }
    }

    // The lead is stored. Email is best-effort from here on.
    let emailDelivered = false;
    if (RESEND_API_KEY && !duplicate) {
      const html = buildEmail(lead as Record<string, unknown>);
      const requests = buildLeadEmailRequests(lead as Record<string, unknown>, html);
      const errors: string[] = [];
      // Each owner recipient is sent separately: one rejection never blocks the other copy.
      for (const request of requests) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(request),
          });
          if (res.ok) emailDelivered = true;
          else errors.push(`${request.to[0]}: ${(await res.text()).slice(0, 300)}`);
        } catch (e) {
          errors.push(`${request.to[0]}: ${String(e).slice(0, 300)}`);
        }
      }
      const errorDetail = errors.length ? errors.join(" | ").slice(0, 500) : null;
      await admin
        .from("website_leads")
        .update({
          notification_status: emailDelivered ? (errorDetail ? "partial" : "sent") : "failed",
          notification_error: errorDetail,
        })
        .eq("id", lead.id);
      if (errorDetail) console.error("submit-lead email failure", errorDetail);
    }

    return json({
      lead_id: lead.id,
      duplicate,
      email_delivered: emailDelivered,
      status: "stored",
    });
  } catch (e) {
    console.error("submit-lead error", e);
    return json({ error: "Unexpected error. Please WhatsApp or call us." }, 500);
  }
});
