import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Wifi, Server, Monitor, Users, Phone } from "lucide-react";

const PAGE_URL = "/it-company-sandton";
const TITLE = "IT Company in Sandton | IT Support Services | Siyakha Technology";
const DESCRIPTION = "Looking for an IT company in Sandton? Siyakha Technology provides managed IT support, networking, cybersecurity, CCTV and cloud services across Sandton, Bryanston, Rivonia, Sunninghill & Midrand.";

const ItCompanySandton = () => {
  useEffect(() => {
    document.title = TITLE;
    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(key, value); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    ensureMeta("name", "description", DESCRIPTION);
    ensureMeta("property", "og:title", TITLE);
    ensureMeta("property", "og:description", DESCRIPTION);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}${PAGE_URL}`);
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}${PAGE_URL}`);
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const breadcrumbJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "IT Company Sandton", item: `${origin}${PAGE_URL}` },
    ],
  }), [origin]);

  const serviceJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "IT Support Services Sandton",
    provider: {
      "@type": "LocalBusiness",
      name: "Siyakha Technology",
      telephone: "+27 81 501 2993",
      address: { "@type": "PostalAddress", addressLocality: "Sandton", addressRegion: "Gauteng", addressCountry: "ZA" },
      areaServed: ["Sandton", "Bryanston", "Rivonia", "Sunninghill", "Midrand", "Fourways", "Morningside", "Woodmead"],
    },
    areaServed: "Sandton",
    url: `${origin}${PAGE_URL}`,
  }), [origin]);

  const faqJson = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What IT services does Siyakha offer in Sandton?",
        acceptedAnswer: { "@type": "Answer", text: "We provide managed IT support, network infrastructure & Wi-Fi, CCTV & access control, cybersecurity, cloud & Microsoft 365, VoIP, and national field support for businesses across Sandton and surrounding suburbs." }
      },
      {
        "@type": "Question",
        name: "Do you provide on-site IT support in Bryanston, Rivonia and Sunninghill?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our engineers are based in Johannesburg and provide same-day on-site IT support across Sandton, Bryanston, Rivonia, Sunninghill, Midrand, Fourways, Morningside, and Woodmead." }
      },
      {
        "@type": "Question",
        name: "How quickly can you respond to IT emergencies in Sandton?",
        acceptedAnswer: { "@type": "Answer", text: "We offer priority response times for Sandton-based clients, with remote support available within minutes and on-site engineers typically arriving within 2-4 hours depending on location." }
      },
      {
        "@type": "Question",
        name: "Is Siyakha Technology a BEE-compliant IT company?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, Siyakha Technology is a BEE Level 1 certified ICT company, making us an ideal technology partner for organisations with procurement and compliance requirements." }
      },
    ]
  }), []);

  const services = [
    { icon: Monitor, title: "Managed IT Support", desc: "Proactive monitoring, helpdesk, and on-site support to keep your Sandton office running without interruption.", link: "/managed-it-services-johannesburg" },
    { icon: Wifi, title: "Network & Wi-Fi Solutions", desc: "Enterprise-grade Wi-Fi, structured cabling, and network design for offices, retail, and multi-site businesses.", link: "/services/infrastructure-and-networking" },
    { icon: Shield, title: "Cybersecurity", desc: "Protect your business from ransomware, phishing, and data breaches with our layered security approach.", link: "/cybersecurity-services-johannesburg" },
    { icon: Server, title: "Cloud & Microsoft 365", desc: "Migrate to the cloud, manage Microsoft 365 licensing, backups, and hybrid infrastructure with confidence.", link: "/cloud-services-johannesburg" },
    { icon: Users, title: "CCTV & Access Control", desc: "HD surveillance, biometric access, and remote monitoring solutions for offices, estates, and retail.", link: "/services/security-and-surveillance" },
    { icon: Phone, title: "VoIP & Connectivity", desc: "Business-grade internet, failover solutions, and cloud PBX phone systems for Sandton businesses.", link: "/services/smart-collaboration-tools" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><span className="text-muted-foreground">IT Company Sandton</span></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">IT Company in Sandton — Managed IT Support & Services</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Siyakha Technology is a <strong>BEE Level 1</strong> IT company providing reliable, end-to-end IT support across
              Sandton, Bryanston, Rivonia, Sunninghill, Midrand, Fourways, and surrounding areas. We don't just supply
              hardware — we design, install, configure, and support your entire IT environment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Get a Free IT Assessment</Button></Link>
              <a href="tel:+27815012993" className="inline-flex"><Button variant="outline">Call 081 501 2993</Button></a>
            </div>
          </div>
        </section>

        {/* Why Sandton businesses choose us */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6 grid gap-10 md:grid-cols-2 max-w-5xl">
            <article>
              <h2 className="text-2xl font-semibold text-foreground">Why Sandton Businesses Choose Siyakha</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground list-disc pl-5">
                <li><strong>Local Sandton Presence:</strong> Our team services Sandton, Bryanston, Rivonia, Sunninghill, Midrand, Morningside, and Woodmead — ensuring fast on-site response times.</li>
                <li><strong>Complete IT Solutions:</strong> Unlike conventional IT stores, we supply, install, configure, and provide ongoing managed support for your technology.</li>
                <li><strong>BEE Level 1 Certified:</strong> Ideal for corporates, government, and enterprises with procurement compliance requirements.</li>
                <li><strong>Vendor Partnerships:</strong> Authorised partner of Dell, Grandstream, TP-Link, Hikvision, and Cisco — giving you access to enterprise-grade solutions at competitive prices.</li>
              </ul>
            </article>
            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-semibold text-foreground">Suburbs We Service</h3>
              <p className="text-muted-foreground mt-2">We provide IT support across greater Sandton and northern Johannesburg:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Sandton CBD", "Bryanston", "Rivonia", "Sunninghill", "Midrand", "Fourways", "Morningside", "Woodmead", "Randburg", "Rosebank", "Parktown North"].map(s => (
                  <span key={s} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/log-it" className="inline-flex"><Button variant="secondary">Log a Call</Button></Link>
                <Link to="/about" className="inline-flex"><Button variant="ghost">About Us</Button></Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="text-2xl font-semibold text-foreground">IT Services for Sandton Businesses</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map(s => (
                <div key={s.title} className="p-6 rounded-lg border border-border bg-card">
                  <s.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{s.desc}</p>
                  <Link to={s.link} className="inline-flex mt-3"><Button variant="outline" size="sm">Learn more</Button></Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
            <div className="mt-6 space-y-6">
              {faqJson.mainEntity.map((q, i) => (
                <details key={i} className="group border border-border rounded-lg p-4">
                  <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                    {q.name}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground text-sm">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">Ready to Upgrade Your IT in Sandton?</h2>
            <p className="text-muted-foreground mt-2">Contact Siyakha Technology today for a no-obligation IT assessment and discover how we can optimise your business technology.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary">Request a Free Consultation</Button></Link>
              <a href="mailto:accounts@siyakhatechnology.co.za" className="inline-flex"><Button variant="secondary">Email Us</Button></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    </div>
  );
};

export default ItCompanySandton;
