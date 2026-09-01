/**
 * Owner-operated B2B enquiry model: option lists, validation and payload
 * building. Kept pure so every rule is unit-testable.
 */

export const LEAD_SERVICES = [
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
export type LeadService = (typeof LEAD_SERVICES)[number];

export const LEAD_LOCATIONS = [
  "Johannesburg / Sandton",
  "Durban / KZN",
  "Other",
] as const;
export type LeadLocation = (typeof LEAD_LOCATIONS)[number];

export const LEAD_BUDGETS = [
  "Under R25,000",
  "R25,000 – R100,000",
  "R100,000 – R500,000",
  "R500,000+",
  "Monthly retainer / managed service",
  "Not sure yet",
] as const;

export const LEAD_TIMELINES = [
  "Urgent — this week",
  "Within 1 month",
  "1 – 3 months",
  "3 – 6 months",
  "Planning / budgeting",
] as const;

/** Sub/qualification choices shown when Business Process & AI Solutions is chosen. */
export const AI_FOCUS_AREAS = [
  "AI voice agents",
  "Enquiry handling",
  "Appointment booking",
  "Workflow automation",
  "Document processing",
  "CRM follow-up automation",
  "Operational process improvement",
] as const;
export type LeadFocusArea = (typeof AI_FOCUS_AREAS)[number];

export const AI_SERVICE: LeadService = "Business Process & AI Solutions";

/**
 * "Serious project" services. Selecting one of these is a stronger buying signal
 * and is reported to analytics as a qualified service selection.
 */
export const QUALIFIED_SERVICES: readonly LeadService[] = [
  "Managed IT Services",
  "Field Support Engineers / Smart Hands",
  "Office Networking & Structured Cabling",
  "Business Wi-Fi",
  "School ICT & Wi-Fi",
  "Student Accommodation Connectivity",
  "Commercial CCTV & Access Control",
  "Business Process & AI Solutions",
];

export function isQualifiedService(service: string): boolean {
  return (QUALIFIED_SERVICES as readonly string[]).includes(service);
}

/** Maps a page/route slug or ?service= value to a preselected service. */
const SERVICE_ALIASES: Record<string, LeadService> = {
  "managed-it": "Managed IT Services",
  "managed-it-services": "Managed IT Services",
  "remote-support": "Remote IT Support",
  "remote-it-support": "Remote IT Support",
  "smart-hands": "Field Support Engineers / Smart Hands",
  "field-support": "Field Support Engineers / Smart Hands",
  "partner-engineers": "Field Support Engineers / Smart Hands",
  networking: "Office Networking & Structured Cabling",
  "cloud-networking": "Office Networking & Structured Cabling",
  cabling: "Office Networking & Structured Cabling",
  "structured-cabling": "Office Networking & Structured Cabling",
  wifi: "Business Wi-Fi",
  "business-wifi": "Business Wi-Fi",
  "brand-wifi": "Business Wi-Fi",
  schools: "School ICT & Wi-Fi",
  "school-ict": "School ICT & Wi-Fi",
  "student-accommodation": "Student Accommodation Connectivity",
  accommodation: "Student Accommodation Connectivity",
  cctv: "Commercial CCTV & Access Control",
  "security-surveillance": "Commercial CCTV & Access Control",
  "access-control": "Commercial CCTV & Access Control",
  restaurant: "Restaurant Technology",
  "restaurant-technology": "Restaurant Technology",
  websites: "Websites, Hosting & Domains",
  "regional-services": "Websites, Hosting & Domains",
  hosting: "Websites, Hosting & Domains",
  "ai-agents": "Business Process & AI Solutions",
  "ai-automation": "Business Process & AI Solutions",
  "ai-voice-agents": "Business Process & AI Solutions",
  "business-process": "Business Process & AI Solutions",
  "automation": "Business Process & AI Solutions",
  "ai-process-automation-&-voice-agents": "Business Process & AI Solutions",
  commercial: "Office Networking & Structured Cabling",
};

export function resolveService(value: string | null | undefined): LeadService | null {
  if (!value) return null;
  const raw = value.trim();
  if ((LEAD_SERVICES as readonly string[]).includes(raw)) return raw as LeadService;
  const key = raw.toLowerCase().replace(/\s+/g, "-");
  return SERVICE_ALIASES[key] ?? null;
}

/** Builds the deep link that routes a page CTA into the enquiry form. */
export function enquiryHref(serviceSlugOrName?: string | null, locationValue?: string | null): string {
  const params = new URLSearchParams();
  const service = resolveService(serviceSlugOrName ?? null);
  if (service) params.set("service", service);
  if (locationValue) params.set("location", locationValue);
  const query = params.toString();
  return `/${query ? `?${query}` : ""}#enquiry`;
}

export interface LeadFormValues {
  full_name: string;
  company: string;
  work_email: string;
  phone: string;
  whatsapp: string;
  service: string;
  location: string;
  focus_areas: string[];
  budget_range: string;
  timeline: string;
  project_description: string;
  consent: boolean;
  honeypot: string;
}

export const emptyLeadForm = (): LeadFormValues => ({
  full_name: "",
  company: "",
  work_email: "",
  phone: "",
  whatsapp: "",
  service: "",
  location: "",
  focus_areas: [],
  budget_range: "",
  timeline: "",
  project_description: "",
  consent: false,
  honeypot: "",
});

export type LeadFieldErrors = Partial<Record<keyof LeadFormValues, string>>;

export function isAiService(service: string): boolean {
  return resolveService(service) === AI_SERVICE;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "webmail.co.za"];

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return FREE_EMAIL_DOMAINS.includes(domain);
}

