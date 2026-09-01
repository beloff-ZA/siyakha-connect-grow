/**
 * Structured data builders. Only facts already published on this site are used —
 * no invented offices, reviews or claims.
 */
import { CONTACT } from "./contact";

export const SITE_ORIGIN = "https://siyakhatechnology.co.za";

/** Areas Siyakha genuinely serves, used for crawlable location copy and schema. */
export const SERVICE_AREAS = [
  { name: "Johannesburg", region: "Gauteng" },
  { name: "Sandton", region: "Gauteng" },
  { name: "Durban", region: "KwaZulu-Natal" },
] as const;

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_ORIGIN}/#localbusiness`,
    name: "Siyakha Technology",
    url: SITE_ORIGIN,
    telephone: CONTACT.phoneE164,
    email: CONTACT.email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Gauteng",
      addressCountry: "ZA",
    },
    areaServed: SERVICE_AREAS.map((area) => ({
      "@type": "City",
      name: area.name,
      containedInPlace: { "@type": "AdministrativeArea", name: area.region },
    })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: CONTACT.phoneE164,
        email: CONTACT.email,
        areaServed: "ZA",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function buildServiceSchema(input: {
  serviceType: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.serviceType,
    name: input.serviceType,
    description: input.description,
    url: `${SITE_ORIGIN}${input.path}`,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE_ORIGIN}/#localbusiness`,
      name: "Siyakha Technology",
      telephone: CONTACT.phoneE164,
      email: CONTACT.email,
      url: SITE_ORIGIN,
    },
    areaServed: SERVICE_AREAS.map((area) => ({ "@type": "City", name: area.name })),
  };
}
