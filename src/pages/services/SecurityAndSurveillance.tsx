import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SecurityAndSurveillance = () => {
  useEffect(() => {
    const title = "Security & Surveillance | Siyakha";
    const description = "CCTV, access control, and smart surveillance systems that protect your people and assets.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/security-and-surveillance`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/security-and-surveillance`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Security & Surveillance",
    serviceType: "Electronic security systems and monitoring",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you integrate with existing CCTV systems?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We can upgrade analog to IP, integrate with existing NVRs, and unify multi-brand environments." }
      },
      {
        "@type": "Question",
        name: "Can we monitor cameras remotely?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. We set up secure remote access and alerts with role-based permissions." }
      },
      {
        "@type": "Question",
        name: "Do you offer maintenance SLAs?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, with preventative maintenance, health checks and priority response." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Security & Surveillance</h1>
            <p className="text-muted-foreground mt-3">Safeguard your premises with smart security solutions.</p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-primary">Solutions Include</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>CCTV installation & integration (IP & analog)</li>
                <li>Remote access monitoring</li>
                <li>Motion‑triggered alerts & smart analytics</li>
                <li>Access control (biometric & RFID)</li>
                <li>Alarm system integration</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Modern security designed to give you peace of mind — 24/7.</p>
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
            <h2 className="text-xl font-semibold text-primary">Security & Surveillance FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you integrate with existing CCTV systems?</h3>
                <p>Yes. We can upgrade analog to IP, integrate with existing NVRs, and unify multi-brand environments.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can we monitor cameras remotely?</h3>
                <p>Absolutely. We set up secure remote access and alerts with role-based permissions.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you offer maintenance SLAs?</h3>
                <p>Yes, with preventative maintenance, health checks and priority response.</p>
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

export default SecurityAndSurveillance;
