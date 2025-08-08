import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CloudAndEdgeSolutions = () => {
  useEffect(() => {
    const title = "Cloud & Edge Solutions | Siyakha";
    const description = "Migrations, backups, and resilient cloud platforms that enable secure, collaborative work.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/services/cloud-and-edge-solutions`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/cloud-and-edge-solutions`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cloud & Edge Solutions",
    serviceType: "Cloud collaboration, backup, and edge computing",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["South Africa", "Angola", "Swaziland", "Bahrain", "California", "Europe", "Kazakhstan"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you migrate from on‑prem to cloud?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We plan and execute secure migrations to Microsoft 365, Google Workspace and cloud backup platforms." }
      },
      {
        "@type": "Question",
        name: "Do you offer disaster recovery?",
        acceptedAnswer: { "@type": "Answer", text: "We implement 3‑2‑1 backups, immutable storage and rapid recovery procedures." }
      },
      {
        "@type": "Question",
        name: "Can you help with Zero Trust and secure remote work?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, including MFA, conditional access and endpoint hardening across devices." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Cloud & Edge Solutions</h1>
            <p className="text-muted-foreground mt-3">Empowering remote work, cloud collaboration & data security.</p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-primary">We Specialize In</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>Google Workspace & Microsoft 365 deployment</li>
                <li>Cloud backups & disaster recovery</li>
                <li>Data migration services</li>
                <li>Secure file‑sharing and remote access</li>
                <li>Edge computing for real‑time processing</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Work smarter, safer, and from anywhere.</p>
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
            <h2 className="text-xl font-semibold text-primary">Cloud & Edge FAQs</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Do you migrate from on‑prem to cloud?</h3>
                <p>Yes. We plan and execute secure migrations to Microsoft 365, Google Workspace and cloud backup platforms.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Do you offer disaster recovery?</h3>
                <p>We implement 3‑2‑1 backups, immutable storage and rapid recovery procedures.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can you help with Zero Trust and secure remote work?</h3>
                <p>Yes, including MFA, conditional access and endpoint hardening across devices.</p>
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

export default CloudAndEdgeSolutions;
