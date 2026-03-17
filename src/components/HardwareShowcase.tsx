import hardwareFlatlay from "@/assets/hardware-flatlay.png";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HardwareShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <div className="accent-line mb-4"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Supply. Install. Configure.
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We don't just sell hardware — we deliver complete solutions. Every product comes with professional installation, configuration, and ongoing support from our certified field engineers.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Enterprise networking & Wi-Fi equipment",
                "Security cameras & access control",
                "Laptops, desktops & peripherals",
                "Server & storage solutions",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="cta-primary group">
              <Link to="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-medium)" }}>
            <img
              src={hardwareFlatlay}
              alt="Enterprise IT hardware - laptops, networking, security equipment"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HardwareShowcase;
