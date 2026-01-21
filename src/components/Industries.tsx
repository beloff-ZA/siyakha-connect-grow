import { Building2, GraduationCap, Factory, Car, Stethoscope, ShoppingBag, Home, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const industries = [
  { title: "SMMEs", icon: Building2 },
  { title: "Education", icon: GraduationCap },
  { title: "Manufacturing", icon: Factory },
  { title: "Automotive", icon: Car },
  { title: "Healthcare", icon: Stethoscope },
  { title: "Retail", icon: ShoppingBag },
  { title: "Property", icon: Home },
  { title: "Fleet & Logistics", icon: Truck }
];

const Industries = () => {
  return (
    <section id="industries" className="py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="divider-bold mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight leading-[1.1]">
            Industries We Serve
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From small start-ups to established enterprises, our services meet the unique needs of every organization.
          </p>
        </div>

        {/* Industry Pills */}
        <div className="flex flex-wrap gap-4 mb-16">
          {industries.map(({ title, icon: Icon }) => (
            <div 
              key={title}
              className="flex items-center gap-3 px-6 py-4 bg-background rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 cursor-default group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors">
                <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-primary">{title}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold group">
            <Link to="/contact">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
            <a href="tel:+27877027411" className="hover:text-accent transition-colors font-medium">
              087 702 7411
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="mailto:accounts@siyakhatechnology.co.za" className="hover:text-accent transition-colors">
              accounts@siyakhatechnology.co.za
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Industries;
