import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Shield, Cloud, MessageSquare, ArrowRight, Wrench, Headphones } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Wifi,
      title: "Infrastructure & Networking",
      description: "Data Cabling, Switches, Wi-Fi, Trunking",
      benefit: "Future-proof your business network with scalable Wi-Fi & cabling.",
      link: "/services/infrastructure-and-networking",
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Security & Surveillance",
      description: "CCTV, Access Control, Electric Fencing, Gate Automation, Alarms",
      benefit: "Protect your assets with intelligent security systems.",
      link: "/services/security-and-surveillance",
      color: "text-red-600"
    },
    {
      icon: Cloud,
      title: "Cloud & Edge Solutions",
      description: "Server Setup, Migration, Backup & Recovery",
      benefit: "Scale your operations with reliable cloud infrastructure.",
      link: "/services/cloud-and-edge-solutions",
      color: "text-purple-600"
    },
    {
      icon: MessageSquare,
      title: "Smart Collaboration Tools",
      description: "VoIP, Remote Work, Microsoft 365, Email Systems",
      benefit: "Enable seamless communication across your organization.",
      link: "/services/smart-collaboration-tools",
      color: "text-green-600"
    },
    {
      icon: Wrench,
      title: "National Field Support",
      description: "Onsite smart hands across South Africa",
      benefit: "Dispatch certified techs for rollouts, swaps and break/fix.",
      link: "/services/national-field-support/cutovers-and-sim-replacements",
      color: "text-amber-600"
    },
    {
      icon: Headphones,
      title: "Field Support Services",
      description: "Remote IT, Cabling Engineers & Support Network",
      benefit: "Access our nationwide network of skilled technicians.",
      link: "/services/field-support-services",
      color: "text-teal-600"
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Core Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive ICT solutions designed to transform your business operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="service-card group cursor-pointer"
              onClick={() => window.location.href = service.link}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={`w-8 h-8 ${service.color} group-hover:text-accent transition-colors duration-300`} />
                </div>
                <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  {service.description}
                </p>
                <p className="text-primary font-medium text-sm leading-relaxed mb-4">
                  {service.benefit}
                </p>
                <Button 
                  variant="ghost" 
                  className="text-accent hover:text-accent-hover group/btn p-0 h-auto font-medium"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Features Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-accent mb-2">Same Day</div>
            <div className="text-sm text-muted-foreground">Site Visits</div>
          </div>
          <div className="p-6 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-accent mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
          <div className="p-6 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-accent mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="p-6 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-accent mb-2">Free</div>
            <div className="text-sm text-muted-foreground">Consultations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;