import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmartEstateHero from "@/components/smart-estate/SmartEstateHero";
import CapabilityPillars from "@/components/smart-estate/CapabilityPillars";
import OffPlanProcess from "@/components/smart-estate/OffPlanProcess";
import SmartBuildingShowcase from "@/components/smart-estate/SmartBuildingShowcase";
import CommandCentreSection from "@/components/smart-estate/CommandCentreSection";
import DeveloperCTA from "@/components/smart-estate/DeveloperCTA";

const PAGE_URL = "/smart-estates";
const TITLE = "Smart Estates — Off-Plan & Commercial Real Estate Technology | Siyakha";
const DESCRIPTION = "Siyakha is the embedded technology partner for off-plan, luxury and commercial real estate developments. Smart buildings, AI surveillance, tenant platforms and 24/7 command centre.";

const SmartEstates = () => {
  useEffect(() => {
    document.title = TITLE;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(key, value); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}${PAGE_URL}`);
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Smart Estate Technology",
    serviceType: "Off-plan & commercial real estate technology",
    provider: { "@type": "Organization", name: "Siyakha Technology", telephone: "+27 81 501 2993" },
    areaServed: ["South Africa", "Angola", "Kenya", "United Kingdom", "EMEA"],
    url: `${origin}${PAGE_URL}`,
  }), [origin]);

  const faqJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When should we engage Siyakha on an off-plan development?",
        acceptedAnswer: { "@type": "Answer", text: "Ideally at concept and architectural drawing stage. Embedding technology design into the building from the outset costs a fraction of retrofitting after handover and unlocks features impossible to add later — such as smart-ready conduit, fibre risers and integrated access control." }
      },
      {
        "@type": "Question",
        name: "Do you work on commercial as well as residential estates?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our smart-estate methodology applies to commercial office parks, mixed-use developments, branded residences, marinas and corporate campuses across South Africa and EMEA." }
      },
      {
        "@type": "Question",
        name: "Can you white-label a tenant app for our development?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We deliver branded iOS and Android apps with concierge messaging, visitor management, access control, sub-metering and amenity booking — fully aligned to your development's identity." }
      },
      {
        "@type": "Question",
        name: "What does the 24/7 command centre cover?",
        acceptedAnswer: { "@type": "Answer", text: "AI-validated CCTV monitoring, intrusion response, building telemetry, tenant ticket triage, predictive maintenance alerts and quarterly portfolio-grade reporting for owners and operators." }
      },
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SmartEstateHero />
        <CapabilityPillars />
        <OffPlanProcess />
        <SmartBuildingShowcase />
        <CommandCentreSection />

        {/* FAQ — bespoke editorial */}
        <section className="py-24 md:py-32 bg-secondary/40 border-t border-border">
          <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
            <p className="overline mb-5">Frequently Considered</p>
            <h2 className="font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] text-foreground mb-12">
              Questions developers ask us first.
            </h2>
            <div className="border-t border-border">
              {faqJson.mainEntity.map((q, i) => (
                <details key={i} className="group border-b border-border py-6">
                  <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                    <span className="font-display text-lg md:text-xl font-normal text-foreground">{q.name}</span>
                    <span className="text-accent text-2xl font-light leading-none mt-1 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <DeveloperCTA />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    </div>
  );
};

export default SmartEstates;
