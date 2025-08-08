import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import schoolProject from "@/assets/school-project.jpg";

const CloudAndEdgeSolutions = () => {
  useEffect(() => {
    const title = "Cloud & Edge Solutions | Siyakha";
    const description = "Microsoft 365 & Google Workspace, migrations, backups, disaster recovery, Zero Trust and secure remote work.";
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
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Cloud collaboration and secure infrastructure" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Cloud & Edge Solutions</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Empowering remote work, cloud collaboration and data security — migrations, DR, and Zero Trust.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl font-semibold text-primary">We Specialize In</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>Google Workspace & Microsoft 365 deployment</li>
                <li>Cloud backups & disaster recovery</li>
                <li>Data migration services</li>
                <li>Secure file‑sharing and remote access</li>
                <li>Edge computing for real‑time processing</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <img src={schoolProject} alt="Cloud adoption in education with collaboration tools" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png"} alt="Secure remote access and Zero Trust architecture" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/702d31a8-30a3-4dc4-880f-1366edaf8911.png"} alt="Cloud backup and disaster recovery" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/4ce3794c-caeb-4109-b893-cf137d3054d1.png"} alt="Edge computing enabling real‑time processing" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/908085b7-2411-4a24-8acc-a3515a6f1778.png"} alt="Microsoft rack servers powering private cloud infrastructure" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/5a56026a-1cff-4f03-85a4-7e78ec87c498.png"} alt="Microsoft storage nodes for high‑availability workloads" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/78863186-b345-495b-a0fb-54a33bee0268.png"} alt="HPE server rack cabinet prepared for datacenter deployment" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
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
