import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-company-london";
const TITLE = "IT Company London | Affordable Packages | Siyakha";
const DESCRIPTION = "Affordable IT packages in London: managed IT, cloud, cybersecurity, and support. Siyakha Technology delivers reliable, cost-effective IT for London businesses.";

const ItCompanyLondon = () => {
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
      { "@type": "ListItem", position: 2, name: "IT Company London", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Company London",
    provider: {
      "@type": "LocalBusiness",
      name: "Siyakha Technology",
      address: {
        "@type": "PostalAddress",
        streetAddress: "",
        addressLocality: "London",
        postalCode: "",
        addressCountry: "UK",
      },
      telephone: "+44 20 0000 0000",
      areaServed: ["Central London", "City of London", "Canary Wharf", "Greater London"],
    },
    offers: {
      "@type": "Offer",
      name: "Affordable IT Packages",
      description: "Cost-effective managed IT and support plans tailored for London SMEs.",
      priceCurrency: "GBP",
      price: "Contact for pricing",
      url: `${window.location.origin}${PAGE_URL}`,
    },
    areaServed: "London",
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
                <span className="text-muted-foreground">IT Company London</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">IT Company in London with Affordable Packages</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Get reliable, affordable IT packages tailored for London businesses—covering managed IT, support, cloud, security, and networking.
              Scale confidently with predictable monthly pricing and responsive local support.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Book My Consultation</Button></Link>
              <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="outline">Email Us</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-10 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Why London Businesses Choose Siyakha</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li><strong>Affordable packages:</strong> Predictable pricing tiers for SMEs and scale-ups.</li>
                <li><strong>End-to-end IT:</strong> Managed IT, cloud, security, and networking with one partner.</li>
                <li><strong>Local response:</strong> UK business hours with rapid remote resolution and onsite coordination.</li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold">Packages at a Glance</h3>
              <ul className="text-muted-foreground mt-2 list-disc pl-5">
                <li>Starter: Essential support and patching</li>
                <li>Growth: Endpoint security + M365 management</li>
                <li>Advanced: SIEM, backup, and compliance reporting</li>
              </ul>
              <div className="mt-4 flex gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button variant="secondary">Get package options</Button></Link>
                <Link to="/support-deals" className="inline-flex"><Button variant="ghost">Support Deals</Button></Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-semibold text-foreground">Core IT Services in London</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Managed IT Services</h3>
                <p className="text-muted-foreground mt-2">Proactive monitoring, maintenance, and helpdesk support.</p>
                <Link to="/services" className="inline-flex mt-3"><Button variant="outline">Explore services</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cloud Services</h3>
                <p className="text-muted-foreground mt-2">Microsoft 365, Azure, backup, and hybrid cloud.</p>
                <Link to="/services/cloud-and-edge-solutions" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cybersecurity</h3>
                <p className="text-muted-foreground mt-2">Endpoint protection, phishing defence, and security monitoring.</p>
                <Link to="/services/security-and-surveillance" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Network & Connectivity</h3>
                <p className="text-muted-foreground mt-2">LAN, Wi‑Fi, SD‑WAN, and secure remote access.</p>
                <Link to="/services/infrastructure-and-networking" className="inline-flex mt-3"><Button variant="outline">See networking</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-8 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Book a Free Consultation</h2>
              <p className="text-muted-foreground mt-2">Tell us your user count and priorities—we’ll recommend the most affordable package for your needs.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Book My Consultation</Button></Link>
                <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
              </div>
            </article>
            <article>
              <h2 className="text-2xl font-semibold text-foreground">What You Get</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>Predictable monthly pricing</li>
                <li>Fast response during UK business hours</li>
                <li>Security-first approach and compliance-ready reporting</li>
              </ul>
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

export default ItCompanyLondon;
