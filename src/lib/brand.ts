/**
 * Master public brand identity. Siyakha Technology Solutions is the company
 * brand; "Siyakha Interlink" is retained only as the infrastructure & security
 * capability name where it is genuinely relevant.
 */
export const BRAND = {
  /** Master public brand used in navigation, metadata and footer identity. */
  name: "Siyakha Technology Solutions",
  /** Legal entity wording. */
  legalName: "Siyakha Technology Solutions (Pty) Ltd",
  /** Conversational short form. */
  short: "Siyakha",
  /** Capability sub-brand — infrastructure & commercial security only. */
  capabilityBrand: "Siyakha Interlink",
  origin: "https://siyakhatechnology.co.za",
  homeTitle:
    "Siyakha Technology Solutions | Managed IT, Networking, CCTV & AI — Johannesburg & Durban",
  homeDescription:
    "Managed IT, networking, CCTV, websites and AI-powered business solutions for growing businesses, practices, schools and multi-site properties in Johannesburg, Sandton, Durban and KZN. One accountable team — Nikita Jacobs replies personally within one business day.",
  ownerReplyLine: "Nikita Jacobs will reply personally within one business day.",
} as const;

/** Trust points the owner has confirmed. Nothing here is invented. */
export const TRUST_POINTS = [
  "Level 1 B-BBEE SMME",
  "Owner-led response",
  "Johannesburg & Durban capacity",
  "One accountable technology partner",
  "Real engineers and project delivery",
] as const;
