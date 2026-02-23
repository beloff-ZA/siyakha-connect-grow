import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Headphones, 
  Cable, 
  Users, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Phone
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const FieldSupportServices = () => {
  useEffect(() => {
    const title = "Field Support Services | Remote IT & Networking Engineers | Siyakha Technology";
    const description = "Professional field support services: remote IT support technicians, cabling & networking roaming engineers, and nationwide network of support engineers across South Africa.";
    document.title = title;

    const ensureMeta = (key: "name" | "property", value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${key}='${value}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(key, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", `${window.location.origin}/services/field-support-services`);

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/services/field-support-services`);
  }, []);

  const services = [
    {
      icon: Headphones,
      title: "Remote IT Support Technicians",
      description: "24/7 remote technical support for your business",
      features: [
        "Instant remote desktop support",
        "Software troubleshooting & updates",
        "Network monitoring & diagnostics",
        "User account management",
        "Security incident response",
        "Helpdesk ticketing system"
      ],
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Cable,
      title: "Cabling & Networking Roaming Engineers",
      description: "Expert technicians deployed to your location",
      features: [
        "Structured cabling installation",
        "Fibre optic termination",
        "Network switch configuration",
        "Wi-Fi site surveys & installation",
        "Cable testing & certification",
        "Rack & patch panel installation"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Network of Support Engineers",
      description: "Nationwide coverage with local expertise",
      features: [
        "Engineers in all major cities",
        "Same-day dispatch capability",
        "Multi-vendor certified technicians",
        "Project-based or retainer models",
        "Escalation support structure",
        "SLA-backed response times"
      ],
      color: "from-purple-500 to-purple-600"
    }
  ];

  const stats = [
    { value: "200+", label: "Field Engineers", icon: Users },
    { value: "9", label: "Provinces Covered", icon: MapPin },
    { value: "4hr", label: "Response Time", icon: Clock },
    { value: "99.5%", label: "SLA Compliance", icon: Shield }
  ];

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Field Support Services",
    provider: {
      "@type": "Organization",
      name: "Siyakha Technology",
      url: "https://siyakhatechnology.co.za"
    },
    description: "Professional field support services including remote IT support, cabling engineers, and nationwide support network.",
    areaServed: {
      "@type": "Country",
      name: "South Africa"
    },
    serviceType: ["IT Support", "Network Installation", "Field Engineering"]
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 border-b border-border overflow-hidden">
          <img 
            src={heroImage} 
            alt="Field support technicians at work" 
            className="absolute inset-0 w-full h-full object-cover" 
            loading="eager" 
          />
          <div className="page-header-overlay" />
          <div className="absolute inset-0 tech-grid opacity-20" />
          <div className="relative container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
                Field Support Services
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Expert IT Support, <span className="text-accent">Anywhere You Need It</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                From remote helpdesk support to on-site networking engineers, we provide comprehensive field support services across South Africa.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact#quote-form">
                  <Button className="cta-primary text-lg px-8 py-6">
                    Get a Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="tel:+27815012993">
                  <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Us Now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="glass p-6 rounded-xl text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent" />
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Our Field Support Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive support solutions tailored to your business needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                      {service.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple process to get expert IT support for your business
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Log a Request", desc: "Submit your support request via our portal or phone" },
                { step: "2", title: "Assessment", desc: "Our team evaluates the issue and assigns the right technician" },
                { step: "3", title: "Dispatch", desc: "Remote support starts immediately or engineer is dispatched" },
                { step: "4", title: "Resolution", desc: "Issue resolved with full documentation and follow-up" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-teal-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary/90">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Whether you need remote support or on-site engineers, we're here to help your business thrive.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact#quote-form">
                <Button className="cta-primary text-lg px-8 py-6">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default FieldSupportServices;
