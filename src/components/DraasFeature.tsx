import { Button } from "@/components/ui/button";
import { Shield, Clock, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DraasFeature = () => {
  const features = [
    { icon: Zap, title: "Lightning Fast Recovery" },
    { icon: Shield, title: "Business Continuity" },
    { icon: Clock, title: "Optimal RPO & RTO" },
    { icon: CheckCircle, title: "Flexible Solutions" }
  ];

  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-8">
            <Zap className="w-4 h-4 mr-2" />
            DRaaS Services
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            Disaster Recovery
            <br />
            as a Service
          </h2>

          {/* Description */}
          <p className="text-xl text-white/70 mb-12 max-w-2xl leading-relaxed">
            Recover your business-critical systems in a flash with our flexible DRaaS. 
            We tailor solutions to meet your needs with the best possible RPO and RTO.
          </p>

          {/* Features Row */}
          <div className="flex flex-wrap gap-6 mb-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-medium">{feature.title}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground text-lg px-10 py-6 h-auto font-semibold group">
            <Link to="/contact">
              Get DRaaS Quote
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Accent Line */}
        <div className="w-24 h-1 bg-accent mt-20 mx-auto" />
      </div>
    </section>
  );
};

export default DraasFeature;
