import marina from "@/assets/future-100-dubai.png";

const features = [
  { label: "Multi-dwelling Wi-Fi", value: "Wi-Fi 6E mesh, 10 Gbps backbone" },
  { label: "Concierge App", value: "Native iOS / Android, white-labelled" },
  { label: "Access & Visitors", value: "Mobile credentials, ANPR, QR" },
  { label: "Energy Monitoring", value: "Real-time tenant sub-metering" },
  { label: "Surveillance", value: "AI deterrence, cloud-archive, 24/7 NOC" },
  { label: "Predictive Maintenance", value: "ML-driven asset health alerts" },
];

const SmartBuildingShowcase = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Editorial image — magazine style */}
          <div className="lg:col-span-7 relative">
            <div className="relative overflow-hidden bg-secondary">
              <img
                src={marina}
                alt="Future 100 Concept Building, Dubai — architectural sketch with floor plans and elevations"
                className="w-full h-[500px] md:h-[680px] object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-background">
                <span className="text-[11px] uppercase tracking-[0.22em] bg-foreground/80 backdrop-blur px-3 py-1.5">
                  Case Study · Future 100 · Dubai
                </span>
                <span className="font-display text-3xl md:text-5xl font-light italic text-foreground">
                  N°&nbsp;002
                </span>
              </div>
            </div>
          </div>

          {/* Spec ledger */}
          <div className="lg:col-span-5 lg:pt-8">
            <p className="overline mb-5">Inside the Building</p>
            <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground mb-8">
              Every signal, accounted for.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              An anatomy of a Siyakha-engineered estate. Each layer is specified,
              installed and certified — then handed over with documentation a developer can be proud of.
            </p>

            <dl className="border-t border-border">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[40%_60%] gap-6 py-4 border-b border-border"
                >
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground pt-1">
                    {f.label}
                  </dt>
                  <dd className="font-display text-base text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartBuildingShowcase;
