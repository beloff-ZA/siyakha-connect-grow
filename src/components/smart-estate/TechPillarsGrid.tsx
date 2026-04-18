const pillars = [
  {
    no: "01",
    label: "Build Technology",
    title: "Construction-grade infrastructure.",
    body: "Structured cabling, fibre backbones, racks, power and pathways — engineered into the build from day one, not retrofitted.",
  },
  {
    no: "02",
    label: "Building Maintenance Technology",
    title: "Lifecycle servicing, instrumented.",
    body: "Asset registers, sensor-driven maintenance schedules and digital handover packs that keep the building performing for decades.",
  },
  {
    no: "03",
    label: "AI Solutions — Checking & Monitoring",
    title: "Eyes on every system, always.",
    body: "Computer-vision surveillance, anomaly detection and 24/7 health checks across access, network and building systems.",
  },
  {
    no: "04",
    label: "Efficiency Tech",
    title: "Energy & operations, optimised.",
    body: "Sub-metering, occupancy analytics and automation that drive down running costs while lifting tenant experience.",
  },
];

const TechPillarsGrid = () => {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="overline mb-5">The Four Layers</p>
          <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground">
            Build. Maintain. <span className="italic font-extralight text-accent">Monitor.</span> Optimise.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl">
            Four interlinked technology layers — delivered as one integrated programme so every developer, operator and tenant gets a building that performs from handover onward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 border-t border-l border-border">
          {pillars.map((p) => (
            <article
              key={p.no}
              className="border-r border-b border-border p-8 md:p-10 lg:p-12 group hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-display text-4xl md:text-5xl font-extralight italic text-foreground/30 group-hover:text-accent transition-colors">
                  {p.no}
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {p.label}
                </span>
              </div>
              <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-light leading-tight tracking-[-0.01em] text-foreground mb-4">
                {p.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechPillarsGrid;
