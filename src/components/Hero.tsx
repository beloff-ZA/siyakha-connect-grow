import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Modern technology infrastructure" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-85"></div>
        <div className="absolute inset-0 tech-grid opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
        <div className="max-w-4xl mx-auto fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-sm mb-6">
            <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
            BEE Level 1 Certified ICT Partner
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Smart Technology.{" "}
            <span className="text-accent">Local Expertise.</span>{" "}
            Real Impact.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your BEE Level 1 ICT Partner for end-to-end technology infrastructure, 
            networking, security, and support across South Africa.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="cta-primary text-lg px-8 py-4 group">
              Request a Consultation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button className="cta-secondary text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group">
              <Play className="mr-2 h-5 w-5" />
              Explore Our Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">100+</div>
              <div className="text-white/80 text-sm">Businesses Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-white/80 text-sm">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">15+</div>
              <div className="text-white/80 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">Level 1</div>
              <div className="text-white/80 text-sm">B-BBEE Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-accent/20 float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 rounded-full bg-white/10 float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-accent/30 float" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;