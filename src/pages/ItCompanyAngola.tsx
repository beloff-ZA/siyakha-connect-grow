import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PAGE_URL = "/it-company-angola";
const TITLE = "IT Company Angola | Remote IT & Web Design | Siyakha";
const DESCRIPTION = "Remote IT support, website design, cloud and cybersecurity for companies in Angola. Fast, reliable, and cost‑effective services from Siyakha.";

const ItCompanyAngola = () => {
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
      { "@type": "ListItem", position: 2, name: "IT Company Angola", item: `${window.location.origin}${PAGE_URL}` },
    ],
  }), []);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Company Angola",
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
      telephone: "+27 81 501 2993",
      areaServed: ["Luanda", "Lobito", "Huambo", "Cabinda", "Benguela", "Angola"],
    },
    areaServed: "Angola",
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
                <span className="text-muted-foreground">IT Company Angola</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Reliable Remote IT Services for Angola</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl">
              Siyakha Technology supports companies across Angola with high‑quality remote IT services. From website design and cloud
              solutions to cybersecurity and helpdesk support, we keep your teams productive—wherever you operate.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
              <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="outline">Email Us</Button></a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-10 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">What We Deliver Remotely</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li><strong>Website Design & Development:</strong> Modern, fast websites with SEO best practices and analytics.</li>
                <li><strong>Remote IT Support & Helpdesk:</strong> Quick resolution via secure remote access and guided Smart Hands.</li>
                <li><strong>Microsoft 365 & Cloud Services:</strong> Tenant setup, migration, backup, and governance.</li>
                <li><strong>Cybersecurity:</strong> Endpoint protection, patching, MFA, email security, and awareness training.</li>
                <li><strong>Network Advisory:</strong> Wi‑Fi planning, SD‑WAN recommendations, and remote configuration.</li>
                <li><strong>Rollouts Coordination:</strong> We coordinate vetted local partners for onsite installs when required.</li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold">Service Coverage in Angola</h3>
              <p className="text-muted-foreground mt-2">
                We primarily support remotely across Luanda, Benguela, Lobito, Cabinda, Huambo and beyond, coordinating on‑site
                technicians through trusted partners when physical presence is needed.
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
            <h2 className="text-2xl font-semibold text-foreground">Core Services for Angola</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Website Design</h3>
                <p className="text-muted-foreground mt-2">Responsive websites, landing pages, and SEO to help you grow online.</p>
                <Link to="/services" className="inline-flex mt-3"><Button variant="outline">Explore services</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Remote IT Support</h3>
                <p className="text-muted-foreground mt-2">Helpdesk, endpoint management, and remote troubleshooting.</p>
                <Link to="/support-deals" className="inline-flex mt-3"><Button variant="outline">See support</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cloud & Microsoft 365</h3>
                <p className="text-muted-foreground mt-2">Email, collaboration, backup, and governance done right.</p>
                <Link to="/services/cloud-and-edge-solutions" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Cybersecurity</h3>
                <p className="text-muted-foreground mt-2">Protect users and data with best‑practice security controls.</p>
                <Link to="/services/security-and-surveillance" className="inline-flex mt-3"><Button variant="outline">Learn more</Button></Link>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold">Networking & Wi‑Fi</h3>
                <p className="text-muted-foreground mt-2">Design, configuration, and remote optimisation guidance.</p>
                <Link to="/services/infrastructure-and-networking" className="inline-flex mt-3"><Button variant="outline">See networking</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-8 md:grid-cols-2">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Work With a Trusted Remote IT Partner</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li>Predictable monthly costs with clear SLAs</li>
                <li>Fast remote response and coordinated onsite when required</li>
                <li>Security‑first approach and documented change control</li>
              </ul>
            </article>
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Get a Free IT Consultation</h2>
              <p className="text-muted-foreground mt-2">Tell us your priorities and timelines—we’ll recommend the best remote support model for your teams in Angola.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Consultation</Button></Link>
                <a href="mailto:info@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
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

export default ItCompanyAngola;
