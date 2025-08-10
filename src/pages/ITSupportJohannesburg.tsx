import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-support-johannesburg";
const TITLE = "IT Support Johannesburg | Siyakha Technology";
const DESCRIPTION = "Fast, friendly IT support and helpdesk in Johannesburg. Remote & onsite support with SLAs to keep your team productive.";

const ITSupportJohannesburg = () => {
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
      { "@type": "ListItem", position: 2, name: "IT Support Johannesburg", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Support & Helpdesk",
    areaServed: "Johannesburg",
    provider: { "@type": "LocalBusiness", name: "Siyakha Technology" },
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
                <span className="text-muted-foreground">IT Support Johannesburg</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">IT Support & Helpdesk in Johannesburg</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Get fast, friendly support from a local team. We resolve issues remotely or on-site, with clear SLAs and response times so
              your staff can stay focused on what matters.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Start a Support Plan</Button></Link>
              <a href="tel:+27877027411" className="inline-flex"><Button variant="outline">Call 087 702 7411</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-2 gap-8">
            <article>
              <h2 className="text-xl font-semibold">Remote vs On‑site</h2>
              <p className="text-muted-foreground mt-2">Most issues are resolved within minutes via our helpdesk. When needed, we dispatch engineers across Johannesburg for on-site resolution.</p>
              <h3 className="mt-6 font-semibold">SLAs & Coverage</h3>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Business-hours or 24/7 coverage</li>
                <li>Critical incident escalation</li>
                <li>Monthly reporting and reviews</li>
              </ul>
            </article>
            <article>
              <h2 className="text-xl font-semibold">Common Support Requests</h2>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Microsoft 365 and email issues</li>
                <li>Network and Wi‑Fi connectivity</li>
                <li>Endpoint performance and security</li>
                <li>Printer and peripheral setup</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-xl font-semibold">Related Johannesburg Services</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/managed-it-services-johannesburg"><Button variant="secondary">Managed IT</Button></Link>
              <Link to="/cybersecurity-services-johannesburg"><Button variant="secondary">Cybersecurity</Button></Link>
              <Link to="/cloud-services-johannesburg"><Button variant="secondary">Cloud Services</Button></Link>
              <Link to="/it-company-johannesburg"><Button variant="ghost">IT Company</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
    </div>
  );
};

export default ITSupportJohannesburg;