export function validateLeadForm(values: LeadFormValues): LeadFieldErrors {
  const errors: LeadFieldErrors = {};
  if (values.full_name.trim().length < 2) errors.full_name = "Please enter your full name.";
  if (values.full_name.trim().length > 120) errors.full_name = "Name is too long.";
  if (values.company.trim().length && values.company.trim().length > 160) errors.company = "Company name is too long.";
  const email = values.work_email.trim();
  if (!EMAIL_RE.test(email)) errors.work_email = "Enter a valid work email address.";
  else if (email.length > 200) errors.work_email = "Email is too long.";
  if (!values.phone.trim() && !values.whatsapp.trim()) {
    errors.phone = "Add a phone or WhatsApp number so we can reach you.";
  }
  if (values.phone.trim() && !/^[+\d][\d\s()-]{6,25}$/.test(values.phone.trim())) {
    errors.phone = "Enter a valid contact number.";
  }
  if (!resolveService(values.service)) errors.service = "Choose the service you need.";
  if (!(LEAD_LOCATIONS as readonly string[]).includes(values.location)) errors.location = "Choose a location.";
  if (isAiService(values.service)) {
    const picked = values.focus_areas.filter((a) => (AI_FOCUS_AREAS as readonly string[]).includes(a));
    if (picked.length === 0) errors.focus_areas = "Select at least one area you want to automate.";
  }
  if (values.project_description.trim().length < 20) {
    errors.project_description = "Please give us at least a sentence or two about the site and scope.";
  }
  if (values.project_description.trim().length > 4000) {
    errors.project_description = "Description is too long.";
  }
  if (!values.consent) errors.consent = "Please confirm we may contact you about this enquiry.";
  return errors;
}

export const isLeadFormValid = (values: LeadFormValues) =>
  Object.keys(validateLeadForm(values)).length === 0;

export interface LeadSubmissionPayload {
  full_name: string;
  company: string | null;
  work_email: string;
  phone: string | null;
  whatsapp: string | null;
  service: string;
  location: string;
  focus_areas: string[];
  budget_range: string | null;
  timeline: string | null;
  project_description: string;
  consent: boolean;
  honeypot: string;
  form_started_at: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  source: string;
  page_path: string | null;
}

const orNull = (v: string) => {
  const t = v.trim();
  return t.length ? t : null;
};

export function buildLeadPayload(
  values: LeadFormValues,
  attribution: Partial<LeadSubmissionPayload> & { source?: string },
  extra: { pagePath?: string | null; formStartedAt?: number | null } = {},
): LeadSubmissionPayload {
  return {
    full_name: values.full_name.trim(),
    company: orNull(values.company),
    work_email: values.work_email.trim().toLowerCase(),
    phone: orNull(values.phone),
    whatsapp: orNull(values.whatsapp),
    service: values.service,
    location: values.location,
    focus_areas: isAiService(values.service)
      ? values.focus_areas.filter((a) => (AI_FOCUS_AREAS as readonly string[]).includes(a))
      : [],
    budget_range: orNull(values.budget_range),
    timeline: orNull(values.timeline),
    project_description: values.project_description.trim(),
    consent: values.consent === true,
    honeypot: values.honeypot ?? "",
    form_started_at: extra.formStartedAt ?? null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_term: attribution.utm_term ?? null,
    utm_content: attribution.utm_content ?? null,
    gclid: attribution.gclid ?? null,
    landing_page: attribution.landing_page ?? null,
    referrer: attribution.referrer ?? null,
    source: attribution.source ?? "website",
    page_path: extra.pagePath ?? null,
  };
}
