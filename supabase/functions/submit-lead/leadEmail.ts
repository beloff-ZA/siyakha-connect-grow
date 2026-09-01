/**
 * Pure lead-notification helpers shared by the submit-lead edge function and
 * the frontend test suite (no Deno / npm specifiers so vitest can import it).
 */
export const LEAD_FROM = "Siyakha Website <notifications@angoladay.info>";
export const LEAD_PRIMARY_RECIPIENT = "nikita@siyakhatechnology.co.za";
export const LEAD_BACKUP_RECIPIENT = "nikitajacobs01@gmail.com";
export const LEAD_OWNER_RECIPIENTS = [LEAD_PRIMARY_RECIPIENT, LEAD_BACKUP_RECIPIENT];

export interface ResendRequest {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  html: string;
}

export function buildLeadSubject(lead: Record<string, unknown>): string {
  const who = (lead.company as string | null) || (lead.full_name as string | null) || "Website enquiry";
  return `New lead — ${lead.service} · ${lead.location} · ${who}`;
}

/**
 * One request per owner recipient so a failure on one address (e.g. a spam
 * rejection at the business domain) never suppresses the backup copy.
 */
export function buildLeadEmailRequests(lead: Record<string, unknown>, html: string): ResendRequest[] {
  const subject = buildLeadSubject(lead);
  const replyTo = (lead.work_email as string | undefined) || undefined;
  return LEAD_OWNER_RECIPIENTS.map((to) => ({
    from: LEAD_FROM,
    to: [to],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject,
    html,
  }));
}

export const LEAD_EMAIL_FIELDS = [
  "full_name",
  "company",
  "work_email",
  "phone",
  "whatsapp",
  "service",
  "location",
  "focus_areas",
  "budget_range",
  "timeline",
  "project_description",
  "source",
  "landing_page",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "consent",
  "id",
] as const;
