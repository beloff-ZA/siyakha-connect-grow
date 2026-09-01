/**
 * Privacy-conscious marketing attribution.
 *
 * Captures UTM parameters and gclid from the first URL of the session, plus the
 * landing page and referrer, and keeps them for the life of the browser session
 * only (sessionStorage). No cross-site identifiers, no cookies, no profiling —
 * which keeps the site aligned with POPIA expectations.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  source: string;
}

const STORAGE_KEY = "siyakha.attribution.v1";

const clean = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 300);
  return trimmed.length ? trimmed : null;
};

/**
 * Classifies the lead source from whatever attribution we have. Falls back to a
 * neutral "website" rather than guessing a channel we cannot prove.
 */
export function deriveSource(input: Partial<Attribution>): string {
  if (input.gclid) return "google_ads";
  if (input.utm_source) return String(input.utm_source).toLowerCase();
  const ref = input.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (!host || host.endsWith("siyakhatechnology.co.za")) return "website";
    return `referral:${host}`;
  } catch {
    return "website";
  }
}

/**
 * Parses attribution out of a URL + referrer pair. Pure, so it is unit testable.
 */
export function parseAttribution(url: string, referrer?: string | null): Attribution {
  let params = new URLSearchParams();
  let landing: string | null = clean(url);
  try {
    const parsed = new URL(url);
    params = parsed.searchParams;
    landing = `${parsed.pathname}${parsed.search}`.slice(0, 300);
  } catch {
    /* keep raw url as landing page */
  }
  const base: Attribution = {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
    utm_term: clean(params.get("utm_term")),
    utm_content: clean(params.get("utm_content")),
    gclid: clean(params.get("gclid")),
    landing_page: landing,
    referrer: clean(referrer ?? null),
    source: "website",
  };
  return { ...base, source: deriveSource(base) };
}

const hasWindow = () => typeof window !== "undefined";

function read(): Attribution | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function write(value: Attribution) {
  if (!hasWindow()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage disabled — attribution simply is not persisted */
  }
}

/**
 * Merges freshly seen campaign parameters into the stored session attribution.
 * First-touch UTM/gclid values win so a later internal navigation cannot erase
 * the campaign that actually brought the visitor in.
 */
export function mergeAttribution(stored: Attribution | null, fresh: Attribution): Attribution {
  if (!stored) return fresh;
  const merged: Attribution = { ...stored };
  for (const key of [...UTM_KEYS, "gclid"] as const) {
    if (!merged[key] && fresh[key]) merged[key] = fresh[key];
  }
  merged.landing_page = stored.landing_page ?? fresh.landing_page;
  merged.referrer = stored.referrer ?? fresh.referrer;
  merged.source = stored.gclid || stored.utm_source ? stored.source : deriveSource(merged);
  return merged;
}

/** Call once per page load. Safe to call repeatedly. */
export function captureAttribution(): Attribution {
  if (!hasWindow()) {
    return parseAttribution("https://siyakhatechnology.co.za/", null);
  }
  const fresh = parseAttribution(window.location.href, document.referrer || null);
  const merged = mergeAttribution(read(), fresh);
  write(merged);
  return merged;
}

export function getAttribution(): Attribution {
  return read() ?? captureAttribution();
}
