import { CheckCircle, MapPin, Settings, Phone, Lightbulb } from "lucide-react";

const WhySiyakha = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Level 1 B-BBEE Partner",
      description: "Certified compliance for your procurement needs"
    },
    {
      icon: MapPin,
      title: "100+ Businesses Served Nationwide",
      description: "Trusted by organizations across South Africa"
    },
    {
      icon: Settings,
      title: "Custom IT Solutions for Any Sector",
      description: "Tailored technology solutions for your industry"
    },
    {
      icon: Phone,
      title: "24/7 Support Availability",
      description: "Round-the-clock technical support when you need it"
    },
    {
      icon: Lightbulb,
      title: "Innovative, Scalable, Affordable",
      description: "Future-proof solutions that grow with your business"
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Why Choose Siyakha Technology?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Building trust through expertise, reliability, and results-driven technology solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-accent group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-accent mb-2">2008</div>
              <div className="text-sm text-muted-foreground">Established</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Project Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">48hr</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent mb-2">9/10</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySiyakha;