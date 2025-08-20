import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Wifi, ShieldCheck, Router, Cable, Server, Wrench, CheckCircle, Globe2, Building2, ArrowLeft } from "lucide-react";

const KFC_IMAGE = "/lovable-uploads/1840c802-41fe-4f29-ae89-891da2fe347c.png";

const KFCExmileProject = () => {
  useEffect(() => {
    document.title = "KFC – National Network Infrastructure Rollout | Siyakha";

    const desc = "Nationwide Wi‑Fi, firewalls and connectivity rollout for KFC South Africa in partnership with Exmile, including deployment, config and support.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const canonicalHref = window.location.origin + "/projects/kfc-national-network-rollout";
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setOg("og:title", document.title);
    setOg("og:description", desc);
    setOg("og:type", "article");
    setOg("og:image", KFC_IMAGE);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "KFC – National Network Infrastructure Rollout (with Exmile)",
    description:
      "Nationwide Wi‑Fi and secure network rollout: 50+ firewalls, 1000+ devices & APs, deployment & support across South Africa.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: KFC_IMAGE,
    author: { "@type": "Organization", name: "Siyakha Technology" },
    about: ["Wi‑Fi", "Firewalls", "Network Rollout", "Retail"],
    locationCreated: { "@type": "Place", name: "South Africa (Nationwide)" }
  };

  const contributions = [
    {
      icon: Wifi,
      title: "Nationwide Wi‑Fi & Network",
      description:
        "Assisted with rollout of secure Wi‑Fi and network solutions across KFC stores countrywide."
    },
    {
      icon: ShieldCheck,
      title: "Firewall Deployment",
      description:
        "Deployed and configured 50+ firewalls to strengthen branch‑level security and compliance."
    },
    {
      icon: Router,
      title: "1000+ Devices & APs",
      description:
        "Managed installation and configuration of 1000+ connectivity devices and wireless APs."
    },
    {
      icon: Wrench,
      title: "End‑to‑End Project Support",
      description:
        "Full project management, device configuration, and post‑deployment support with minimal disruption."
    }
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <img
          src={KFC_IMAGE}
          alt="KFC South Africa store exterior"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-6 py-12">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm">
            In Partnership with Exmile
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            KFC – National Network Infrastructure Rollout
          </h1>
          <p className="text-white/90 max-w-3xl">
            We partnered with Exmile to deliver comprehensive network support and deployment services for KFC South Africa as part of a large‑scale digital infrastructure upgrade.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-white/90">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Nationwide</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Retail · QSR</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Wi‑Fi · Firewalls · Deployment</span>
          </div>
        </div>
      </section>

      {/* Overview CTA */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground max-w-3xl">
            This successful rollout strengthened our collaboration with Exmile and helped modernize the IT infrastructure of one of South Africa’s most recognized retail brands.
          </div>
          <div className="flex gap-3">
            <Link to="/contact" className="inline-flex">
              <Button className="cta-primary">Request a Consultation</Button>
            </Link>
            <Button
              variant="outline"
              className="cta-secondary"
              onClick={() => (window.location.href = "/projects")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Contributions */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Our Contributions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributions.map((c, i) => (
                <Card key={i} className="service-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <c.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">{c.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{c.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Firewalls Deployed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">1000+</div>
              <div className="text-sm text-muted-foreground">Devices & APs Configured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">Nationwide</div>
              <div className="text-sm text-muted-foreground">Multi‑site Rollout</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">SLA‑Driven</div>
              <div className="text-sm text-muted-foreground">Project & Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">Need a partner for nationwide rollouts?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">We manage planning, deployment, and support at scale—without disrupting business.</p>
          <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary px-8 py-4">Book My Free Consultation</Button></Link>
        </div>
      </section>
    </main>
  );
};

export default KFCExmileProject;
