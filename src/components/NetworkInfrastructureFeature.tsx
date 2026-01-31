import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Shield, Zap, CheckCircle, Cable } from "lucide-react";
import { Link } from "react-router-dom";

const NetworkInfrastructureFeature = () => {
  const features = [
    {
      icon: Cable,
      title: "Professional Cabling",
      description: "Cat6/Cat6A data points installed to spec"
    },
    {
      icon: Shield,
      title: "Network Security",
      description: "Firewall, VLAN segmentation & access control"
    },
    {
      icon: Network,
      title: "Infrastructure Upgrades",
      description: "Switches, routers, and Wi-Fi enhancements"
    },
    {
      icon: CheckCircle,
      title: "Bulk Discounts",
      description: "Volume pricing on large installations"
    }
  ];

  const projects = [
    {
      image: "/lovable-uploads/b5123bb8-e9c6-4737-bd9b-3e6d9a97df2e.png",
      title: "School Network Upgrade",
      description: "Complete infrastructure overhaul"
    },
    {
      image: "/lovable-uploads/5c53be57-de20-455a-aa49-6ac211db9e73.png",
      title: "Office Cabling Project",
      description: "200+ network points installed"
    },
    {
      image: "/lovable-uploads/329436ed-9b85-46bd-9a90-9921225137c1.png",
      title: "Retail Chain Rollout",
      description: "Multi-site networking solution"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                🔌 Network Infrastructure
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                Professional Network & Infrastructure Solutions
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Build a rock-solid network foundation for your business. From structured cabling to enterprise-grade networking equipment, we deliver infrastructure that scales with your growth.
              </p>
            </div>

            {/* Pricing Highlight */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-semibold text-primary">Order Your Service Now</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-accent">R1,475</span>
                <span className="text-muted-foreground">per network point</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Includes installation, testing & certification. <strong className="text-primary">Discounts available on bulk orders!</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="inline-flex">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  Get a Quote
                </Button>
              </Link>
              <Link to="/services/infrastructure-and-networking" className="inline-flex">
                <Button variant="outline" size="lg">
                  View All Services
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-card/50">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Showcase */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary">Our Infrastructure Work</h3>
            <div className="grid gap-4">
              {projects.map((project, index) => (
                <Card key={index} className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="py-4 pr-4">
                        <h4 className="font-semibold text-primary group-hover:text-accent transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trust Signal */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">Since 2008</strong> • Nationwide Coverage • BEE Level 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NetworkInfrastructureFeature;
