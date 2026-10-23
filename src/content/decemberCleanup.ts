/**
 * December 2026 server cabinet clean-up & network maintenance campaign.
 *
 * Owner-approved labour offer; quote requests never confirm work or availability.
 */
export const CAMPAIGN = {
  slug: "december-cleanup",
  path: "/december-cleanup",
  phrase: "UNTANGLE THE YEAR.",
  title: "December Server Cabinet Clean-Up & Network Maintenance",
  leadSource: "december-cleanup-2026",
  /** Existing lead service this campaign maps to — no new enum values. */
  service: "Office Networking & Structured Cabling",
  offerHeadline: "20% off server clean-up and network-maintenance labour for December bookings.",
  offerExclusion: "Hardware and cabling materials excluded.",
  cta: "Request a quote",
  ctaFollow:
    "Send a cabinet photo and request your preferred date; Siyakha will confirm scope, quotation and availability. No payment or confirmed appointment at this stage.",
  dateDisclaimer:
    "Dates are requests, not confirmed availability. Scope, any downtime and offer terms are agreed in your quotation before work begins.",
  photoPrivacy: "Your contact details, request and cabinet photo go to the Siyakha quote team at nikita@siyakhatechnology.co.za and Ben@siyakhatechnology.co.za for assessment. Do not include people, credentials or confidential labels in your photo.",
  monthLabel: "December 2026",
  /** Inclusive booking window (ISO dates). */
  minDate: "2026-12-01",
  maxDate: "2026-12-31",
} as const;

export const CAMPAIGN_SCOPES = [
  "Server cabinet clean-up",
  "Network maintenance",
  "Both — clean-up and maintenance",
] as const;
export type CampaignScope = (typeof CAMPAIGN_SCOPES)[number];
