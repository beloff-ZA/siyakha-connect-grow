import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-company-cape-town";
const TITLE = "IT Company Cape Town | Siyakha Technology";
const DESCRIPTION = "Siyakha Technology delivers expert IT support, managed services, cloud and cybersecurity for Cape Town businesses. Free consultation.";

const ItCompanyCapeTown = () => {
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
      { "@type": "ListItem", position: 2, name: "IT Company Cape Town", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Company Cape Town",
    provider: {
      "@type": "LocalBusiness",
      name: "Siyakha Technology",
      address: {
        "@type": "PostalAddress",
        streetAddress: "",
        addressLocality: "Cape Town",
        postalCode: "",
        addressCountry: "ZA",
      },
      telephone: "+27 81 501 2993",
      areaServed: ["Cape Town", "CBD", "Century City", "Claremont", "Bellville"],
    },
    areaServed: "Cape Town",
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
                <span className="text-muted-foreground">IT Company Cape Town</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Trusted IT Company in Cape Town</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              We help Cape Town businesses simplify, secure, and scale their IT. From cloud migrations to onsite support, we deliver
              reliable technology that powers growth across the Mother City.
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
              <h2 className="text-2xl font-semibold text-foreground">Why Cape Town Businesses Choose Siyakha Technology</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li><strong>Local expertise:</strong> Responsive onsite support across CBD, Century City, Claremont and beyond.</li>
                <li><strong>One partner for all IT:</strong> Networking, cloud, security, and managed IT under one roof.</li>
                <li><strong>Future-ready:</strong> Solutions designed to scale with your growth.</li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold">Our Local Focus</h3>
              <p className="text-muted-foreground mt-2">
                We support businesses throughout Cape Town, including the City Centre, Century City, Southern Suburbs, and Northern Suburbs.
              </p>
              <div className="mt-4 flex gap-3">
                <Link to="/log-a-call" className="inline-flex"><Button variant="secondary">Log a Call</Button></Link>
                <Link to="/support-deals" className="inline-flex"><Button variant="ghost">Support Deals</Button></Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-semibold text-foreground">Our IT Services in Cape Town</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Managed IT Services</h3>
                <p className="text-muted-foreground mt-2">Proactive monitoring, maintenance, and 24/7 support to reduce downtime.</p>
                <Link to="/services" className="inline-flex mt-3"><Button variant="outline">Explore services</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">IT Support & Helpdesk</h3>
                <p className="text-muted-foreground mt-2">Fast remote or on-site support to solve issues quickly.</p>
                <Link to="/contact" className="inline-flex mt-3"><Button variant="outline">Contact us</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cybersecurity Solutions</h3>
                <p className="text-muted-foreground mt-2">Protect your business from ransomware, phishing, and data breaches.</p>
                <Link to="/services/security-and-surveillance" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cloud Services</h3>
                <p className="text-muted-foreground mt-2">Migrate to Microsoft 365, Azure, or hybrid setups with confidence.</p>
                <Link to="/services/cloud-and-edge-solutions" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Network Design & Installation</h3>
                <p className="text-muted-foreground mt-2">Reliable LAN, Wi‑Fi, VPN, and secure remote access from the ground up.</p>
                <Link to="/services/infrastructure-and-networking" className="inline-flex mt-3"><Button variant="outline">See networking</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-8 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Get a Free IT Consultation</h2>
              <p className="text-muted-foreground mt-2">Ready to upgrade your IT without the stress? Contact Siyakha Technology today for a no-obligation IT assessment.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
                <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
              </div>
            </article>
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Why Partner with Us</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>Reduced downtime and operational risks</li>
                <li>Predictable monthly costs with no surprise IT bills</li>
                <li>Access to a dedicated team of IT experts</li>
                <li>Technology that grows with your business</li>
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

export default ItCompanyCapeTown;
