import { useEffect } from "react";
import { readAnalyticsConfig, getDataLayer } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

/**
 * Loads GTM and/or GA4 only when their IDs are supplied through environment
 * variables (VITE_GTM_ID, VITE_GA4_MEASUREMENT_ID, VITE_GOOGLE_ADS_ID,
 * VITE_GOOGLE_ADS_LEAD_LABEL). Nothing is hard-coded, and no page-view is ever
 * treated as a conversion.
 */
const AnalyticsScripts = () => {
  useEffect(() => {
    captureAttribution();
    const { gtmId, ga4Id, googleAdsId } = readAnalyticsConfig();
    getDataLayer();

    if (gtmId && !document.getElementById("siyakha-gtm")) {
      const script = document.createElement("script");
      script.id = "siyakha-gtm";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
      document.head.appendChild(script);
    }

    const gtagTarget = ga4Id || googleAdsId;
    if (gtagTarget && !document.getElementById("siyakha-gtag")) {
      const script = document.createElement("script");
      script.id = "siyakha-gtag";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagTarget)}`;
      document.head.appendChild(script);
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag = function gtag(...args: unknown[]) {
        getDataLayer().push(args as unknown as Record<string, unknown>);
      };
      w.gtag("js", new Date());
      if (ga4Id) w.gtag("config", ga4Id);
      if (googleAdsId) w.gtag("config", googleAdsId);
    }
  }, []);

  return null;
};

export default AnalyticsScripts;
