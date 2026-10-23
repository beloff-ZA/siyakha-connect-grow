import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyContactBar from "@/components/site/StickyContactBar";
import DecemberBookingForm from "@/components/campaign/DecemberBookingForm";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import rackPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";
import { CAMPAIGN } from "@/content/decemberCleanup";
import { BRAND } from "@/lib/brand";
import { CONTACT, telHref } from "@/lib/contact";

const INCLUDED = [
  "Assessment of the cabinet, then proposed cable organisation, re-dress and labelling",
  "Cleaning, airflow and thermal tidy-up within the agreed maintenance scope",
  "Switch, router and UPS health checks, documented for your team",
  "Patch-lead replacement planning, quoted before anything is replaced",
  "Firmware and configuration assessment; any changes subject to the agreed quotation and maintenance window.",
  "A working record of what was checked and what was agreed",
] as const;

const DecemberCleanup = () => {
  useEffect(() => {
    const title = `${CAMPAIGN.title} | ${BRAND.name}`;
    const description =
      "December 2026 server cabinet clean-up and network maintenance for Johannesburg, Sandton, Durban and KZN businesses. Request your preferred date — Siyakha confirms availability, scope and quotation.";
    document.title = title;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${BRAND.origin}${CAMPAIGN.path}`);
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BRAND.origin}${CAMPAIGN.path}`);
  }, []);

  const serviceJson = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: CAMPAIGN.title,
      description:
        "Server cabinet clean-up and network maintenance bookings for December 2026 in Johannesburg, Sandton, Durban and KZN.",
      provider: { "@id": `${BRAND.origin}/#organization` },
      areaServed: ["Johannesburg", "Sandton", "Durban", "KwaZulu-Natal"],
      url: `${BRAND.origin}${CAMPAIGN.path}`,
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Editorial hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={rackPoster.url}
              alt="Server cabinet with organised network cabling"
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/55 to-background" />
          </div>
          <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-16 pb-24 md:pt-24 md:pb-32">
            <img
              src={siyakhaWordmark}
              alt={`${BRAND.name} logo`}
              className="h-8 md:h-10 w-auto mb-10 brightness-0 invert"
              decoding="async"
            />
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/70 mb-5">
              {CAMPAIGN.monthLabel} · Server rooms & comms cabinets
            </p>
            <h1 className="font-display font-light text-4xl sm:text-5xl md:text-7xl tracking-[-0.02em] text-background leading-[1.02] max-w-4xl">
              {CAMPAIGN.phrase}
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-background/85 leading-relaxed">
              End the year with a cabinet you're proud to open. Siyakha assesses your server cabinet, proposes
              the cable organisation, cleaning and network maintenance it needs, and confirms scope and
              quotation with you before any work begins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors min-h-[48px] rounded-sm"
              >
                {CAMPAIGN.cta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={telHref}
                className="inline-flex items-center justify-center border border-background/40 text-background px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors min-h-[48px] rounded-sm"
              >
                Call {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        </section>

        {/* Draft offer card */}
        <section className="container mx-auto px-6 lg:px-10 -mt-10 relative z-20">
          <div
            className="max-w-3xl mx-auto bg-card border border-accent/25 rounded-sm p-6 md:p-8"
            style={{ boxShadow: "var(--shadow-medium)" }}
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent mb-3">December offer — draft</p>
            <p className="font-display text-xl md:text-2xl text-foreground leading-snug">
              {CAMPAIGN.offerHeadline}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{CAMPAIGN.offerExclusion}</p>
            <p className="mt-4 text-xs text-muted-foreground italic border-t border-border pt-4">
              {CAMPAIGN.draftNotice} {CAMPAIGN.dateDisclaimer}
            </p>
          </div>
        </section>

        {/* What's included */}
        <section className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              <p className="overline mb-4">What a visit covers</p>
              <h2 className="font-display font-light text-3xl md:text-4xl tracking-[-0.02em] text-foreground leading-tight">
                One visit. A cabinet that finally makes sense.
              </h2>
              <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                Whether it's a single wall cabinet in a practice or a full comms room in a multi-tenant
                building, the goal is the same: labelled, documented, cool-running infrastructure your team
                can support without guesswork.
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {CAMPAIGN.ctaFollow}
              </p>
            </div>
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base text-foreground">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Booking form */}
        <section id="book" className="bg-secondary/50 border-y border-border scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
            <div className="max-w-3xl mx-auto">
              <p className="overline mb-4">Request your December date</p>
              <h2 className="font-display font-light text-3xl md:text-4xl tracking-[-0.02em] text-foreground leading-tight mb-3">
                {CAMPAIGN.cta}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-10">
                {CAMPAIGN.ctaFollow}
              </p>
              <DecemberBookingForm />
            </div>
          </div>
        </section>

        {/* Fallback contact */}
        <section className="container mx-auto px-6 lg:px-10 py-14 md:py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Prefer to talk it through? Call{" "}
            <a href={telHref} className="underline text-foreground">
              {CONTACT.phoneDisplay}
            </a>
            , WhatsApp {CONTACT.whatsappDisplay}, or email{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline text-foreground">
              {CONTACT.email}
            </a>
            .
          </p>
          <Link
            to="/services/projects"
            className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground border-b border-foreground/25 pb-1"
          >
            See our network & cabling work <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <Footer />
      <StickyContactBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
    </div>
  );
};

export default DecemberCleanup;
