import { ArrowRight, Headphones, Wrench, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: Wrench,
    title: "L2 Field Engineers",
    body: "Hands-on execution at site — installs, swaps, troubleshooting, commissioning and project rollout support across Southern Africa.",
  },
  {
    icon: Headphones,
    title: "L3 Dedicated Support",
    body: "Senior engineers running advanced diagnostics, escalations, design validation and architecture-level remediation for mission-critical environments.",
  },
  {
    icon: ShieldCheck,
    title: "Project & Programme Cover",
    body: "Embedded engineering capacity for OEMs, MSPs and integrators — so your projects never stall waiting for skills on the ground.",
  },
];

const EngineerSupportBanner = () => {
  return (
    <section className="relative bg-foreground text-background border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-14">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              Engineering Capacity · Southern Africa
            </p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-[-0.02em]">
              We provide
              <span className="italic font-extralight"> L2 &amp; L3 engineers </span>
              for field and dedicated support
              <br className="hidden md:block" />
              <span className="text-background/70"> across Southern Africa.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base md:text-lg text-background/75 leading-relaxed font-light">
              From single-site smart-hands to full project teams — Siyakha is the
              execution partner global vendors, MSPs and integrators rely on for
              <span className="text-background"> certified L2 field engineers</span> and
              <span className="text-background"> L3 dedicated support engineers</span>{" "}
              on the ground in South Africa and the broader SADC region.
            </p>
            <a
              href="mailto:nikita@siyakhatechnology.co.za?subject=L2%20%26%20L3%20Engineer%20Support%20Enquiry"
              className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-background hover:text-background/70 transition-colors border-b border-background/40 hover:border-background/20 pb-1"
            >
              Request Engineering Support
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-background/10 border border-background/10">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-foreground p-8 md:p-10 hover:bg-background/[0.04] transition-colors"
              >
                <Icon className="h-7 w-7 text-background mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-background tracking-tight mb-3">
                  {p.title}
                </h3>
                <p className="text-sm md:text-base text-background/70 leading-relaxed">
                  {p.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.22em] text-background/60">
          <span>South Africa</span>
          <span className="opacity-30">·</span>
          <span>Namibia</span>
          <span className="opacity-30">·</span>
          <span>Botswana</span>
          <span className="opacity-30">·</span>
          <span>Zimbabwe</span>
          <span className="opacity-30">·</span>
          <span>Mozambique</span>
          <span className="opacity-30">·</span>
          <span>Eswatini · Lesotho</span>
        </div>
      </div>
    </section>
  );
};

export default EngineerSupportBanner;