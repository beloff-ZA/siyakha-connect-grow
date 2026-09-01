/**
 * Lead transport + owner lead-management data access.
 *
 * Public submissions NEVER touch the table directly: they go through the
 * `submit-lead` edge function, which validates, rate-limits and writes with
 * server-side privileges. The browser only ever holds the publishable key.
 */
import { supabase } from "@/integrations/supabase/client";
import type { LeadSubmissionPayload } from "./leadForm";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface WebsiteLead {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  source: string | null;
  landing_page: string | null;
  referrer: string | null;
  service: string;
  location: string;
  full_name: string;
  company: string | null;
  work_email: string;
  phone: string | null;
  whatsapp: string | null;
  project_description: string;
  budget_range: string | null;
  timeline: string | null;
  consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  follow_up_notes: string | null;
  contacted_at: string | null;
  notification_status: string | null;
  notification_error: string | null;
}

export interface SubmitLeadResult {
  ok: boolean;
  leadId?: string;
  duplicate?: boolean;
  emailDelivered?: boolean;
  error?: string;
}

/** Submits a validated enquiry. Resolves `ok: true` only on a confirmed DB write. */
export async function submitLead(payload: LeadSubmissionPayload): Promise<SubmitLeadResult> {
  try {
    const { data, error } = await supabase.functions.invoke("submit-lead", { body: payload });
    if (error) return { ok: false, error: error.message || "Submission failed" };
    const body = (data ?? {}) as Record<string, unknown>;
    if (body.error) return { ok: false, error: String(body.error) };
    if (!body.lead_id) return { ok: false, error: "The enquiry was not stored. Please try again." };
    return {
      ok: true,
      leadId: String(body.lead_id),
      duplicate: body.duplicate === true,
      emailDelivered: body.email_delivered === true,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export interface LeadFilters {
  status?: string;
  service?: string;
  location?: string;
  source?: string;
  from?: string;
  to?: string;
  search?: string;
}

/** Pure filter used by the owner view (and its tests). */
export function filterLeads(leads: WebsiteLead[], filters: LeadFilters): WebsiteLead[] {
  const term = filters.search?.trim().toLowerCase() ?? "";
  return leads.filter((lead) => {
    if (filters.status && filters.status !== "all" && lead.status !== filters.status) return false;
    if (filters.service && filters.service !== "all" && lead.service !== filters.service) return false;
    if (filters.location && filters.location !== "all" && lead.location !== filters.location) return false;
    if (filters.source && filters.source !== "all" && (lead.source ?? "") !== filters.source) return false;
    if (filters.from && lead.created_at < filters.from) return false;
    if (filters.to && lead.created_at > filters.to) return false;
    if (term) {
      const haystack = [
        lead.full_name,
        lead.company,
        lead.work_email,
        lead.phone,
        lead.whatsapp,
        lead.project_description,
        lead.service,
        lead.location,
        lead.source,
        lead.utm_campaign,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export async function listWebsiteLeads(): Promise<WebsiteLead[]> {
  const { data, error } = await supabase
    .from("website_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WebsiteLead[];
}

export async function updateWebsiteLead(
  id: string,
  patch: { status?: LeadStatus; follow_up_notes?: string | null },
): Promise<void> {
  const update: Record<string, unknown> = { ...patch };
  if (patch.status && patch.status !== "new") update.contacted_at = new Date().toISOString();
  const { error } = await supabase.from("website_leads").update(update).eq("id", id);
  if (error) throw error;
}
