import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhySiyakha from "@/components/WhySiyakha";
import Services from "@/components/Services";
import DraasFeature from "@/components/DraasFeature";
import FranchiseFeature from "@/components/FranchiseFeature";
import Industries from "@/components/Industries";
import Projects from "@/components/Projects";

import Testimonials from "@/components/Testimonials";
import LeadMagnet from "@/components/LeadMagnet";
import SmartHandsPartnership from "@/components/SmartHandsPartnership";
import BlogPreview from "@/components/BlogPreview";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    const title = "IT Company Johannesburg (Sandton) MSP | Siyakha";
    const description = "Managed IT support (MSP) in Johannesburg & Sandton. Business IT services, Wi‑Fi, CCTV, and cloud by Siyakha Tech Solutions.";
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

  const localBusinessJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Siyakha Tech Solutions (Pty) Ltd",
    telephone: "+27 81 501 2993",
    areaServed: ["Johannesburg", "Sandton", "Randburg", "Gauteng", "South Africa"],
    url: typeof window !== 'undefined' ? window.location.origin : undefined,
    sameAs: [
      "https://facebook.com/siyakhatechnology",
      "https://www.instagram.com/siyakhatech/",
      "https://linkedin.com/company/siyakhatechnology"
    ],
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00"
    }]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WhySiyakha />
      <Services />
      <DraasFeature />
      <FranchiseFeature />
      
      <Industries />
      <Projects />
      <Testimonials />
      <SmartHandsPartnership />
      <LeadMagnet />
      <BlogPreview showCount={3} />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }} />
    </div>
  );
};

export default Index;
