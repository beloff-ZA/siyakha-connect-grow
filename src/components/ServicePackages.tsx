import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Essential",
    description: "Perfect for small businesses getting started with managed IT",
    features: [
      "Remote helpdesk support (Mon-Fri)",
      "Basic network monitoring",
      "Microsoft 365 management",
      "Monthly health reports",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    description: "Ideal for growing businesses that need proactive IT management",
    features: [
      "Everything in Essential, plus:",
      "24/7 monitoring & alerts",
      "On-site support (as needed)",
      "Cybersecurity essentials",
      "Quarterly strategy reviews",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    description: "Comprehensive IT partnership for larger organizations",
    features: [
      "Everything in Growth, plus:",
      "Dedicated account manager",
      "Priority response SLA",
      "Advanced security & compliance",
      "Strategic IT consulting",
    ],
    highlighted: false,
  },
];

interface ServicePackagesProps {
  onOpenWizard: () => void;
}

const ServicePackages = ({ onOpenWizard }: ServicePackagesProps) => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Flexible Plans
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Service Packages
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a support level that fits your business. All packages include our commitment to fast, reliable service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-8 border-2 transition-all",
                pkg.highlighted
                  ? "border-accent bg-accent/5 scale-105 shadow-xl"
                  : "border-border hover:border-accent/50"
              )}
            >
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  {pkg.badge}
                </span>
              )}

              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-muted-foreground mb-6">{pkg.description}</p>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onOpenWizard}
                className={cn(
                  "w-full",
                  pkg.highlighted ? "cta-primary" : "cta-secondary"
                )}
              >
                Get a Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Not sure which package is right for you?
          </p>
          <Link to="/contact">
            <Button variant="link" className="text-accent">
              Schedule a free consultation to discuss your needs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicePackages;
