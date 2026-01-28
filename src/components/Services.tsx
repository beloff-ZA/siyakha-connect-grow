import { Monitor, Wifi, Shield, Cloud, Phone, Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Monitor,
    title: "IT Support / Managed Services",
    description: "24/7 helpdesk, proactive monitoring, and complete IT management to reduce downtime and boost productivity.",
    link: "/services/infrastructure-and-networking",
    benefit: "Reduce downtime by 90%"
  },
  {
    icon: Wifi,
    title: "Networking & Wi-Fi",
    description: "Enterprise-grade network design, installation, and optimization for seamless connectivity across your premises.",
    link: "/services/infrastructure-and-networking",
    benefit: "Improve coverage everywhere"
  },
  {
    icon: Shield,
    title: "CCTV, Security & Access Control",
    description: "HD surveillance systems, access management, and remote monitoring to secure your premises and assets.",
    link: "/services/security-and-surveillance",
    benefit: "Protect what matters most"
  },
  {
    icon: Cloud,
    title: "Cloud, Backup & Microsoft 365",
    description: "Secure cloud migration, automated backups, and Microsoft 365 deployment for modern workplace productivity.",
    link: "/services/cloud-and-edge-solutions",
    benefit: "Never lose critical data"
  },
  {
    icon: Phone,
    title: "VoIP & Connectivity",
    description: "Crystal-clear VoIP phone systems and reliable internet connectivity solutions for unified communications.",
    link: "/services/smart-collaboration-tools",
    benefit: "Cut phone costs by 50%"
  },
  {
    icon: Wrench,
    title: "Field Support / Smart Hands",
    description: "Nationwide on-site technical support with skilled technicians ready to deploy wherever you need them.",
    link: "/services/national-field-support",
    benefit: "Fast on-site response"
  },
];

const Services = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Complete IT Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From network infrastructure to security systems, we deliver end-to-end technology solutions tailored to your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={index}
                to={service.link}
                className="group bg-background border border-border rounded-2xl p-6 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                        {service.benefit}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
