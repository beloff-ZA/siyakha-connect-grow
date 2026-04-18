const steps = [
  {
    num: "I",
    title: "Design-In",
    desc: "We sit with architects and developers from concept stage — sketching the building's digital nervous system before a single brick is laid.",
  },
  {
    num: "II",
    title: "Pre-Wire",
    desc: "Structured cabling, fibre risers, conduit pathways and smart-ready provisioning installed during construction — invisible, future-proof.",
  },
  {
    num: "III",
    title: "Commission",
    desc: "Network, surveillance, access control and tenant platforms brought online. Stress-tested, certified, ready for the ribbon-cut.",
  },
  {
    num: "IV",
    title: "Operate",
    desc: "Ongoing managed services, AI monitoring and quarterly reviews. The building learns, adapts and appreciates in value.",
  },
];

const OffPlanProcess = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/40 border-y border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-24 self-start">
            <p className="overline mb-5">The Off-Plan Method</p>
            <h2 className="font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] text-foreground">
              Embedded from
              <br />
              <span className="italic text-accent">blueprint to handover.</span>
            </h2>
            <p className="mt-6 text-muted-foreground text-base leading-relaxed max-w-md">
              Most technology is bolted on after construction. We design it in.
              The result is a building that performs as intended from day one,
              with a fraction of the retrofit cost.
            </p>
          </div>

          <ol className="space-y-px">
            {steps.map((s, idx) => (
              <li
                key={s.num}
                className="group bg-background border border-border p-8 md:p-10 flex gap-8 hover:border-accent/40 transition-colors duration-500"
              >
                <div className="flex-shrink-0">
                  <div className="font-display text-3xl text-accent font-light tracking-wider">{s.num}</div>
                  {idx < steps.length - 1 && (
                    <div className="mt-4 w-px h-12 bg-border ml-3" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-display text-2xl font-normal text-foreground mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default OffPlanProcess;
