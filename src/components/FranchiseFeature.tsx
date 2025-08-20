import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Shield, MonitorSpeaker, Database, Network, Store } from "lucide-react";
import { Link } from "react-router-dom";

const FranchiseFeature = () => {
  const franchiseServices = [
    {
      icon: Wifi,
      title: "Guest Wi-Fi Solutions",
      description: "Branded portal experiences with time-based access control"
    },
    {
      icon: Shield,
      title: "Enterprise Firewalls",
      description: "Advanced security with centralized management across locations"
    },
    {
      icon: Network,
      title: "VPN Connectivity",
      description: "Secure site-to-site connections for multi-location businesses"
    },
    {
      icon: Database,
      title: "DRaaS Solutions",
      description: "Disaster recovery with rapid failover capabilities"
    },
    {
      icon: MonitorSpeaker,
      title: "In-Store Display Systems",
      description: "Digital signage and interactive display solutions"
    },
    {
      icon: Store,
      title: "Complete Store Setup",
      description: "End-to-end technology deployment for new locations"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🏪 Franchise Solutions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                Let's Talk Franchise
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Guest Wi-Fi, Firewalls, VPNs as well as DRaaS solutions for in-store display solutions. 
                We have partnered with one of the biggest in the game, bringing you the most affordable 
                in-store connectivity systems.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-accent/20">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Store className="w-5 h-5 text-accent" />
                Why Choose Our Franchise Solutions?
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  Standardized technology stack across all locations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  Centralized management and monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  Cost-effective bulk deployment pricing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  24/7 support for all franchise locations
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="inline-flex">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Discuss Franchise Setup
                </Button>
              </Link>
              <Link to="/contact" className="inline-flex">
                <Button variant="outline" size="lg">
                  Get Bulk Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {franchiseServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <service.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-accent/10 text-accent font-medium">
            <Shield className="w-5 h-5 mr-2" />
            Trusted Partner for Affordable In-Store Connectivity
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseFeature;