import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import SmartEstateHero from "@/components/smart-estate/SmartEstateHero";
import CapabilityPillars from "@/components/smart-estate/CapabilityPillars";
import OffPlanProcess from "@/components/smart-estate/OffPlanProcess";
import TechPillarsGrid from "@/components/smart-estate/TechPillarsGrid";
import TurnkeyManifesto from "@/components/smart-estate/TurnkeyManifesto";
import VisionStatement from "@/components/smart-estate/VisionStatement";
import NextGenSolutions from "@/components/smart-estate/NextGenSolutions";
import BespokeBanner from "@/components/smart-estate/BespokeBanner";
import SmartCitiesSection from "@/components/smart-estate/SmartCitiesSection";
import SmartHandsSection from "@/components/smart-estate/SmartHandsSection";
import QsfpBanner from "@/components/smart-estate/QsfpBanner";
import GlobalConnectivityBanner from "@/components/smart-estate/GlobalConnectivityBanner";
import EnterpriseWifiBanner from "@/components/smart-estate/EnterpriseWifiBanner";
import CommandCentreSection from "@/components/smart-estate/CommandCentreSection";
import DeveloperCTA from "@/components/smart-estate/DeveloperCTA";
import FaithSection from "@/components/FaithSection";
import Footer from "@/components/Footer";

const CANONICAL_DOMAIN = "https://siyakhatechnology.co.za";

const Index = () => {
  useEffect(() => {
    const title = "Siyakha Interlink — Smart Estate, AI Surveillance & Border Radar | EMEA";
    const description = "Siyakha Interlink builds smart estates, AI surveillance, fibre networks, public WiFi and 5km border radar intruder detection across EMEA — Dubai, Riyadh, Doha, Johannesburg, London.";
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
    ensureMeta("property", "og:url", `${CANONICAL_DOMAIN}/`);
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${CANONICAL_DOMAIN}/`);
  }, []);

  const origin = CANONICAL_DOMAIN;

  const organisationJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#organization`,
    name: "Siyakha Interlink",
    alternateName: ["Siyakha Tech Solutions (Pty) Ltd", "Siyakha Technology"],
    description: "Integrated build, design and technology partner for development projects across EMEA. Smart estates, AI surveillance, 5km border radar intruder detection, fibre infrastructure, public WiFi and 24/7 command centre operations.",
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
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Country", name: "Qatar" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Angola" },
      { "@type": "Country", name: "Kenya" },
      { "@type": "AdministrativeArea", name: "EMEA" },
      { "@type": "AdministrativeArea", name: "GCC" }
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "48",
      bestRating: "5"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Smart Estate & Smart City Capabilities",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Smart Building Technology — IoT, access control, energy" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Connectivity Infrastructure — fibre, public WiFi, ISP" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Security & Surveillance with 24/7 Command Centre" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Digital Border Radar & Human Detection — 5km intruder detection" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tenant Experience Platforms & Digital Concierge" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Smart Waste Management & Fleet Digitalisation" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Heat, Smoke & Fire Detection — thermal analytics" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Airport Movement Tracking & Consumer Footfall Analytics" } }
      ]
    }
  }), [origin]);

  const websiteJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "Siyakha Interlink",
    url: origin,
    inLanguage: "en",
    publisher: { "@id": `${origin}/#organization` },
  }), [origin]);

  const faqJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does Siyakha Interlink build?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Siyakha Interlink is the integrated build, design and technology partner for development projects across EMEA — delivering smart buildings, fibre backbones, AI surveillance, public WiFi, border radar detection and tenant experience platforms inside refined real estate."
        }
      },
      {
        "@type": "Question",
        name: "How far does the border radar intruder detection reach?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our digital border radar detects intruders from up to 5km away. It fuses long-range radar with thermal PTZ optics and AI classification to distinguish humans from vehicles, wildlife and drones — with verified alerts dispatched to command centres and on-site response teams in seconds."
        }
      },
      {
        "@type": "Question",
        name: "Which regions do you operate across?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Siyakha Interlink delivers projects across EMEA and the GCC — including the UAE (Dubai), Saudi Arabia (Riyadh), Qatar (Doha), South Africa (Johannesburg, Cape Town), the United Kingdom (London), Angola and Kenya."
        }
      },
      {
        "@type": "Question",
        name: "Do you support smart city deployments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We engineer the intelligent city layer underneath modern precincts — public area WiFi, smart waste management, fleet digitalisation, airport movement tracking, AI risk-detection CCTV, airspace surveillance and thermal fire detection."
        }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SmartEstateHero />
      <BespokeBanner />
      <TurnkeyManifesto />
      <VisionStatement />
      <NextGenSolutions />
      <CapabilityPillars />
      <OffPlanProcess />
      <TechPillarsGrid />
      <QsfpBanner />
      <CommandCentreSection />
      <SmartCitiesSection />
      <SmartHandsSection />
      <EnterpriseWifiBanner />
      <GlobalConnectivityBanner />
      <DeveloperCTA />
      <FaithSection />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    </div>
  );
};

export default Index;
