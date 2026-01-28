import { Award, Clock, MapPin, Zap } from "lucide-react";

const trustItems = [
  { icon: Award, label: "BEE Level 1", sublabel: "Certified Partner" },
  { icon: Clock, label: "Since 2008", sublabel: "15+ Years Experience" },
  { icon: MapPin, label: "Nationwide", sublabel: "Support Across SA" },
  { icon: Zap, label: "Fast Response", sublabel: "Same-Day Service" },
];

const TrustBar = () => {
  return (
    <section className="bg-primary border-y border-border">
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-primary-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-primary-foreground/70">{item.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
