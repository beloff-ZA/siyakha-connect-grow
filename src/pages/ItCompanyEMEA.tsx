import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-company-emea";
const TITLE = "IT Company EMEA | Siyakha Technology";
const DESCRIPTION = "Siyakha Technology delivers expert IT support, managed services, cloud and cybersecurity to businesses across EMEA. Free consultation.";

const ItCompanyEMEA = () => {
  useEffect(() => {
    document.title = TITLE;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${PAGE_URL}`);
  }, []);

  const breadcrumbJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
      { "@type": "ListItem", position: 2, name: "IT Company EMEA", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Company EMEA",
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
      telephone: "+27 81 501 2993",
      areaServed: ["Europe", "Middle East", "Africa"],
    },
    areaServed: "EMEA",
    url: `${window.location.origin}${PAGE_URL}`,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-muted-foreground">IT Company EMEA</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Trusted IT Company for EMEA</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Siyakha Technology helps organisations across Europe, the Middle East, and Africa simplify, secure, and scale their IT.
              Our flexible, multilingual support and globally aligned best practices keep your teams productive wherever they are.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Get a Free Consultation</Button></Link>
              <a href="tel:+27815012993" className="inline-flex"><Button variant="outline">Call 081 501 2993</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-10 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Why EMEA Businesses Choose Siyakha Technology</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li><strong>Regional reach, local care:</strong> Coverage across EMEA with responsive support windows and SLAs.</li>
                <li><strong>End-to-end services:</strong> Cloud, networking, security, and managed IT under one partner.</li>
                <li><strong>Compliance-ready:</strong> Best practices aligned to data residency and security standards.</li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold">Our Regional Focus</h3>
              <p className="text-muted-foreground mt-2">
                We support distributed teams across the UK, EU, GCC, and Africa—coordinating onsite partners and proactive remote support.
              </p>
              <div className="mt-4 flex gap-3">
                <Link to="/support-deals" className="inline-flex"><Button variant="secondary">View Support Deals</Button></Link>
                <Link to="/log-a-call" className="inline-flex"><Button variant="ghost">Log a Call</Button></Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-semibold text-foreground">Popular IT Services across EMEA</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Managed IT Services</h3>
                <p className="text-muted-foreground mt-2">Proactive monitoring, maintenance, and multilingual support.</p>
                <Link to="/services" className="inline-flex mt-3"><Button variant="outline">Explore services</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cloud Services</h3>
                <p className="text-muted-foreground mt-2">Microsoft 365, Azure, and hybrid cloud architectures.</p>
                <Link to="/services/cloud-and-edge-solutions" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Security & Compliance</h3>
                <p className="text-muted-foreground mt-2">Protect users and data with global standards, tailored to region.</p>
                <Link to="/services/security-and-surveillance" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Network Design & Installation</h3>
                <p className="text-muted-foreground mt-2">Resilient WAN, LAN, and secure remote access for distributed teams.</p>
                <Link to="/services/infrastructure-and-networking" className="inline-flex mt-3"><Button variant="outline">See networking</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-8 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Partner with a Proven EMEA IT Company</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>Predictable costs and clear SLAs</li>
                <li>Faster issue resolution with proactive monitoring</li>
                <li>Scale-up support for growth and global rollouts</li>
              </ul>
            </article>
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Get a Free IT Consultation</h2>
              <p className="text-muted-foreground mt-2">Speak with our experts about regional coverage, compliance, and scalable support models.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
                <a href="mailto:accounts@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
    </div>
  );
};

export default ItCompanyEMEA;
