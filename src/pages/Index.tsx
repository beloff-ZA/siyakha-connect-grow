import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import SmartEstateHero from "@/components/smart-estate/SmartEstateHero";
import CapabilityPillars from "@/components/smart-estate/CapabilityPillars";
import OffPlanProcess from "@/components/smart-estate/OffPlanProcess";
import TechPillarsGrid from "@/components/smart-estate/TechPillarsGrid";
import TurnkeyManifesto from "@/components/smart-estate/TurnkeyManifesto";
import VisionStatement from "@/components/smart-estate/VisionStatement";
import NextGenSolutions from "@/components/smart-estate/NextGenSolutions";
import CommandCentreSection from "@/components/smart-estate/CommandCentreSection";
import DeveloperCTA from "@/components/smart-estate/DeveloperCTA";
import FaithSection from "@/components/FaithSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    const title = "Siyakha Interlink — Build, Design & Technology for UAE & EMEA Developments";
    const description = "Siyakha Interlink delivers integrated build, design and technology solutions for development projects across the UAE and EMEA — smart buildings, AI surveillance, fibre, tenant platforms and 24/7 command-centre operations.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/`);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://siyakhatechnology.co.za';

  const organisationJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#organization`,
    name: "Siyakha Interlink",
    alternateName: "Siyakha Tech Solutions (Pty) Ltd",
    description: "Integrated build, design and technology partner for development projects across the UAE and EMEA. Smart buildings, AI surveillance, fibre infrastructure, tenant platforms and 24/7 command centre operations.",
    telephone: ["+27 81 501 2993", "+971 50 867 3469"],
    email: "nikita@siyakhatechnology.co.za",
    url: origin,
    logo: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
    image: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Johannesburg",
      addressRegion: "Gauteng",
      addressCountry: "ZA"
    },
    areaServed: [
      { "@type": "Country", name: "South Africa" },
      { "@type": "Country", name: "Angola" },
      { "@type": "Country", name: "Kenya" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "AdministrativeArea", name: "EMEA" }
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "48",
      bestRating: "5"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Smart Estate Capabilities",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Smart Building Technology — IoT, access, energy" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Connectivity Infrastructure — Wi-Fi, fibre, ISP" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Security & Surveillance with Command Centre" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Digital Experience Platforms & Tenant Apps" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Predictive Maintenance & Smart Analytics" } }
      ]
    }
  }), [origin]);

  const websiteJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Siyakha Technology",
    url: origin,
  }), [origin]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SmartEstateHero />
      <TurnkeyManifesto />
      <VisionStatement />
      <NextGenSolutions />
      <CapabilityPillars />
      <OffPlanProcess />
      <TechPillarsGrid />
      <CommandCentreSection />
      <DeveloperCTA />
      <FaithSection />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJson) }} />
    </div>
  );
};

export default Index;
