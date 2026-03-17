import { Link } from "react-router-dom";
import { Cable, Wifi, Camera, Globe, Monitor, Users, UserCheck } from "lucide-react";

const needs = [
  {
    icon: Cable,
    label: "Network Points",
    description: "From R1,475 per point — structured cabling for offices, schools & warehouses.",
    link: "/services/infrastructure-and-networking",
  },
  {
    icon: Wifi,
    label: "Wi-Fi Upgrade",
    description: "Enterprise-grade Wi-Fi 6/7 for seamless coverage across your entire premises.",
    link: "/services/infrastructure-and-networking",
  },
  {
    icon: Camera,
    label: "CCTV & Security",
    description: "4MP active-deterrence cameras, access control, electric fencing & alarms.",
    link: "/services/security-and-surveillance",
  },
  {
    icon: Globe,
    label: "New Website",
    description: "Professional, mobile-responsive websites with hosting — from R199/mo.",
    link: "/website-order",
  },
  {
    icon: Monitor,
    label: "Hardware",
    description: "Laptops, switches, access points, servers & peripherals — sourced & delivered.",
    link: "/products",
  },
  {
    icon: Users,
    label: "Project Team",
    description: "Skilled engineers for rollouts, migrations, and on-site technical projects.",
    link: "/services/field-support-services",
  },
  {
    icon: UserCheck,
    label: "Dedicated On-Site Support",
    description: "A dedicated technician stationed at your office for ongoing hands-on support.",
    link: "/support-deals",
  },
];

const QuickNeeds = () => (
  <section className="py-14 md:py-20 border-b border-border">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">
          What Do You Need?
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Tell us what you're looking for — we'll handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
        {needs.map((n) => (
          <Link
            key={n.label}
            to={n.link}
            className="group flex flex-col items-center text-center rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3 group-hover:bg-accent/20 transition-colors">
              <n.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
              {n.label}
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm leading-snug">
              {n.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default QuickNeeds;
