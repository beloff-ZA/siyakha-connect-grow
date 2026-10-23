/**
 * December 2026 server cabinet clean-up & network maintenance campaign.
 *
 * The offer is a DRAFT pending owner confirmation — every public surface must
 * carry the draft notice and must never invent prices, deadlines, slot counts
 * or countdowns.
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
  draftNotice:
    "Draft offer — pending owner confirmation. Final terms are confirmed on your written quotation.",
  cta: "Book now. Lock in your discount.",
  ctaFollow:
    "Request your preferred date; Siyakha will confirm availability, scope and quotation. No payment or confirmed appointment at this stage.",
  dateDisclaimer:
    "Dates are requests, not confirmed availability. Your discount is only reserved once your quotation is confirmed.",
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
