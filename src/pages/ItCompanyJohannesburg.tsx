import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-company-johannesburg";
const TITLE = "IT Company Johannesburg | Siyakha Technology";
const DESCRIPTION = "Siyakha Technology delivers expert IT support, managed services, cloud and cybersecurity for Johannesburg businesses. Free consultation.";

const ItCompanyJohannesburg = () => {
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
      { "@type": "ListItem", position: 2, name: "IT Company Johannesburg", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Company Johannesburg",
    provider: {
      "@type": "LocalBusiness",
      name: "Siyakha Technology",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Maude Street West Tower, Nelson Mandela Square",
        addressLocality: "Sandton",
        postalCode: "2146",
        addressCountry: "ZA",
      },
      telephone: "+27 87 702 7411",
      areaServed: ["Johannesburg", "Sandton", "Rosebank", "Midrand"],
    },
    areaServed: "Johannesburg",
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
                <span className="text-muted-foreground">IT Company Johannesburg</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Trusted IT Company in Johannesburg</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              At Siyakha Technology, we help Johannesburg businesses simplify, secure, and scale their IT systems. Whether you’re a
              growing start-up or a large enterprise, our flexible and customisable IT solutions give you the technology advantage you
              need to stay competitive.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Get a Free Consultation</Button></Link>
              <a href="tel:+27877027411" className="inline-flex"><Button variant="outline">Call 087 702 7411</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-10 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Why Johannesburg Businesses Choose Siyakha Technology</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>
                  <strong>Local Support, Global Standards:</strong> Our headquarters in Johannesburg means you get fast, on-site service,
                  backed by international best practices.
                </li>
                <li>
                  <strong>End-to-End IT Services:</strong> From network installations to cloud migrations, we manage your IT infrastructure
                  so you can focus on your core business.
                </li>
                <li>
                  <strong>Certified Expertise:</strong> Our team holds certifications with leading vendors, ensuring your systems are secure,
                  reliable, and future-ready.
                </li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold">Our Local Focus</h3>
              <p className="text-muted-foreground mt-2">
                We proudly serve businesses across Johannesburg CBD, Sandton, Rosebank, Midrand, and surrounding areas. Our on-the-ground
                team ensures quick response times and personalised service.
              </p>
              <div className="mt-4 flex gap-3">
                <Link to="/log-a-call" className="inline-flex"><Button variant="secondary">Log a Call</Button></Link>
                <Link to="/support-deals" className="inline-flex"><Button variant="ghost">Global Support Deals</Button></Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-semibold text-foreground">Our IT Services in Johannesburg</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Managed IT Services</h3>
                <p className="text-muted-foreground mt-2">Proactive monitoring, maintenance, and 24/7 support to reduce downtime.</p>
                <Link to="/managed-it-services-johannesburg" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">IT Support & Helpdesk</h3>
                <p className="text-muted-foreground mt-2">Fast remote or on-site support to solve issues before they impact productivity.</p>
                <Link to="/it-support-johannesburg" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cybersecurity Solutions</h3>
                <p className="text-muted-foreground mt-2">Protect your business from ransomware, phishing, and data breaches.</p>
                <Link to="/cybersecurity-services-johannesburg" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cloud Services</h3>
                <p className="text-muted-foreground mt-2">Migrate to Microsoft 365, Azure, or hybrid setups with confidence.</p>
                <Link to="/cloud-services-johannesburg" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
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
              <h2 className="text-2xl font-semibold text-foreground">Benefits of Partnering with Siyakha Technology</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>Reduced downtime and operational risks</li>
                <li>Predictable monthly costs with no surprise IT bills</li>
                <li>Access to a dedicated team of IT experts</li>
                <li>Technology that grows with your business</li>
              </ul>
            </article>
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Get a Free IT Consultation</h2>
              <p className="text-muted-foreground mt-2">Ready to upgrade your IT without the stress? Contact Siyakha Technology today for a no-obligation IT assessment and discover how we can optimise your business technology.</p>
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

export default ItCompanyJohannesburg;
