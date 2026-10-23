/**
 * December 2026 clean-up campaign — form model, validation and payload
 * building. Pure functions so every rule is unit-testable with a mocked
 * transport (no live submissions, no owner emails).
 */
import { CAMPAIGN, CAMPAIGN_SCOPES, type CampaignScope } from "@/content/decemberCleanup";
import { LEAD_LOCATIONS, buildLeadPayload, type LeadSubmissionPayload } from "./leadForm";

export interface CampaignFormValues {
  scope: string;
  rack_count: string;
  location: string;
  city: string;
  preferred_date: string;
  alternate_date: string;
  full_name: string;
  company: string;
  work_email: string;
  phone: string;
  notes: string;
  consent: boolean;
}

export const emptyCampaignForm = (): CampaignFormValues => ({
  scope: "",
  rack_count: "",
  location: "",
  city: "",
  preferred_date: "",
  alternate_date: "",
  full_name: "",
  company: "",
  work_email: "",
  phone: "",
  notes: "",
  consent: false,
});

export type CampaignFieldErrors = Partial<Record<keyof CampaignFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,25}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isDecemberDate = (value: string): boolean =>
  DATE_RE.test(value) && value >= CAMPAIGN.minDate && value <= CAMPAIGN.maxDate;

export function validateCampaignForm(values: CampaignFormValues): CampaignFieldErrors {
  const errors: CampaignFieldErrors = {};

  if (!(CAMPAIGN_SCOPES as readonly string[]).includes(values.scope)) {
    errors.scope = "Choose what you need done.";
  }
  if (values.rack_count.trim()) {
    const n = Number(values.rack_count.trim());
    if (!Number.isInteger(n) || n < 1 || n > 200) {
      errors.rack_count = "Enter a whole number of cabinets (1–200), or leave it blank.";
    }
  }
  if (!(LEAD_LOCATIONS as readonly string[]).includes(values.location)) {
    errors.location = "Choose a site region.";
  }
  if (!values.city.trim()) errors.city = "Tell us the city or suburb.";
  else if (values.city.trim().length > 120) errors.city = "City / suburb is too long.";

  if (!values.preferred_date) {
    errors.preferred_date = "Request a preferred December 2026 date.";
  } else if (!isDecemberDate(values.preferred_date)) {
    errors.preferred_date = `Choose a date in ${CAMPAIGN.monthLabel} (1–31 December).`;
  }
  if (values.alternate_date) {
    if (!isDecemberDate(values.alternate_date)) {
      errors.alternate_date = `Choose a date in ${CAMPAIGN.monthLabel} (1–31 December).`;
    } else if (values.alternate_date === values.preferred_date) {
      errors.alternate_date = "Pick a different day from your preferred date.";
    }
  }

  if (values.full_name.trim().length < 2) errors.full_name = "Please enter your full name.";
  if (values.full_name.trim().length > 120) errors.full_name = "Name is too long.";
  if (values.company.trim().length > 160) errors.company = "Company name is too long.";

  const email = values.work_email.trim();
  if (!EMAIL_RE.test(email)) errors.work_email = "Enter a valid email address.";
  else if (email.length > 200) errors.work_email = "Email is too long.";

  if (!values.phone.trim()) errors.phone = "Add a phone number so we can confirm your booking.";
  else if (!PHONE_RE.test(values.phone.trim())) errors.phone = "Enter a valid contact number.";

  if (values.notes.trim().length > 1500) errors.notes = "Keep notes under 1,500 characters.";
  if (!values.consent) errors.consent = "Please confirm we may contact you about this booking request.";

  return errors;
}

export const isCampaignFormValid = (values: CampaignFormValues) =>
  Object.keys(validateCampaignForm(values)).length === 0;

const scopeLabel = (scope: string): CampaignScope =>
  (CAMPAIGN_SCOPES as readonly string[]).includes(scope) ? (scope as CampaignScope) : "Both — clean-up and maintenance";

/**
 * Structured, labelled project description. New campaign fields have no
 * dedicated columns, so they persist here — readable in the owner Leads view.
 */
export function buildCampaignDescription(values: CampaignFormValues): string {
  const lines = [
    `Campaign: December 2026 server cabinet clean-up & network maintenance (${CAMPAIGN.leadSource})`,
    `Scope requested: ${scopeLabel(values.scope)}`,
    `Site region: ${values.location}`,
    `City / suburb: ${values.city.trim()}`,
    `Cabinets / racks: ${values.rack_count.trim() || "Not specified"}`,
    `Preferred service date (request only): ${values.preferred_date}`,
    `Alternate date (request only): ${values.alternate_date || "None"}`,
    `Offer note: ${CAMPAIGN.offerHeadline} ${CAMPAIGN.offerExclusion} ${CAMPAIGN.draftNotice}`,
  ];
  const notes = values.notes.trim();
  if (notes) lines.push(`Client notes: ${notes}`);
  return lines.join("\n").slice(0, 4000);
}

/**
 * Maps the campaign form onto the existing website_leads payload. Preferred
 * date travels in `timeline`; everything else is labelled in the description.
 */
export function buildCampaignPayload(
  values: CampaignFormValues,
  attribution: Parameters<typeof buildLeadPayload>[1],
  extra: { pagePath?: string | null; formStartedAt?: number | null } = {},
): LeadSubmissionPayload {
  return buildLeadPayload(
    {
      full_name: values.full_name,
      company: values.company,
      work_email: values.work_email,
      phone: values.phone,
      whatsapp: "",
      service: CAMPAIGN.service,
      location: values.location,
      focus_areas: [],
      budget_range: "",
      timeline: `Requested date: ${values.preferred_date} (December 2026, not confirmed)`,
      project_description: buildCampaignDescription(values),
      consent: values.consent,
      honeypot: "",
    },
    { ...attribution, source: CAMPAIGN.leadSource },
    extra,
  );
}
