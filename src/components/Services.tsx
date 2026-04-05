import { Button } from "@/components/ui/button";
import { Wifi, Shield, Cloud, MessageSquare, ArrowRight, Wrench, Headphones, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: Wifi,
      title: "Infrastructure & Networking",
      tags: ["Data Cabling", "Switches", "Wi-Fi", "Trunking"],
      benefit: "Future-proof your business network with scalable, enterprise-grade infrastructure designed for performance and growth.",
      link: "/services/infrastructure-and-networking",
    },
    {
      icon: Shield,
      title: "Security & Surveillance",
      tags: ["CCTV", "Access Control", "Electric Fencing", "Alarms"],
      benefit: "Protect your people and assets with intelligent, integrated security systems monitored around the clock.",
      link: "/services/security-and-surveillance",
    },
    {
      icon: Cloud,
      title: "Cloud & Edge Solutions",
      tags: ["Server Setup", "Migration", "Backup & Recovery"],
      benefit: "Scale your operations with reliable cloud infrastructure and disaster recovery you can count on.",
      link: "/services/cloud-and-edge-solutions",
    },
    {
      icon: MessageSquare,
      title: "Smart Collaboration Tools",
      tags: ["VoIP", "Microsoft 365", "Email Systems", "Remote Work"],
      benefit: "Enable seamless communication across every office, branch, and remote team member.",
      link: "/services/smart-collaboration-tools",
    },
    {
      icon: Wrench,
      title: "National Field Support",
      tags: ["Smart Hands", "Rollouts", "Swaps", "Break/Fix"],
      benefit: "Dispatch certified field engineers across South Africa and Africa for on-site installations, maintenance, and emergency support.",
      link: "/services/national-field-support/cutovers-and-sim-replacements",
    },
    {
      icon: Headphones,
      title: "Field Support Services",
      tags: ["Remote IT", "Cabling Engineers", "Technician Network"],
      benefit: "Access our continent-wide network of skilled infrastructure technicians and dedicated support teams across Africa.",
      link: "/services/field-support-services",
    },
    {
      icon: Monitor,
      title: "Remote IT Support",
      tags: ["Outsourced Helpdesk", "Server Monitoring", "Microsoft 365", "24/7"],
      benefit: "Outsource your IT helpdesk to Siyakha — remote desktop support, server monitoring, and cybersecurity management from anywhere in South Africa.",
      link: "/services/remote-it-support",
    },
  ];

  return (
    <section id="services" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="accent-line mb-4"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            IT Services We Deliver Across Johannesburg
          </h2>
          <p className="text-lg text-muted-foreground">
            End-to-end ICT services for businesses in the Northern Suburbs and greater Johannesburg — from infrastructure builds to ongoing managed support, backed by dedicated field engineers.
          </p>
        </div>

        {/* Services Grid — 2-column staggered */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.link}
              className="group relative flex gap-5 p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:-translate-y-1 hover:border-accent/30"
              style={{ boxShadow: 'var(--shadow-soft)' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-soft)')}
            >
              {/* Icon */}
              <div className="shrink-0">
                <div className="icon-badge">
                  <service.icon className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {service.benefit}
                </p>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {service.tags.map((tag) => (
                    <span key={tag} className="feature-tag text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all duration-300">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Stats Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "Same Day", label: "Site Visits" },
            { value: "24/7", label: "Monitoring" },
            { value: "100%", label: "Uptime SLA" },
            { value: "Free", label: "Consultations" },
          ].map((stat) => (
            <div key={stat.label} className="stats-card">
              <div className="text-2xl font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
