import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { CheckCircle, MapPin, ArrowLeft, AlertTriangle, Cable, ShieldCheck, Headphones, Camera, Cloud, Globe2, Wifi, Server, Network } from "lucide-react";

const MARIST_IMAGE = "/lovable-uploads/b998daf2-a8ef-498b-adb2-59eca8e135ef.png";

const MaristBrothersProject = () => {
  useEffect(() => {
    document.title = "Marist Brothers Linmeyer – Infrastructure & Security Upgrade | Siyakha";

    const desc = "Enhanced IT and security infrastructure including solid copper cabling, managed switches, 4MP CCTV cameras, and VLAN configuration for Marist Brothers Linmeyer.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const canonicalHref = window.location.origin + "/projects/marist-brothers-linmeyer";
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
    setOg("og:image", MARIST_IMAGE);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Marist Brothers Linmeyer – Infrastructure & Security Upgrade",
    description:
      "Enhanced IT and security infrastructure including solid copper cabling, managed switches, 4MP CCTV cameras, and VLAN configuration.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: MARIST_IMAGE,
    author: {
      "@type": "Organization",
      name: "Siyakha Technology"
    },
    about: ["Cabling", "CCTV", "Network Management", "VLAN", "Google Workspace"],
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
        "Required a robust, multi-layered security solution to protect sensitive data and the network."
    },
    {
      icon: Globe2,
      title: "Web & domain management",
      description:
        "Inadequate management affecting online efficiency and increasing risk exposure."
    },
    {
      icon: Camera,
      title: "Fragmented CCTV system",
      description:
        "Lacked centralized control, remote access, and comprehensive surveillance."
    }
  ];

  const deliverables = [
    {
      icon: Cable,
      title: "Solid Copper Cabling",
      description: "Replaced old/poor cabling with reliable solid copper infrastructure for stable connectivity."
    },
    {
      icon: Network,
      title: "Network Repairs & Optimization",
      description: "Comprehensive network repairs and performance improvements across the campus."
    },
    {
      icon: Wifi,
      title: "Managed Switches & Access Points",
      description: "Installation of managed switches and deployment of managed access points for better control and scalability."
    },
    {
      icon: Camera,
      title: "4MP CCTV Upgrade",
      description: "Upgraded to 4MP cameras plus PT function cameras with audio, alarms, and active deterrence features."
    },
    {
      icon: ShieldCheck,
      title: "VLAN Setup & Management",
      description: "Structured network segmentation and control through VLAN configuration and governance."
    },
    {
      icon: Cloud,
      title: "Google Workspace Administration",
      description: "Ongoing Google Workspace management, server setup, and broader infrastructure support."
    },
    {
      icon: Server,
      title: "Server Setup & Configuration",
      description: "Complete server setup and configuration to support campus operations."
    },
    {
      icon: Headphones,
      title: "Ongoing IT Management",
      description: "Continuous IT infrastructure management and platform support services."
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
            Marist Brothers – Infrastructure & Security Upgrade
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-white/90">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              <MapPin className="w-4 h-4 mr-1" /> Johannesburg, Gauteng
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              Education
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              Cabling · CCTV · VLAN · Network Management
            </span>
          </div>
        </div>
      </section>

      {/* Overview CTA */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="text-muted-foreground max-w-3xl">
            We enhanced and modernized the existing IT and security infrastructure to improve reliability, performance, and visibility across the environment. This included removing aged and substandard cabling and replacing it with solid copper cabling, repairing and optimizing the network, and deploying managed switches with managed access points for better control and scalability.
          </div>
          <div className="flex gap-3 shrink-0">
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

      {/* Security & CCTV Summary */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-2">Security & Surveillance Enhancement</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    On the security side, we upgraded the CCTV system by installing 4MP cameras as well as PT (Pan-Tilt) function cameras with audio, alarm capabilities, and active deterrence features, enabling clearer monitoring, stronger coverage, and improved incident response.
                  </p>
                </div>
              </div>
            </div>
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
              security infrastructure that required immediate attention:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((c, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
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

      {/* Key Deliverables */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Key Deliverables
            </h2>
            <p className="text-muted-foreground mb-8">
              We implemented a comprehensive infrastructure upgrade addressing every concern:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliverables.map((d, i) => (
                <Card key={i} className="service-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <d.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">
                        {d.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {d.description}
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
            Book a free consultation and our team will tailor a solution to your needs.
          </p>
          <Link to="/contact#quote-form" className="inline-flex">
            <Button className="cta-primary px-8 py-4">Book My Free Consultation</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default MaristBrothersProject;
