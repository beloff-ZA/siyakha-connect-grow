import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import HomeHero from "@/components/site/HomeHero";
import { CAMPAIGN } from "@/content/decemberCleanup";
import DivisionsBand from "@/components/site/DivisionsBand";
import IndustriesBand from "@/components/site/IndustriesBand";
import TrustBand from "@/components/site/TrustBand";
import CaseStudiesTriad from "@/components/site/CaseStudiesTriad";
import LatestProjectFeature from "@/components/site/LatestProjectFeature";
import FaqBand from "@/components/site/FaqBand";
import QualifyForm from "@/components/site/QualifyForm";
import StickyContactBar from "@/components/site/StickyContactBar";
import Footer from "@/components/Footer";
import { buildLocalBusinessSchema, SERVICE_AREAS } from "@/lib/seoSchema";
import { HOME_FAQS, buildFaqSchema } from "@/content/faqs";
import { DIVISIONS } from "@/content/divisions";
import { BRAND } from "@/lib/brand";
import { CONTACT } from "@/lib/contact";

const Index = () => {
  useEffect(() => {
    const title = BRAND.homeTitle;
    const description = BRAND.homeDescription;
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
    ensureMeta("property", "og:url", `${BRAND.origin}/`);
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BRAND.origin}/`);
  }, []);

  const origin = BRAND.origin;

  const organisationJson = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${origin}/#organization`,
      name: BRAND.name,
      legalName: BRAND.legalName,
      alternateName: ["Siyakha Technology", "Siyakha Interlink"],
      description:
        "Siyakha Technology Solutions is a South African technology partner delivering managed IT, network and cabling projects, commercial CCTV and access control, websites and hosting, and AI and business-process solutions for growing businesses, professional practices, schools, student accommodation, restaurants and multi-site properties.",
      telephone: CONTACT.phoneE164,
      email: CONTACT.email,
      url: origin,
      logo: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
      image: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
      address: {
        "@type": "PostalAddress",
        addressRegion: "Gauteng",
        addressCountry: "ZA",
      },
      areaServed: [
        ...SERVICE_AREAS.map(area => ({ "@type": "City", name: area.name })),
        { "@type": "AdministrativeArea", name: "Gauteng" },
        { "@type": "AdministrativeArea", name: "KwaZulu-Natal" },
        { "@type": "Country", name: "South Africa" },
      ],
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
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Business technology services",
        itemListElement: DIVISIONS.map((d) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: d.title,
            description: d.teaser,
            url: `${origin}/services/${d.slug}`,
          },
        })),
      },
    }),
    [origin],
  );

  const websiteJson = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: BRAND.name,
      url: origin,
      inLanguage: "en",
      publisher: { "@id": `${origin}/#organization` },
    }),
    [origin],
  );

  const localBusinessJson = useMemo(() => buildLocalBusinessSchema(), []);
  const faqJson = useMemo(() => buildFaqSchema(HOME_FAQS), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HomeHero />
        {/* December 2026 campaign banner */}
        <section className="border-y border-border bg-secondary/60">
          <div className="container mx-auto px-6 lg:px-10 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-accent mb-2">
                {CAMPAIGN.monthLabel} · Cabinet photo quotes
              </p>
              <p className="font-display font-light text-2xl md:text-3xl tracking-[-0.02em] text-foreground leading-tight">
                {CAMPAIGN.phrase}
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                {CAMPAIGN.offerHeadline} {CAMPAIGN.offerExclusion}
              </p>
            </div>
            <Link
              to={CAMPAIGN.path}
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors min-h-[48px] rounded-sm self-start md:self-center"
            >
              {CAMPAIGN.cta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
        <DivisionsBand />
        <IndustriesBand />
        <TrustBand />
        <LatestProjectFeature />
        <CaseStudiesTriad />
        <FaqBand />
        <QualifyForm />
      </main>
      <Footer />
      <StickyContactBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    </div>
  );
};

export default Index;
