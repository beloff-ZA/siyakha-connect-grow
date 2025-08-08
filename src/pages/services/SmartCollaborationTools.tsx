import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SmartCollaborationTools = () => {
  useEffect(() => {
    const title = "Smart Collaboration Tools | Siyakha";
    const description = "VoIP, video meetings, and modern productivity suites that help teams communicate clearly and work efficiently.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/smart-collaboration-tools`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/smart-collaboration-tools`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Smart Collaboration Tools",
    serviceType: "Unified communications and collaboration systems",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you deploy VoIP and integrate with CRMs?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We deliver on‑prem and cloud VoIP with integrations to leading CRM and ERP platforms." }
      },
      {
        "@type": "Question",
        name: "Can you train our staff?",
        acceptedAnswer: { "@type": "Answer", text: "We support adoption with end‑user training and best‑practice guides." }
      },
      {
        "@type": "Question",
        name: "Do you provide managed support?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, with remote L1‑L3 support, monitoring and SLAs." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Smart Collaboration Tools</h1>
            <p className="text-muted-foreground mt-3">Connect teams & classrooms with seamless digital tools.</p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-primary">Our Collaboration Services Include</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>VoIP systems (on‑premise & cloud‑hosted)</li>
                <li>Video conferencing setup (Zoom, Teams, Google Meet)</li>
                <li>Digital whiteboards and smart screens</li>
                <li>Integration with CRM and ERP platforms</li>
                <li>End‑user support and training</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Keep your people connected with reliable, easy‑to‑use tools.</p>
              <div className="mt-6">
                <Link to="/contact#quote-form" className="inline-flex">
                  <Button className="cta-primary">Request a Quote</Button>
                </Link>
              </div>
            </section>
          </div>
        </section>

        <section className="py-8 md:py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-primary">Collaboration Tools FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you deploy VoIP and integrate with CRMs?</h3>
                <p>Yes. We deliver on‑prem and cloud VoIP with integrations to leading CRM and ERP platforms.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can you train our staff?</h3>
                <p>We support adoption with end‑user training and best‑practice guides.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you provide managed support?</h3>
                <p>Yes, with remote L1‑L3 support, monitoring and SLAs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
};

export default SmartCollaborationTools;
