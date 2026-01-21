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
      title: "100+ Businesses Served",
      description: "Trusted by organizations across South Africa"
    },
    {
      icon: Settings,
      title: "Custom IT Solutions",
      description: "Tailored technology solutions for your industry"
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Round-the-clock technical support when you need it"
    },
    {
      icon: Lightbulb,
      title: "Scalable & Affordable",
      description: "Future-proof solutions that grow with your business"
    }
  ];

  const stats = [
    { value: "2008", label: "Established" },
    { value: "100%", label: "Success Rate" },
    { value: "48hr", label: "Response Time" },
    { value: "9/10", label: "Satisfaction" }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <div className="divider-bold mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight leading-[1.1]">
            Why Choose Siyakha?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Building trust through expertise, reliability, and results-driven technology solutions.
          </p>
        </div>

        {/* Features - Numbered List */}
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 mb-24">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start gap-6 group"
            >
              <div className="flex-shrink-0 text-6xl font-bold text-accent/20 leading-none select-none group-hover:text-accent/40 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold text-primary">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-block">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySiyakha;
