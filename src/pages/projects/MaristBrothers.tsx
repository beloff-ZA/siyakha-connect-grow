import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { CheckCircle, MapPin, ArrowLeft, AlertTriangle, Cable, ShieldCheck, Headphones, Camera, Cloud, Globe2 } from "lucide-react";

const MARIST_IMAGE = "/lovable-uploads/b998daf2-a8ef-498b-adb2-59eca8e135ef.png";

const MaristBrothersProject = () => {
  // SEO metadata for this page
  useEffect(() => {
    document.title = "Marist Brothers Linmeyer – Project Case Study | Siyakha";

    const desc = "Full Wi‑Fi & data infrastructure upgrade with integrated CCTV, cloud, and cybersecurity for Marist Brothers Linmeyer.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    // Canonical
    const canonicalHref = window.location.origin + "/projects/marist-brothers-linmeyer";
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    // Open Graph basic tags
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
    setOg("og:image", MARIST_IMAGE);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Marist Brothers Linmeyer – ICT Infrastructure Upgrade",
    description:
      "Comprehensive network, security, and cloud integration upgrade including Wi‑Fi, CCTV centralization, and cybersecurity hardening.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: MARIST_IMAGE,
    author: {
      "@type": "Organization",
      name: "Siyakha Technology"
    },
    about: ["Wi‑Fi", "CCTV", "Cybersecurity", "Cloud Integration"],
    locationCreated: {
      "@type": "Place",
      name: "Johannesburg, Gauteng, South Africa"
    }
  };

  const challenges = [
    {
      icon: AlertTriangle,
      title: "Unmonitored blind spots",
      description:
        "Operational vulnerabilities due to insufficient CCTV coverage and oversight."
    },
    {
      icon: Cloud,
      title: "Platform interoperability",
      description:
        "Need for seamless integration between Google Workspace and Microsoft platforms."
    },
    {
      icon: ShieldCheck,
      title: "Weak cybersecurity posture",
      description:
        "Required a robust multi‑layered solution to protect sensitive data and the network."
    },
    {
      icon: Globe2,
      title: "Web & domain management",
      description:
        "Inadequate management impacting online efficiency and increasing risk exposure."
    },
    {
      icon: Camera,
      title: "Fragmented CCTV system",
      description:
        "Lacked centralized control, remote access, and comprehensive surveillance."
    }
  ];

  const solutions = [
    {
      icon: Cable,
      title: "Network Overhaul",
      description:
        "Reorganized and optimized cable layout using Cat6/Cat6a and upgraded all switches to SFP++ for high‑speed, stable connectivity."
    },
    {
      icon: ShieldCheck,
      title: "Cybersecurity Reinforcement",
      description:
        "Deployed a multi‑layered stack combining software and hardware defenses to reduce cyber risk exposure."
    },
    {
      icon: Headphones,
      title: "Onsite Support Deployment",
      description:
        "Dedicated on‑premise technical teams for immediate resolution and continuous performance."
    },
    {
      icon: Headphones,
      title: "Enhanced Support Services",
      description:
        "Introduced faster, SLA‑driven ticketing and support management for responsive service."
    },
    {
      icon: Camera,
      title: "CCTV System Upgrade",
      description:
        "Centralized platform with remote monitoring, smart analytics, and expanded visual coverage."
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description:
        "Enabled smooth Google ↔ Microsoft interoperability to boost collaboration and productivity."
    },
    {
      icon: Globe2,
      title: "Web & Domain Services",
      description:
        "Strengthened hosting, domain security, and management for a secure online presence."
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
          src={MARIST_IMAGE}
          alt="Marist Brothers Linmeyer campus"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-6 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" aria-current="page">
                  Marist Brothers Linmeyer
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Marist Brothers Linmeyer
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-white/90">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              <MapPin className="w-4 h-4 mr-1" /> Johannesburg, Gauteng
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              Education
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              Wi‑Fi & Data · CCTV · Cloud · Security
            </span>
          </div>
        </div>
      </section>

      {/* Overview CTA */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground">
            A comprehensive ICT upgrade delivering reliable connectivity, centralized
            security, and stronger cyber resilience.
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

      {/* The Challenge */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              The Challenge
            </h2>
            <p className="text-muted-foreground mb-8">
              The client faced several critical challenges within their IT and
              security infrastructure that demanded immediate attention. Key
              concerns included:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((c, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center">
                      <c.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">
                        {c.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Our Solution
            </h2>
            <p className="text-muted-foreground mb-8">
              We implemented a comprehensive infrastructure upgrade that addressed each concern:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((s, i) => (
                <Card key={i} className="service-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">
                        {s.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Ready to transform your campus infrastructure?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Book a free consultation and our team will tailor a solution to your
            needs.
          </p>
          <Link to="/contact#quote-form" className="inline-flex"><Button className="cta-primary px-8 py-4">Book My Free Consultation</Button></Link>
        </div>
      </section>
    </main>
  );
};

export default MaristBrothersProject;
