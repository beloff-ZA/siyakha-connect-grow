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

const CutoversSimReplacements = () => {
  const title = "Cutovers & SIM Card Replacements | Siyakha";
  const description =
    "Nationwide ISP and retail cutovers, WAN migrations, and SIM swaps. After-hours support, standardized reports, certified technicians.";
  const path = "/services/national-field-support/cutovers-and-sim-replacements";

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
      { "@type": "ListItem", position: 3, name: "National Field Support", item: `${window.location.origin}/services/national-field-support` },
      { "@type": "ListItem", position: 4, name: "Cutovers & SIM Card Replacements" },
    ],
  }), []);

  const serviceJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cutovers & SIM Card Replacements",
    provider: { "@type": "Organization", name: "Siyakha Technology" },
    areaServed: { "@type": "Country", name: "South Africa" },
    serviceType: "ISP Cutovers, WAN Migrations, SIM Swaps, LTE Failover",
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
                  <BreadcrumbLink asChild>
                    <Link to="/services/national-field-support">National Field Support</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Cutovers & SIM Card Replacements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        <header className="py-14 md:py-20 bg-gradient-to-b from-background to-muted/40">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-4">
              Cutovers & SIM Card Replacements
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              After-hours and in-window cutovers for ISPs, retail chains and franchises. We manage
              WAN migrations, SIM swaps, router turn-ups and validation with standardized reporting.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/contact#quote-form">
                <Button className="cta-primary">Book a Cutover Window</Button>
              </Link>
              <Link to="/log-a-call">
                <Button variant="outline">Log a Change</Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">Services included</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Store/branch cutovers and WAN migrations</li>
                    <li>• Router swaps, config and failover testing</li>
                    <li>• SIM swap/activation for LTE primary/failover</li>
                    <li>• AP installs and validation surveys</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• POS and network equipment changes</li>
                    <li>• Night/weekend implementation windows</li>
                    <li>• Change control and rollback plans</li>
                    <li>• Evidence packs and sign-off reports</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">Approach & governance</h2>
                <p className="text-muted-foreground">
                  We work from clear playbooks per client, with prechecks, comms plans, and
                  rollback criteria. A central coordinator manages slots and escalations while
                  field techs execute onsite.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/contact#quote-form">
                  <Button className="cta-primary">Request a Proposal</Button>
                </Link>
                <Link to="/services/national-field-support" className="inline-block ml-4">
                  <Button variant="outline">Back to Field Support</Button>
                </Link>
              </div>
            </article>

            <aside className="space-y-6">
              <div className="p-6 rounded-lg bg-muted">
                <h3 className="text-lg font-semibold text-primary mb-2">Typical tasks</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Cutover night support</li>
                  <li>• SIM card swap & activation</li>
                  <li>• Router config and testing</li>
                  <li>• Link validation and reporting</li>
                </ul>
              </div>
              <div className="p-6 rounded-lg bg-muted">
                <h3 className="text-lg font-semibold text-primary mb-2">Who benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• ISPs and telecom operators</li>
                  <li>• Grocery and retail chains</li>
                  <li>• Franchise groups</li>
                  <li>• Multi-site enterprises</li>
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

export default CutoversSimReplacements;
