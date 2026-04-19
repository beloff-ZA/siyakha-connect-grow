import networkVideo from "@/assets/network-points-install.mp4.asset.json";

const cableStandards = [
  { brand: "Molex", spec: "CAT6A / CAT7 STP", note: "Shielded enterprise" },
  { brand: "CommScope", spec: "SYSTIMAX CAT6A", note: "Data centre grade" },
  { brand: "Cattex", spec: "CAT6 / CAT7 SFTP", note: "South African build" },
  { brand: "Panduit", spec: "Patch panels & racks", note: "24/48-port modular" },
];

const stats = [
  { value: "10", unit: "Gbps", label: "Sustained throughput on CAT6A runs" },
  { value: "100", unit: "m", label: "Certified channel length per drop" },
  { value: "25", unit: "yr", label: "Manufacturer warranty on installs" },
];

const CablingInfrastructureBanner = () => {
  return (
    <section className="relative bg-background border-t border-border overflow-hidden">
      {/* Video showcase */}
      <div className="relative w-full aspect-[21/9] md:aspect-[21/8] bg-foreground overflow-hidden border-b border-border">
        <video
          src={networkVideo.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 lg:px-10 pb-10 md:pb-14">
            <p className="text-[10px] uppercase tracking-[0.28em] text-background/70 mb-3">
              Live build · Patch panel dressing · Labelled & tested
            </p>
            <h3 className="font-display font-light text-2xl md:text-4xl lg:text-5xl text-background tracking-[-0.02em] leading-[1.05] max-w-3xl">
              Perfect <span className="italic font-extralight">network point</span> installs.
            </h3>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Headline + manifesto */}
          <div className="lg:col-span-7">
            <p className="overline mb-5">Infrastructure · Data Points · Fibre Builds</p>
            <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] text-foreground">
              Bespoke <span className="italic font-extralight text-accent">cable runs</span>,
              <br className="hidden md:block" />
              engineered to a patch panel.
            </h2>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Our crews build complete network infrastructure from the ground up — structured CAT6A
              and CAT7 cabling, fibre backbones, containment trays and dressed patch panels. Every
              run labelled, tested and certified to international standards before sign-off.
            </p>

            <div className="mt-12 grid sm:grid-cols-3 gap-px bg-border border border-border max-w-2xl">
              {stats.map((s) => (
                <div key={s.label} className="bg-background p-6">
                  <div className="font-display text-3xl md:text-4xl font-light text-foreground tracking-tight">
                    {s.value}
                    <span className="text-base text-muted-foreground ml-1">{s.unit}</span>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground leading-relaxed">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Permanent link tested · Fluke certified · As-built documentation
            </p>
          </div>

          {/* Right: Standards we install */}
          <div className="lg:col-span-5">
            <div className="border border-border">
              <div className="border-b border-border px-6 py-4 bg-muted/20">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Cable standards we install
                </p>
              </div>
              <ul className="divide-y divide-border">
                {cableStandards.map((c) => (
                  <li key={c.brand} className="flex items-baseline justify-between gap-6 px-6 py-5">
                    <div>
                      <div className="font-display text-xl md:text-2xl font-light text-foreground tracking-tight">
                        {c.brand}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {c.note}
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-foreground/70 text-right shrink-0">
                      {c.spec}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-6 py-5 bg-muted/10">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Top-tier copper and fibre brands — paired with neat dressing, labelled patch
                  panels and tested terminations on every site we hand over.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CablingInfrastructureBanner;
