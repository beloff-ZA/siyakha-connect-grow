import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import officeProject from "@/assets/office-project.jpg";

const SecurityAndSurveillance = () => {
  useEffect(() => {
    const title = "Security & Surveillance | Siyakha";
    const description = "CCTV, access control, alarm integration, smart analytics, and remote monitoring for schools and enterprises.";
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
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Enterprise CCTV and access control monitoring" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Security & Surveillance</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Safeguard your premises with smart security solutions — CCTV, access control, alarms and analytics.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">Solutions Include</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>CCTV installation & integration (IP & analog)</li>
                <li>Remote access monitoring</li>
                <li>Motion‑triggered alerts & smart analytics</li>
                <li>Access control (biometric & RFID)</li>
                <li>Alarm system integration</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={"/lovable-uploads/de3c5edc-ea87-4242-bbb0-8782b25a22ec.png"} alt="Campus CCTV overhaul with fibre backbone" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={officeProject} alt="Access control and intercom network in office complex" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png"} alt="Secure retail surveillance and network segmentation" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png"} alt="AI‑enabled monitoring and smart alerts" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/fd161cb0-9b62-4f8f-a559-c382b6a38986.png"} alt="Security operations center with video wall monitoring multiple cameras" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/f6656558-5e83-4d94-bedb-d5b758a12048.png"} alt="Dahua outdoor bullet CCTV camera installed on perimeter" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/b1175ccd-d6f1-41ea-a02b-19b1103318a7.png"} alt="Siyakha CCTV service van on school campus" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
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
