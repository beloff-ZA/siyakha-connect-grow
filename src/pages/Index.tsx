import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import HomeHero from "@/components/site/HomeHero";
import DivisionsBand from "@/components/site/DivisionsBand";
import IndustriesBand from "@/components/site/IndustriesBand";
import TrustBand from "@/components/site/TrustBand";
import CaseStudiesTriad from "@/components/site/CaseStudiesTriad";
import FaqBand from "@/components/site/FaqBand";
import QualifyForm from "@/components/site/QualifyForm";
import StickyContactBar from "@/components/site/StickyContactBar";
import Footer from "@/components/Footer";
import { buildLocalBusinessSchema } from "@/lib/seoSchema";
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
        { "@type": "City", name: "Johannesburg" },
        { "@type": "City", name: "Sandton" },
        { "@type": "City", name: "Durban" },
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
        <DivisionsBand />
        <IndustriesBand />
        <TrustBand />
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
