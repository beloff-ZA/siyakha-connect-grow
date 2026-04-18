import { Recycle, Truck, PlaneTakeoff, Eye, Radar, Flame } from "lucide-react";

const cities = [
  {
    icon: Recycle,
    title: "Smart Waste Management",
    body: "Sensor-equipped bins and route optimisation that cut collection costs and keep precincts pristine.",
  },
  {
    icon: Truck,
    title: "Fleet Digitalisation",
    body: "Live telemetry, driver behaviour analytics and predictive maintenance for entire municipal and private fleets.",
  },
  {
    icon: PlaneTakeoff,
    title: "Airport Movement Tracking",
    body: "Computer-vision people flow analytics across terminals — dwell time, queue density and passenger journey insight.",
  },
  {
    icon: Eye,
    title: "AI Risk-Detection CCTV",
    body: "Behaviour-aware surveillance that flags weapons, intrusions and crowd anomalies before incidents escalate.",
  },
  {
    icon: Radar,
    title: "Airspace Camera Systems",
    body: "Drone, perimeter and airspace monitoring with AI-driven object recognition for sensitive sites.",
  },
  {
    icon: Flame,
    title: "Heat, Smoke & Fire Detection",
    body: "Thermal imaging and early-warning fire analytics that protect tenants, assets and infrastructure 24/7.",
  },
];

const SmartCitiesSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-foreground/10">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="overline mb-6">Smart · Efficient · Cities</p>
          <h2 className="font-display font-light text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] text-foreground">
            The intelligent
            <span className="italic text-accent"> city layer</span>
            <br />
            we engineer underneath it all.
          </h2>
          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            From waste management and fleet digitalisation to airport movement analytics and
            AI-powered risk detection — Siyakha Interlink delivers the connective intelligence
            that makes cities run cleaner, safer and more efficiently.
          </p>
        </div>

        <div className="hairline mt-14" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 mt-px">
          {cities.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-background p-8 md:p-10 group hover:bg-foreground/[0.03] transition-colors">
                <Icon className="h-7 w-7 text-accent mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight mb-3">
                  {c.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {c.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Municipalities</span>
          <span className="opacity-30">·</span>
          <span>Airports & Transit</span>
          <span className="opacity-30">·</span>
          <span>Critical Infrastructure</span>
          <span className="opacity-30">·</span>
          <span>Mixed-Use Precincts</span>
        </div>
      </div>
    </section>
  );
};

export default SmartCitiesSection;
