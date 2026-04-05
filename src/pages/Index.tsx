import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhySiyakha from "@/components/WhySiyakha";
import QuickNeeds from "@/components/QuickNeeds";
import Services from "@/components/Services";
import PackagePricing from "@/components/PackagePricing";
import HardwareShowcase from "@/components/HardwareShowcase";
import Industries from "@/components/Industries";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import LeadMagnet from "@/components/LeadMagnet";
import SmartHandsPartnership from "@/components/SmartHandsPartnership";
import BlogPreview from "@/components/BlogPreview";
import FaithSection from "@/components/FaithSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    const title = "IT Company Johannesburg & Northern Suburbs | Siyakha";
    const description = "Managed IT support in Johannesburg Northern Suburbs — Sandton, Randburg, Fourways, Midrand, Bryanston. Wi‑Fi, CCTV, cloud & cybersecurity by Siyakha.";
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://siyakha-connect-grow.lovable.app';

  const localBusinessJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ITService",
    "@id": `${origin}/#organization`,
    name: "Siyakha Tech Solutions (Pty) Ltd",
    alternateName: "Siyakha Technology",
    description: "BEE Level 1 managed IT services company in Johannesburg offering networking, Wi-Fi, CCTV, cybersecurity, cloud solutions, and field support across South Africa and internationally.",
    telephone: "+27 81 501 2993",
    email: "nikita@siyakhatechnology.co.za",
    url: origin,
    logo: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
    image: `${origin}/lovable-uploads/5dbb43e5-c5a0-4c28-a6aa-36941849d46a.png`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Johannesburg",
      addressRegion: "Gauteng",
      addressCountry: "ZA"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -26.1076,
      longitude: 28.0567
    },
    areaServed: [
      { "@type": "Country", name: "South Africa" },
      { "@type": "Country", name: "Angola" },
      { "@type": "Country", name: "Eswatini" },
      { "@type": "Country", name: "Bahrain" },
      { "@type": "Country", name: "Kazakhstan" },
      { "@type": "Country", name: "Mozambique" },
      { "@type": "Country", name: "Kenya" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "AdministrativeArea", name: "California, USA" },
      { "@type": "AdministrativeArea", name: "Europe" }
    ],
    sameAs: [
      "https://facebook.com/siyakhatechnology",
      "https://www.instagram.com/siyakhatech/",
      "https://linkedin.com/company/siyakhatechnology"
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "48",
      bestRating: "5"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "IT Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Managed IT Support" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Network Infrastructure & Wi-Fi" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "CCTV & Access Control" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cloud & Microsoft 365" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Field Support & Smart Hands" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cybersecurity Solutions" } }
      ]
    },
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00"
    }]
  }), [origin]);

  const websiteJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Siyakha Technology",
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }), [origin]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <QuickNeeds />
      <Services />
      <PackagePricing />
      <HardwareShowcase />
      <Industries />
      <Projects />
      <Testimonials />
      <SmartHandsPartnership />
      <LeadMagnet />
      <BlogPreview showCount={3} />
      <FaithSection />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJson) }} />
    </div>
  );
};

export default Index;
