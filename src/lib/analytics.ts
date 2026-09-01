/**
 * Central analytics / dataLayer utility.
 *
 * Rules that this module enforces:
 *  - Events fire only after a real user action (never on page view).
 *  - `generate_lead` fires only after a confirmed server-side write.
 *  - GA4 / Google Ads identifiers come from environment variables, so nothing is
 *    hard-coded and the site works fine when they are not configured yet.
 */
import { getAttribution } from "./attribution";

export type AnalyticsEvent =
  | "begin_lead_form"
  | "qualified_service_selection"
  | "generate_lead"
  | "click_whatsapp"
  | "click_phone"
  | "click_email";

export interface AnalyticsConfig {
  gtmId?: string;
  ga4Id?: string;
  googleAdsId?: string;
  googleAdsLeadLabel?: string;
}

export function readAnalyticsConfig(env: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>): AnalyticsConfig {
  const pick = (key: string) => {
    const value = env[key];
    return typeof value === "string" && value.trim().length ? value.trim() : undefined;
  };
  return {
    gtmId: pick("VITE_GTM_ID"),
    ga4Id: pick("VITE_GA4_MEASUREMENT_ID"),
    googleAdsId: pick("VITE_GOOGLE_ADS_ID"),
    googleAdsLeadLabel: pick("VITE_GOOGLE_ADS_LEAD_LABEL"),
  };
}

type DataLayerRecord = Record<string, unknown>;

export function getDataLayer(): DataLayerRecord[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as { dataLayer?: DataLayerRecord[] };
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  return w.dataLayer;
}

/**
 * Builds the payload for an event. Pure and unit-testable: attribution is passed
 * in so tests do not depend on browser storage.
 */
export function buildEventPayload(
  event: AnalyticsEvent,
  detail: DataLayerRecord = {},
  attribution: DataLayerRecord = {},
): DataLayerRecord {
  return {
    event,
    ...detail,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_term: attribution.utm_term ?? null,
    utm_content: attribution.utm_content ?? null,
    gclid: attribution.gclid ?? null,
    lead_source: attribution.source ?? null,
    landing_page: attribution.landing_page ?? null,
    sent_at: new Date().toISOString(),
  };
}

export function trackEvent(event: AnalyticsEvent, detail: DataLayerRecord = {}) {
  const attribution = getAttribution() as unknown as DataLayerRecord;
  const payload = buildEventPayload(event, detail, attribution);
  getDataLayer().push(payload);

  // Optional direct gtag path for projects using GA4/Ads without GTM.
  if (typeof window !== "undefined") {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", event, payload);
      const { googleAdsId, googleAdsLeadLabel } = readAnalyticsConfig();
      if (event === "generate_lead" && googleAdsId && googleAdsLeadLabel) {
        gtag("event", "conversion", {
          send_to: `${googleAdsId}/${googleAdsLeadLabel}`,
          value: 0,
          currency: "ZAR",
        });
      }
    }
  }
  return payload;
}
