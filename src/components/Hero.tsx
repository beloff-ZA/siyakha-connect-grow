import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  onOpenWizard?: () => void;
}

const Hero = ({ onOpenWizard }: HeroProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Accent glow */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-4xl">
          {/* Tagline */}
          <p className="text-accent font-semibold text-sm md:text-base uppercase tracking-wider mb-6 animate-fade-up">
            Smart Technology. Local Expertise. Real Impact.
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
            Reliable IT, Networking & Security that{" "}
            <span className="text-accent">keeps your business running</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-2xl">
            BEE Level 1 certified partner delivering end-to-end IT solutions with nationwide support across South Africa since 2008.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/contact">
              <Button size="lg" className="cta-primary text-lg px-8 py-6 h-auto">
                <Phone className="w-5 h-5 mr-2" />
                Book Free Consultation
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 h-auto border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={onOpenWizard}
            >
              Find My Solution
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-primary-foreground/20">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">500+</p>
              <p className="text-sm text-primary-foreground/70">Projects Delivered</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">15+</p>
              <p className="text-sm text-primary-foreground/70">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">24/7</p>
              <p className="text-sm text-primary-foreground/70">Support Available</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">L1</p>
              <p className="text-sm text-primary-foreground/70">BEE Certified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
