import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LeadMagnet = () => {
  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-accent/20 text-accent font-semibold text-sm rounded-full mb-8">
            <Calendar className="w-4 h-4 mr-2" />
            Free Consultation Available
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            Need an ICT Partner
            <br />
            You Can Trust?
          </h2>

          {/* Subtext */}
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            We offer free consultations for businesses ready to level up their tech. 
            Let's discuss your challenges and explore solutions together.
          </p>

          {/* CTA */}
          <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground text-lg px-12 py-7 h-auto font-semibold group">
            <Link to="/contact#quote-form">
              Book My Free Consultation
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* Trust line */}
          <p className="text-white/50 text-sm mt-8">
            No spam, no sales pressure. Just expert advice tailored to your business.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
