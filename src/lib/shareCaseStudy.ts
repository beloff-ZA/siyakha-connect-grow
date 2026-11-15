import type { CaseStudy } from "@/content/caseStudies";

/** Absolute public URL for a case study, based on the current site origin. */
export function caseStudyShareUrl(slug: string, origin?: string): string {
  const base = (origin ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  return `${base}/case-studies/${slug}`;
}

/** Short factual share line: who the project was for and what it covered. */
export function caseStudyShareText(study: Pick<CaseStudy, "client" | "title">): string {
  return `Siyakha Technology project reference: ${study.client} — ${study.title}`;
}

/** WhatsApp share picker link (no recipient) with the project reference and URL. */
export function caseStudyWhatsAppUrl(study: Pick<CaseStudy, "client" | "title" | "slug">, origin?: string): string {
  const message = `${caseStudyShareText(study)}\n${caseStudyShareUrl(study.slug, origin)}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
