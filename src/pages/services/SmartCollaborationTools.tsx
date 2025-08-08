import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import schoolProject from "@/assets/school-project.jpg";

const SmartCollaborationTools = () => {
  useEffect(() => {
    const title = "Smart Collaboration Tools | Siyakha";
    const description = "VoIP, video meetings, digital whiteboards, CRM/ERP integrations, and user training for effective teamwork.";
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
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Unified communications and digital collaboration tools" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Smart Collaboration Tools</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Connect teams & classrooms with seamless digital tools — VoIP, video, whiteboards and more.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-xl font-semibold text-primary">Our Collaboration Services Include</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>VoIP systems (on‑premise & cloud‑hosted)</li>
                <li>Video conferencing setup (Zoom, Teams, Google Meet)</li>
                <li>Digital whiteboards and smart screens</li>
                <li>Integration with CRM and ERP platforms</li>
                <li>End‑user support and training</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={schoolProject} alt="Interactive classroom with digital whiteboards and conferencing" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/18df369d-304c-4290-97b8-53ae2aad27fb.png"} alt="Unified communication platform and devices" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png"} alt="VoIP handsets and call center tools" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/702d31a8-30a3-4dc4-880f-1366edaf8911.png"} alt="Teams and Zoom multi‑room meeting setup" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
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
