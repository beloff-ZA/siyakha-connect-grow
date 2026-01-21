import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-accent rounded-full mr-3" />
            BEE Level 1 Certified ICT Partner
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Smart Technology.
            <br />
            <span className="text-accent">Local Expertise.</span>
            <br />
            Real Impact.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            End-to-end technology infrastructure, networking, security, and support across South Africa.
          </p>

          {/* Single CTA */}
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground text-lg px-10 py-6 h-auto font-semibold group">
              <Link to="/contact#quote-form">
                Request a Consultation
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats - Floating Card */}
        <div className="absolute bottom-12 right-6 lg:right-12 hidden lg:block animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">100+</div>
                <div className="text-white/60 text-sm">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">15+</div>
                <div className="text-white/60 text-sm">Years</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-1">24/7</div>
                <div className="text-white/60 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-1">L1</div>
                <div className="text-white/60 text-sm">B-BBEE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
    </section>
  );
};

export default Hero;
