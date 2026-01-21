import { Button } from "@/components/ui/button";
import { Wifi, Shield, MonitorSpeaker, Database, Network, Store, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FranchiseFeature = () => {
  const franchiseServices = [
    { icon: Wifi, title: "Guest Wi-Fi" },
    { icon: Shield, title: "Enterprise Firewalls" },
    { icon: Network, title: "VPN Connectivity" },
    { icon: Database, title: "DRaaS Solutions" },
    { icon: MonitorSpeaker, title: "Display Systems" },
    { icon: Store, title: "Complete Setup" }
  ];

  const benefits = [
    "Standardized technology stack across all locations",
    "Centralized management and monitoring",
    "Cost-effective bulk deployment pricing",
    "24/7 support for all franchise locations"
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Content Side */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-8">
              <Store className="w-4 h-4 mr-2" />
              Franchise Solutions
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 tracking-tight leading-[1.1]">
              Let's Talk
              <br />
              <span className="text-accent">Franchise</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Guest Wi-Fi, Firewalls, VPNs and DRaaS for in-store display solutions. 
              We've partnered with industry leaders to bring you the most affordable connectivity.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-accent">{index + 1}</span>
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold group">
                <Link to="/contact">
                  Discuss Franchise Setup
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold">
                <Link to="/contact">
                  Get Bulk Pricing
                </Link>
              </Button>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {franchiseServices.map((service, index) => (
              <div 
                key={index} 
                className="p-6 bg-secondary rounded-xl text-center hover:bg-accent/10 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-background rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                  <service.icon className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-primary text-sm">
                  {service.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseFeature;
