import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InfrastructureAndNetworking = () => {
  useEffect(() => {
    const title = "Infrastructure & Networking | Siyakha";
    const description = "Structured cabling, switching and enterprise Wi‑Fi designed for performance and scale across your sites.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/infrastructure-and-networking`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/infrastructure-and-networking`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Infrastructure & Networking",
    serviceType: "Network infrastructure design and deployment",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you work with schools and multi-site businesses?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We design and deploy networks for schools, campuses and multi-branch organisations across South Africa and internationally." }
      },
      {
        "@type": "Question",
        name: "Can you upgrade our existing Wi‑Fi and cabling?",
        acceptedAnswer: { "@type": "Answer", text: "We audit, redesign and upgrade legacy Wi‑Fi and cabling to modern, secure standards with minimal downtime." }
      },
      {
        "@type": "Question",
        name: "Do you provide ongoing maintenance?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we offer SLAs with proactive monitoring, regular updates and rapid onsite support." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Infrastructure & Networking</h1>
            <p className="text-muted-foreground mt-3">Powering reliable connectivity across campuses and enterprises.</p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-primary">What We Offer</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>Structured cabling (Cat6, Cat6a, Fibre)</li>
                <li>Network design & consulting</li>
                <li>Switches, firewalls, and routers</li>
                <li>Wi‑Fi planning and access point deployment</li>
                <li>Ongoing network support and upgrades</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Ensure your connectivity is fast, secure, and built to scale.</p>
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
            <h2 className="text-xl font-semibold text-primary">Infrastructure & Networking FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you work with schools and multi-site businesses?</h3>
                <p>Yes. We design and deploy networks for schools, campuses and multi-branch organisations across South Africa and internationally.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can you upgrade our existing Wi‑Fi and cabling?</h3>
                <p>We audit, redesign and upgrade legacy Wi‑Fi and cabling to modern, secure standards with minimal downtime.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you provide ongoing maintenance?</h3>
                <p>Yes, we offer SLAs with proactive monitoring, regular updates and rapid onsite support.</p>
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

export default InfrastructureAndNetworking;
