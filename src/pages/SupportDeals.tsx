import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SupportIssuesForm from "@/components/SupportIssuesForm";
import heroImage from "@/assets/hero-bg.jpg";
import officeProject from "@/assets/office-project.jpg";
import schoolProject from "@/assets/school-project.jpg";

const SupportDeals = () => {
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    const title = "Global IT Support & International Managed Services | Siyakha";
    const description = "Global IT support and managed services. L1–L3 remote desktop, sell-by-call and monthly SLAs for EMEA, North America & Middle East.";
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
    ensureMeta("property", "og:url", `${window.location.origin}/support-deals`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/support-deals`);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Global Remote Support Deals",
    serviceType: "Sell-by-call and monthly desktop support (L1–L3)",
    provider: { "@type": "Organization", name: "Siyakha Technology Solutions" },
    areaServed: ["Global"],
  }), []);

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you provide L1–L3 remote support globally?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We deliver 24/7 L1–L3 remote desktop and application support across multiple time zones with SLAs." }
      },
      {
        "@type": "Question",
        name: "Can we choose sell‑by‑call or monthly retainers?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. Choose per‑incident pricing or fixed monthly support with agreed SLAs and escalation paths." }
      },
      {
        "@type": "Question",
        name: "Do you operate in EMEA, North America and the Middle East?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. We cover EMEA, North America and the Middle East, with localized approaches and compliance (GDPR/POPIA)." }
      }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
          <img src={heroImage} alt="Global IT support across EMEA, North America and the Middle East" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Enhance Your Global Support Capability</h1>
            <p className="text-muted-foreground mt-3 max-w-3xl">Delivering scalable, multi‑region IT support with confidence — L1, L2, L3 remote support, sell‑by‑call and monthly SLAs.</p>
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => setShowForm(true)}
                className="cta-primary text-lg px-8 py-3 h-auto"
              >
                Tell Us Your Issue
              </Button>
              <Link to="/contact#quote-form" className="inline-flex"><Button variant="outline">Request a Monthly Deal</Button></Link>
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-10 items-center max-w-6xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">Our International Coverage</h2>
              <p className="text-muted-foreground mt-2">From Southern Africa to Europe, the Middle East, and North America — we’re your trusted global support partner.</p>
              <ul className="mt-4 space-y-2 text-foreground list-disc pl-5">
                <li>EMEA (Europe, Middle East & Africa)</li>
                <li>North America (incl. California & Canada)</li>
                <li>Africa (South Africa, Angola, Swaziland, Botswana, Mozambique, Kenya, Nigeria & more)</li>
                <li>Asia & Eastern Europe (Kazakhstan, UAE, India)</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={officeProject} alt="Multi-country IT support for corporate offices" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={schoolProject} alt="Campus technology rollout and remote support" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/7c314536-73bf-4ae1-b7e3-ccceee5d640e.png"} alt="Student accommodation network upgrade across regions" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
              <img src={"/lovable-uploads/f345d1c0-6383-4a5c-9188-81c8ae221932.png"} alt="International remote IT support for hospitality" className="rounded-lg border border-border object-cover h-40 w-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-6xl grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Multi‑Zone Remote IT Support</h2>
              <ul className="list-disc pl-6 mt-3 text-muted-foreground space-y-2">
                <li>International time‑zone coverage</li>
                <li>Remote diagnostics, configuration, and issue resolution</li>
                <li>SLA‑based ticketing and escalation processes</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mt-8">Hardware Logistics & Vendor Management</h3>
              <ul className="list-disc pl-6 mt-3 text-muted-foreground space-y-2">
                <li>Printer, device, and network hardware procurement across countries</li>
                <li>Installation coordination via local deployment partners</li>
                <li>Centralized asset tracking and warranty management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary">Unified Communication & Collaboration Support</h3>
              <ul className="list-disc pl-6 mt-3 text-muted-foreground space-y-2">
                <li>VoIP and video conferencing setup across multiple countries</li>
                <li>Microsoft 365 and Google Workspace administration</li>
                <li>Remote staff onboarding and user support</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mt-8">Network & Infrastructure Scaling</h3>
              <ul className="list-disc pl-6 mt-3 text-muted-foreground space-y-2">
                <li>Structured cabling and network rollout for global campuses or branches</li>
                <li>Firewall, VPN, and SD‑WAN configuration</li>
                <li>Bandwidth optimization and monitoring tools</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why EMEA */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Why EMEA Support Matters</h2>
            <p className="text-muted-foreground mt-2">Multiple languages, varying regulations, complex logistics — all across different time zones. We offer localized solutions with a global standard:</p>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Culturally aware and language‑conscious support teams</li>
              <li>GDPR‑ and POPIA‑aligned data practices</li>
              <li>Secure cloud and hybrid models that scale as you grow</li>
            </ul>
          </div>
        </section>

        {/* Who We Help */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary">Who We Help</h2>
            <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
              <li>Global SMEs and Enterprises expanding into Africa, Europe or the Middle East</li>
              <li>Hospitality groups with multi‑country branches (e.g., Pelican Club – Bahrain)</li>
              <li>Education and NGO organizations with remote campuses</li>
              <li>Retail and logistics providers with international distribution networks</li>
            </ul>
            <div className="mt-8 flex gap-3">
              <Button 
                onClick={() => setShowForm(true)}
                className="cta-primary"
              >
                Tell Us Your Issue
              </Button>
              <Link to="/contact#quote-form" className="inline-flex"><Button variant="outline">Build a Global Support Plan</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showForm && <SupportIssuesForm onClose={() => setShowForm(false)} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
};

export default SupportDeals;