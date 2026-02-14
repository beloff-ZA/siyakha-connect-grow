import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/managed-it-services-johannesburg";
const TITLE = "Managed IT Services Johannesburg | Siyakha Technology";
const DESCRIPTION = "Proactive managed IT services in Johannesburg: monitoring, maintenance, helpdesk and SLAs to reduce downtime and costs.";

const ManagedITSJohannesburg = () => {
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
      { "@type": "ListItem", position: 2, name: "Managed IT Services Johannesburg", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Managed IT Services",
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
                <span className="text-muted-foreground">Managed IT Services Johannesburg</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Managed IT Services in Johannesburg</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Reduce downtime and keep your infrastructure secure with proactive monitoring, patching, and 24/7 support. Our managed
              IT services scale with your business and improve user experience across your entire environment.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Proposal</Button></Link>
              <a href="tel:+27815012993" className="inline-flex"><Button variant="outline">Call 081 501 2993</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">What's Included</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
                <li>24/7 monitoring and alerting</li>
                <li>Patch management and updates</li>
                <li>Backup oversight and DR testing</li>
                <li>Endpoint security and M365 hardening</li>
                <li>User support with SLA response times</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Benefits</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
                <li>Predictable monthly costs</li>
                <li>Reduced downtime and risk</li>
                <li>Improved security posture</li>
                <li>Dedicated local team in Johannesburg</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Industries We Support</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
                <li>Education and campuses</li>
                <li>Retail and QSR</li>
                <li>Professional services and finance</li>
                <li>Hospitality and clubs</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-xl font-semibold">Related Johannesburg Services</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/it-support-johannesburg"><Button variant="secondary">IT Support</Button></Link>
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

export default ManagedITSJohannesburg;
