import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Server, Network, Wifi, HardDrive, Cable, ArrowLeft, CheckCircle } from "lucide-react";

const GREESTONE_IMAGE = "/lovable-uploads/c8302aaa-3768-46a7-93ab-e0b5021f6d5c.png";

const GreestoneProject = () => {
  useEffect(() => {
    document.title = "Greestone Network Infrastructure Rebuild | Siyakha Technology";

    const desc = "Complete network infrastructure rebuild for Greestone including Linux server installation, network point upgrades, new switches, cabinet installation, and ongoing network support.";
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const canonicalHref = window.location.origin + "/projects/greestone-network-rebuild";
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
    setOg("og:image", GREESTONE_IMAGE);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Greestone Network Infrastructure Rebuild",
    description: "Complete network infrastructure overhaul including Linux server installation, network upgrades, and ongoing support services.",
    url: typeof window !== "undefined" ? window.location.href : "",
    image: GREESTONE_IMAGE,
    author: { "@type": "Organization", name: "Siyakha Technology" },
    about: ["Network Infrastructure", "Linux Server", "Network Switches", "IT Support"],
    locationCreated: { "@type": "Place", name: "South Africa" }
  };

  const projectFeatures = [
    {
      icon: Server,
      title: "Linux Server Installation",
      description: "Deployed and configured a robust Linux server solution to serve as the backbone of the new network infrastructure."
    },
    {
      icon: Cable,
      title: "Network Points Upgrade",
      description: "Upgraded existing network points throughout the facility to support modern networking standards and improved connectivity."
    },
    {
      icon: Network,
      title: "New Network Switches",
      description: "Installed and configured new enterprise-grade network switches to handle increased traffic and provide better network segmentation."
    },
    {
      icon: HardDrive,
      title: "New Network Cabinet",
      description: "Installed a professional network cabinet to house all networking equipment with proper cable management and ventilation."
    }
  ];

  const projectBenefits = [
    "Enhanced network performance and reliability",
    "Improved security with modern infrastructure", 
    "Scalable solution for future growth",
    "Professional cable management and organization",
    "Linux-based server for stability and cost efficiency",
    "Comprehensive network monitoring capabilities"
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
          src={GREESTONE_IMAGE}
          alt="Greestone business building exterior with green and white striped awning"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-6 py-12">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm">
            Network Infrastructure Rebuild
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Greestone Network Infrastructure Rebuild
          </h1>
          <p className="text-white/90 max-w-3xl">
            Complete network infrastructure overhaul including Linux server installation, network point upgrades, new switches, professional cabinet installation, and comprehensive ongoing network support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-white/90">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Linux Server</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Network Rebuild</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">Infrastructure Upgrade</span>
          </div>
        </div>
      </section>

      {/* Overview CTA */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground max-w-3xl">
            This comprehensive network rebuild transformed Greestone's IT infrastructure, providing a modern, scalable, and reliable foundation for their business operations with Linux-based server solutions and enterprise-grade networking equipment.
          </div>
          <div className="flex gap-3">
            <Link to="/contact" className="inline-flex">
              <Button className="cta-primary">Plan Your Network Upgrade</Button>
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

      {/* Project Components */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Infrastructure Components Delivered
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

      {/* Project Benefits */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              Project Benefits & Outcomes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <h3 className="text-xl font-bold text-primary mb-6 text-center">Technical Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">Linux</div>
              <div className="text-sm text-muted-foreground">Server Platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">Enterprise</div>
              <div className="text-sm text-muted-foreground">Grade Switches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">Professional</div>
              <div className="text-sm text-muted-foreground">Network Cabinet</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Network Services */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              Why Choose Our Network Infrastructure Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Linux Expertise</h4>
                  <p className="text-muted-foreground text-sm">Deep knowledge of Linux server deployment and management for reliable, cost-effective solutions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Enterprise Hardware</h4>
                  <p className="text-muted-foreground text-sm">We use only enterprise-grade networking equipment for maximum reliability and performance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Professional Installation</h4>
                  <p className="text-muted-foreground text-sm">Clean, organized installations with proper cable management and documentation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Ongoing Support</h4>
                  <p className="text-muted-foreground text-sm">Comprehensive maintenance, monitoring, and technical support for your network infrastructure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Ready to Rebuild Your Network Infrastructure?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Transform your business with modern, reliable network infrastructure. From Linux servers to enterprise switches, we deliver complete solutions with ongoing support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="inline-flex">
              <Button className="cta-primary px-8 py-4">Get Network Assessment</Button>
            </Link>
            <Link to="/services/infrastructure-and-networking" className="inline-flex">
              <Button variant="outline" className="cta-secondary px-8 py-4">
                View Network Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GreestoneProject;