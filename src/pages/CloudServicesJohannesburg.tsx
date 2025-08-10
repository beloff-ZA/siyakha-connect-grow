import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/cloud-services-johannesburg";
const TITLE = "Cloud Services Johannesburg | Siyakha Technology";
const DESCRIPTION = "Microsoft 365, Azure and hybrid cloud for Johannesburg businesses. Secure migrations, backups and modern collaboration.";

const CloudServicesJohannesburg = () => {
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
      { "@type": "ListItem", position: 2, name: "Cloud Services Johannesburg", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cloud Services",
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
                <span className="text-muted-foreground">Cloud Services Johannesburg</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Cloud Services in Johannesburg</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Move to the cloud with confidence. From Microsoft 365 to Azure and hybrid architectures, we modernise collaboration,
              security and access while controlling costs.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Plan a Migration</Button></Link>
              <a href="mailto:accounts@siyakhatechnology.co.za" className="inline-flex"><Button variant="outline">Email Us</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Key Services</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Microsoft 365 setup and optimisation</li>
                <li>Azure migrations and hybrid designs</li>
                <li>Backup, DR and retention policies</li>
                <li>Identity and access management</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Outcomes</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Improved collaboration and mobility</li>
                <li>Lower infrastructure overheads</li>
                <li>Secure remote access</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Who It's For</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Growing SMEs modernising IT</li>
                <li>Multi-site organisations</li>
                <li>Teams adopting hybrid work</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-xl font-semibold">Related Johannesburg Services</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/managed-it-services-johannesburg"><Button variant="secondary">Managed IT</Button></Link>
              <Link to="/it-support-johannesburg"><Button variant="secondary">IT Support</Button></Link>
              <Link to="/cybersecurity-services-johannesburg"><Button variant="secondary">Cybersecurity</Button></Link>
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

export default CloudServicesJohannesburg;
