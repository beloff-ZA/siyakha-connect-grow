import { useEffect } from "react";
import { ArrowLeft, Wifi, Users, Clock, Shield, Monitor, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GuestWifiSolutions = () => {
  useEffect(() => {
    const title = "Guest Wi-Fi Solutions for Hotels & Restaurants | Siyakha";
    const description = "Professional guest Wi-Fi infrastructure with branded login portals, time-based access control, and seamless user experience for hospitality venues.";
    
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
    ensureMeta("property", "og:type", "article");
    ensureMeta("property", "og:url", `${window.location.origin}/projects/guest-wifi-solutions`);
    
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/projects/guest-wifi-solutions`);
  }, []);

  const projectFeatures = [
    {
      icon: Monitor,
      title: "Branded Login Portals",
      description: "Custom-designed Wi-Fi portals featuring client branding and multiple tenant support"
    },
    {
      icon: Clock,
      title: "Time-Based Access Control",
      description: "Flexible time limits (30 mins, 2 hours, full day) with automatic disconnection"
    },
    {
      icon: Users,
      title: "User Management System",
      description: "Guest registration, usage tracking, and analytics dashboard"
    },
    {
      icon: Shield,
      title: "Secure Network Isolation",
      description: "Isolated guest network with firewall protection and content filtering"
    },
    {
      icon: Settings,
      title: "Centralized Management",
      description: "Remote monitoring, configuration updates, and real-time usage statistics"
    },
    {
      icon: Wifi,
      title: "High-Performance Infrastructure",
      description: "Enterprise-grade wireless infrastructure with seamless roaming"
    }
  ];

  const technicalSpecs = [
    { label: "Network Architecture", value: "Segmented Guest VLAN with Firewall Protection" },
    { label: "Access Points", value: "Enterprise Wi-Fi 6 with Seamless Roaming" },
    { label: "Portal Integration", value: "Custom Branded Captive Portal" },
    { label: "User Capacity", value: "1000+ Concurrent Users" },
    { label: "Time Management", value: "Flexible Session Controls (30min - 24hrs)" },
    { label: "Analytics", value: "Real-time Usage Reports & Demographics" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <Wifi className="w-4 h-4 mr-1" />
                  Hospitality Wi-Fi
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                Guest Wi-Fi Solutions for Hotels & Restaurants
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Professional guest Wi-Fi infrastructure with branded login portals, time-based access control, 
                and seamless user experience for hospitality venues including Thavhani Mall.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="inline-flex">
                  <Button className="cta-primary">Request a Consultation</Button>
                </Link>
                <Button variant="outline" className="cta-secondary" onClick={() => (window.location.href = "/projects")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/lovable-uploads/08c32d0c-30d7-4eb1-b8c2-73824f3fd226.png"
                alt="Professional network rack installation for guest Wi-Fi infrastructure"
                className="rounded-lg shadow-2xl w-full h-auto"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Portal Interface Showcase */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Branded Portal Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Custom-designed Wi-Fi portals that reflect your brand and provide an intuitive user experience.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/536b36ad-d93e-4ae6-941a-f55cf5ac1fb9.png"
                alt="Thavhani Mall guest Wi-Fi portal showing branded interface with restaurant logos and free Wi-Fi access"
                className="w-full h-auto"
                loading="lazy" 
                decoding="async"
              />
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Thavhani Mall implementation featuring multiple restaurant brands with time-limited access control
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Complete Guest Wi-Fi Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to provide professional guest Wi-Fi access with full control and branding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Technical Specifications
              </h2>
              <p className="text-xl text-muted-foreground">
                Enterprise-grade infrastructure designed for hospitality environments.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {technicalSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-card rounded-lg border">
                  <span className="font-medium text-primary">{spec.label}</span>
                  <span className="text-muted-foreground text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Perfect for Hospitality Venues
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our guest Wi-Fi solutions are tailored for various hospitality environments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Shopping Malls", description: "Multi-tenant environments with brand-specific portals" },
              { title: "Hotels & Lodges", description: "Guest registration with room-based access control" },
              { title: "Restaurants", description: "Time-limited access with promotional content" },
              { title: "Conference Centers", description: "Event-specific Wi-Fi with custom branding" }
            ].map((useCase, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-primary mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Ready to Enhance Your Guest Experience?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Let us design and implement a professional guest Wi-Fi solution tailored to your hospitality venue.
          </p>
          <Link to="/contact" className="inline-flex">
            <Button className="cta-primary px-8 py-4">Get Your Guest Wi-Fi Quote</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuestWifiSolutions;