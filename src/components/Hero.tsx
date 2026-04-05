import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-accent font-medium text-sm mb-8">
              <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
              BEE Level 1 Certified ICT Partner
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white mb-6 leading-[1.15] tracking-tight">
              IT Company in{" "}
              <span className="text-accent">Johannesburg</span>,{" "}
              Northern Suburbs
            </h1>

            <p className="text-lg text-white/75 mb-10 max-w-lg mx-auto leading-relaxed">
              Managed IT support, field engineers, and smart hands trusted by 100+ businesses in Sandton, Randburg, Fourways, Midrand, and across South Africa.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="cta-primary text-base px-8 py-4 h-auto group">
                <Link to="/contact#quote-form">
                  Request a Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-base px-8 py-4 h-auto bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary group">
                <a href="#packages">
                  <Play className="mr-2 h-4 w-4" />
                  View Packages
                </a>
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10 justify-center">
              {[
                { value: "100+", label: "Businesses Served" },
                { value: "24/7", label: "Support Available" },
                { value: "15+", label: "Years Experience" },
                { value: "Level 1", label: "B-BBEE Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-accent">{stat.value}</div>
                  <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl"></div>
    </section>
  );
};

export default Hero;
