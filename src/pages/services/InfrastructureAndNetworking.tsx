import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import officeProject from "@/assets/office-project.jpg";
import schoolProject from "@/assets/school-project.jpg";

const InfrastructureAndNetworking = () => {
  useEffect(() => {
    const title = "Infrastructure & Networking | Siyakha";
    const description = "Structured cabling, Wi‑Fi 6, secure networks, office moves, server relocations, and multi‑site rollouts.";
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
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Enterprise network infrastructure cabling and Wi‑Fi" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Infrastructure & Networking</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Powering reliable connectivity across campuses and enterprises — from cabling and Wi‑Fi to secure core networks and office moves.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Quote</Button></Link>
              <Link to="/log-a-call" className="inline-flex"><Button variant="outline">Log a Call</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">What We Offer</h2>
              <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                <li>Structured cabling (Cat6, Cat6a, Fibre)</li>
                <li>Network design & consulting</li>
                <li>Switches, firewalls, and routers</li>
                <li>Wi‑Fi planning and access point deployment</li>
                <li>Ongoing network support and upgrades</li>
              </ul>
              <p className="mt-6 text-muted-foreground">Ensure your connectivity is fast, secure, and built to scale.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={officeProject} alt="Structured cabling and network rack in a corporate office" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={schoolProject} alt="Campus Wi‑Fi deployment and fibre backbone" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png"} alt="Multi‑site student accommodation network upgrade" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png"} alt="National retail network rollout and Wi‑Fi" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Move, Build, Upgrade</h2>
            <div className="grid lg:grid-cols-2 gap-8 mt-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Office moves and new‑build fit‑outs: server relocations, patching, and network cutovers</li>
                <li>Network rebuilds: replace legacy switches, re‑cable and reconfigure with minimal downtime</li>
                <li>Contractor partner: we assist construction and MEP contractors to deliver modern networks</li>
                <li>New client onboarding: discovery, design, and rapid deployment playbooks</li>
              </ul>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>Whether you are expanding to a new building or consolidating sites, our team plans and executes changes with clear runbooks, after‑hours windows, and rollback strategies to protect business operations.</p>
                <div className="mt-6 flex gap-3">
                  <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Plan My Move</Button></Link>
                  <Link to="/support-deals" className="inline-flex"><Button variant="outline">See Support Deals</Button></Link>
                </div>
              </div>
            </div>
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
