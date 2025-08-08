import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/cybersecurity-services-johannesburg";
const TITLE = "Cybersecurity Services Johannesburg | Siyakha Technology";
const DESCRIPTION = "Protect against ransomware, phishing and data loss. Cybersecurity services for Johannesburg businesses with audits, EDR and email security.";

const CybersecurityJohannesburg = () => {
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
      { "@type": "ListItem", position: 2, name: "Cybersecurity Services Johannesburg", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cybersecurity Services",
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
                <span className="text-muted-foreground">Cybersecurity Services Johannesburg</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Cybersecurity Services in Johannesburg</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Safeguard your organisation with layered security: endpoint protection, email filtering, identity and access controls,
              patching and awareness training—all tailored for Johannesburg businesses.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Book a Security Assessment</Button></Link>
              <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="outline">Email Us</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Key Capabilities</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Next-gen AV/EDR and threat detection</li>
                <li>Email security and phishing defence</li>
                <li>Vulnerability management and patching</li>
                <li>Backup, recovery and ransomware resilience</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Assessments & Compliance</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Security posture reviews</li>
                <li>Policy and access control audits</li>
                <li>User awareness training</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold">Response & Support</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-2">
                <li>Incident response planning</li>
                <li>24/7 monitoring options</li>
                <li>Local team across Johannesburg</li>
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

export default CybersecurityJohannesburg;
