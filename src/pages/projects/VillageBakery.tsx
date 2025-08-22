import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Camera, ShieldCheck, Monitor, Eye, CheckCircle, ArrowLeft } from "lucide-react";

const BAKERY_IMAGE = "/lovable-uploads/134e1b88-479c-4122-9897-1e74ae8819a9.png";

const VillageBakeryProject = () => {
  useEffect(() => {
    document.title = "The Village Bakery CCTV Installation | Siyakha Technology";

    const desc = "Complete CCTV surveillance system installation for The Village Bakery in Fordsburg, providing comprehensive security coverage for the entire property and in-store monitoring.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const canonicalHref = window.location.origin + "/projects/village-bakery-cctv";
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
    setOg("og:image", BAKERY_IMAGE);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "The Village Bakery CCTV Installation",
    description: "Complete CCTV surveillance system installation providing comprehensive security coverage for bakery operations in Fordsburg.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: BAKERY_IMAGE,
    author: { "@type": "Organization", name: "Siyakha Technology" },
    about: ["CCTV", "Security", "Surveillance", "Retail Security"],
    locationCreated: { "@type": "Place", name: "Fordsburg, South Africa" }
  };

  const projectFeatures = [
    {
      icon: Camera,
      title: "Complete Property Coverage",
      description: "Strategic camera placement around the entire bakery property ensuring no blind spots for maximum security coverage."
    },
    {
      icon: Monitor,
      title: "In-Store CCTV System",
      description: "Comprehensive in-store surveillance monitoring customer areas, display cases, and staff work areas for operational security."
    },
    {
      icon: Eye,
      title: "24/7 Monitoring Capability",
      description: "High-quality cameras with night vision and continuous recording capabilities for round-the-clock surveillance."
    },
    {
      icon: ShieldCheck,
      title: "Retail Security Solution",
      description: "Tailored security system designed specifically for bakery operations, protecting valuable equipment and inventory."
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
          src={BAKERY_IMAGE}
          alt="The Village Bakery display case with various cakes and pastries"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-6 py-12">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm">
            🇿🇦 Fordsburg, South Africa
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Village Bakery CCTV Installation
          </h1>
          <p className="text-white/90 max-w-3xl">
            Complete CCTV surveillance system installation providing comprehensive security coverage around the entire property and in-store monitoring for The Village Bakery in Fordsburg.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-white/90">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">CCTV Installation</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Retail Security</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">24/7 Surveillance</span>
          </div>
        </div>
      </section>

      {/* Overview CTA */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground max-w-3xl">
            This project enhanced security measures for The Village Bakery, protecting their valuable baking equipment, inventory, and ensuring customer and staff safety through comprehensive surveillance coverage.
          </div>
          <div className="flex gap-3">
            <Link to="/contact" className="inline-flex">
              <Button className="cta-primary">Get Your Security Quote</Button>
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

      {/* Project Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Security Solutions Delivered
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectFeatures.map((feature, i) => (
                <Card key={i} className="service-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Highlights */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <h3 className="text-xl font-bold text-primary mb-6 text-center">Project Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">Complete</div>
              <div className="text-sm text-muted-foreground">Property Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">In-Store</div>
              <div className="text-sm text-muted-foreground">CCTV Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Security Surveillance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our CCTV Services */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              Why Choose Our CCTV Solutions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Professional Installation</h4>
                  <p className="text-muted-foreground text-sm">Expert technicians ensure optimal camera placement and system configuration.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">High-Quality Equipment</h4>
                  <p className="text-muted-foreground text-sm">State-of-the-art cameras with superior image quality and reliability.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Scalable Solutions</h4>
                  <p className="text-muted-foreground text-sm">Systems designed to grow with your business needs and requirements.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Ongoing Support</h4>
                  <p className="text-muted-foreground text-sm">Comprehensive maintenance and technical support services.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Secure Your Business with Professional CCTV
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Protect your property, assets, and people with our comprehensive CCTV surveillance solutions. Get a customized security assessment today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="inline-flex">
              <Button className="cta-primary px-8 py-4">Get Free Security Assessment</Button>
            </Link>
            <Link to="/services/security-and-surveillance" className="inline-flex">
              <Button variant="outline" className="cta-secondary px-8 py-4">
                View Our Security Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VillageBakeryProject;