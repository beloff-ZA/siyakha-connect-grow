import { ClipboardCheck, Settings, Headphones } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Assess & Plan",
    description: "We evaluate your current setup, identify gaps, and design a tailored solution that fits your needs and budget.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Implement & Secure",
    description: "Our certified technicians deploy your solution with minimal disruption, ensuring everything is configured and secured properly.",
  },
  {
    number: "03",
    icon: Headphones,
    title: "Support & Optimize",
    description: "Ongoing monitoring, proactive maintenance, and responsive support keep your systems running at peak performance.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Our Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, proven approach to solving your technology challenges
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
                )}
                
                <div className="relative bg-background rounded-2xl p-8 border border-border hover:border-accent/50 transition-all group">
                  {/* Step number */}
                  <span className="absolute -top-4 left-8 bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {step.number}
                  </span>
                  
                  <div className="pt-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
