import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Globe, Server } from "lucide-react";
import { Link } from "react-router-dom";

const websitePackages = [
  {
    name: "Starter",
    price: "R199",
    period: "/mo",
    description: "Perfect for small businesses getting online",
    features: [
      "Single-page website",
      "Mobile-friendly design",
      "SEO basics",
      "Contact form",
      "Free domain setup",
    ],
    popular: false,
  },
  {
    name: "Business",
    price: "R399",
    period: "/mo",
    description: "For growing businesses that need more",
    features: [
      "Multi-page website (up to 5)",
      "Contact forms & maps",
      "Office 365 email setup",
      "Social media integration",
      "Monthly analytics report",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "R599",
    period: "/mo",
    description: "Full-featured with security & e-commerce",
    features: [
      "E-commerce ready",
      "Office 365 included",
      "ESET endpoint security",
      "Priority support",
      "Custom integrations",
    ],
    popular: false,
  },
  {
    name: "Enterprise",
    price: "R999",
    period: "/mo",
    description: "Custom-built for large organisations",
    features: [
      "Fully custom build",
      "Office 365 suite",
      "ESET endpoint protection",
      "Advanced analytics",
      "Dedicated support manager",
    ],
    popular: false,
  },
];

const itPackages = [
  {
    name: "Basic",
    users: "Up to 15 users",
    price: "R5,000",
    period: "/mo",
    features: ["Remote assistance", "Server management", "24/7 monitoring", "Email support"],
  },
  {
    name: "Standard",
    users: "15–25 users",
    price: "R12,000",
    period: "/mo",
    features: ["Everything in Basic", "On-site visits (2x/mo)", "Network management", "Priority response"],
  },
  {
    name: "Premium",
    users: "25–50 users",
    price: "R18,000",
    period: "/mo",
    features: ["Everything in Standard", "Dedicated engineer", "Cybersecurity audits", "Hardware procurement"],
  },
  {
    name: "Enterprise",
    users: "50+ users",
    price: "R28,000",
    period: "/mo",
    features: ["Everything in Premium", "24/7 on-call support", "Full infrastructure management", "Custom SLA"],
  },
];

const PackagePricing = () => {
  return (
    <section id="packages" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Website Packages */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Website Development
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Get Your Business Online
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional websites with hosting, domain, and ongoing support — all included in one monthly fee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {websitePackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? "bg-primary text-primary-foreground border-2 border-accent shadow-lg scale-[1.02]"
                    : "bg-card border border-border"
                }`}
                style={{ boxShadow: pkg.popular ? "var(--shadow-strong)" : "var(--shadow-soft)" }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-1 ${pkg.popular ? "text-white" : "text-foreground"}`}>
                  {pkg.name}
                </h3>
                <p className={`text-xs mb-4 ${pkg.popular ? "text-white/70" : "text-muted-foreground"}`}>
                  {pkg.description}
                </p>
                <div className="mb-5">
                  <span className={`text-3xl font-bold ${pkg.popular ? "text-accent" : "text-primary"}`}>
                    {pkg.price}
                  </span>
                  <span className={`text-sm ${pkg.popular ? "text-white/60" : "text-muted-foreground"}`}>
                    {pkg.period}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${pkg.popular ? "text-accent" : "text-accent"}`} />
                      <span className={pkg.popular ? "text-white/90" : "text-muted-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full group ${
                    pkg.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Link to="/website-order">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* IT Support Packages */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Server className="w-4 h-4" />
              Managed IT Support
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              IT Support Packages
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Predictable monthly IT costs with enterprise-grade support — no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {itPackages.map((pkg, i) => (
              <div
                key={pkg.name}
                className={`rounded-2xl p-6 bg-card border border-border transition-all duration-300 hover:-translate-y-1 ${
                  i === 2 ? "border-accent/40 ring-1 ring-accent/20" : ""
                }`}
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <h3 className="text-lg font-bold text-foreground mb-1">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{pkg.users}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                  <span className="text-sm text-muted-foreground">{pkg.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full group">
                  <Link to="/contact#quote-form">
                    Request Quote
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            All prices subject to final quote based on specific requirements. VAT exclusive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PackagePricing;
