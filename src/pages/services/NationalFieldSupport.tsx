import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ensureMeta = (name: string, content: string, property = false) => {
  let el = document.querySelector(
    property ? `meta[property='${name}']` : `meta[name='${name}']`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (property) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const NationalFieldSupport = () => {
  const title = "National Field Support Technicians | Siyakha Technology";
  const description =
    "Onsite field technicians for mines, retail chains, franchises and ISPs. Router setups, laptop rollouts, POS, surveys, cabling and smart-hands nationwide.";
  const path = "/services/national-field-support";

  useEffect(() => {
    document.title = title;
    ensureMeta("description", description);
    const url = `${window.location.origin}${path}`;
    ensureMeta("og:title", title, true);
    ensureMeta("og:description", description, true);
    ensureMeta("og:type", "website", true);
    ensureMeta("og:url", url, true);

    let linkEl = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "canonical");
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute("href", url);
  }, []);

  const breadcrumbJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${window.location.origin}/services` },
      { "@type": "ListItem", position: 3, name: "National Field Support" },
    ],
  }), []);

  const serviceJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "National Field Support Technicians",
    provider: { "@type": "Organization", name: "Siyakha Technology" },
    areaServed: { "@type": "Country", name: "South Africa" },
    serviceType: "Onsite Field Support, Smart Hands, National Dispatch",
    url: `${window.location.origin}${path}`,
    description,
  }), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/services">Services</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>National Field Support</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        <header className="py-14 md:py-20 bg-gradient-to-b from-background to-muted/40">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-4">
              National Field Support Technicians
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              Smart hands, nationwide. We dispatch certified field technicians to your sites for
              router setups, laptop rollouts, break/fix, POS deployments, cabling and more —
              ideal for mines, retail chains, franchises and ISPs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/contact#quote-form">
                <Button className="cta-primary">Request a Consultation</Button>
              </Link>
              <Link to="/log-a-call">
                <Button variant="outline">Log a Call</Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">Who we serve</h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                  <li>• Mines and industrial operations</li>
                  <li>• Retail chains and franchise groups</li>
                  <li>• ISPs and telecoms needing smart-hands</li>
                  <li>• Corporate campuses and distributed offices</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">What we do</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Field dispatch and onsite troubleshooting</li>
                    <li>• Router/CPE setup and WAN failover testing</li>
                    <li>• AP installs, site surveys, cabling & trunking</li>
                    <li>• POS and network equipment swaps</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Laptop rollouts, imaging and asset tagging</li>
                    <li>• Break/fix with parts logistics</li>
                    <li>• After-hours and weekend work</li>
                    <li>• Standardized reports and sign-off</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">Coverage & SLAs</h2>
                <p className="text-muted-foreground">
                  We coordinate nationally with central scheduling and single-point-of-contact. Same-day
                  dispatch in major metros, and predictable SLAs for regional sites. Flexible models: per
                  call-out, project-based, or retainer for national accounts.
                </p>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">How it works</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  <li>Raise a ticket or request with scope and site details</li>
                  <li>We schedule and dispatch the closest certified technician</li>
                  <li>Work completed onsite with photo evidence where needed</li>
                  <li>Standard report and customer sign-off submitted same day</li>
                </ol>
              </div>

              <div className="pt-2">
                <Link to="/contact#quote-form">
                  <Button className="cta-primary">Book Field Support</Button>
                </Link>
              </div>
            </article>

            <aside className="space-y-6">
              <div className="p-6 rounded-lg bg-muted">
                <h3 className="text-lg font-semibold text-primary mb-2">Typical requests</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Store router swap and configuration</li>
                  <li>• New branch network turn-up</li>
                  <li>• Laptop refresh rollout</li>
                  <li>• POS lane expansion</li>
                  <li>• Wi‑Fi dead spot fix</li>
                </ul>
              </div>
              <div className="p-6 rounded-lg bg-muted">
                <h3 className="text-lg font-semibold text-primary mb-2">Related services</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link to="/services/infrastructure-and-networking" className="hover:text-accent">Infrastructure & Networking</Link></li>
                  <li><Link to="/services/cloud-and-edge-solutions" className="hover:text-accent">Cloud & Edge Solutions</Link></li>
                  <li><Link to="/services/smart-collaboration-tools" className="hover:text-accent">Smart Collaboration Tools</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <Footer />
    </div>
  );
};

export default NationalFieldSupport;
