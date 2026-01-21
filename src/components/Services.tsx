import { Button } from "@/components/ui/button";
import { Wifi, Shield, Cloud, MessageSquare, ArrowRight, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: Wifi,
      title: "Infrastructure & Networking",
      description: "Data Cabling, Switches, Wi-Fi, Trunking",
      benefit: "Future-proof your business network with scalable Wi-Fi & cabling.",
      link: "/services/infrastructure-and-networking"
    },
    {
      icon: Shield,
      title: "Security & Surveillance",
      description: "CCTV, Access Control, Intercoms, Smart Gates",
      benefit: "Protect your assets with intelligent security systems.",
      link: "/services/security-and-surveillance"
    },
    {
      icon: Cloud,
      title: "Cloud & Edge Solutions",
      description: "Server Setup, Migration, Backup & Recovery",
      benefit: "Scale your operations with reliable cloud infrastructure.",
      link: "/services/cloud-and-edge-solutions"
    },
    {
      icon: MessageSquare,
      title: "Smart Collaboration Tools",
      description: "VoIP, Remote Work, Microsoft 365, Email Systems",
      benefit: "Enable seamless communication across your organization.",
      link: "/services/smart-collaboration-tools"
    },
    {
      icon: Wrench,
      title: "National Field Support",
      description: "Onsite smart hands across South Africa",
      benefit: "Dispatch certified techs for rollouts, swaps and break/fix.",
      link: "/services/national-field-support/cutovers-and-sim-replacements"
    }
  ];

  const stats = [
    { value: "Same Day", label: "Site Visits" },
    { value: "24/7", label: "Monitoring" },
    { value: "100%", label: "Uptime SLA" },
    { value: "Free", label: "Consultations" }
  ];

  return (
    <section id="services" className="py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="divider-bold mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight leading-[1.1]">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Comprehensive ICT solutions designed to transform your business operations.
          </p>
        </div>

        {/* Services List */}
        <div className="border-t border-border">
          {services.map((service, index) => (
            <Link 
              key={index}
              to={service.link}
              className="service-item group cursor-pointer"
            >
              <div className="flex-shrink-0 text-5xl font-bold text-accent/20 leading-none select-none w-20">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <service.icon className="w-7 h-7 text-accent group-hover:text-white transition-colors duration-300" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl font-bold text-primary group-hover:text-accent transition-colors mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-1">
                  {service.description}
                </p>
                <p className="text-primary font-medium text-sm">
                  {service.benefit}
                </p>
              </div>
              
              <div className="flex-shrink-0 hidden md:block">
                <div className="w-12 h-12 rounded-full border-2 border-accent/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-background rounded-xl">
              <div className="text-2xl md:text-3xl font-bold text-accent mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
