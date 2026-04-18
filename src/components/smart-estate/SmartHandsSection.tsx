import { Wrench, Network, Server, HardHat, Globe2, Clock } from "lucide-react";

const services = [
  {
    icon: Network,
    title: "Network Smart Hands",
    body: "Switch swaps, cabling, patching, AP installs and on-site troubleshooting — dispatched to any South African site within hours.",
  },
  {
    icon: Server,
    title: "Server & Data Centre Hands",
    body: "Rack-and-stack, hardware replacements, firmware, cable management and remote-eyes support for global data centre operators.",
  },
  {
    icon: HardHat,
    title: "Field Engineers & Contractors",
    body: "Vetted engineering crews and contractors mobilised for project rollouts, site surveys, installations and commissioning across SA.",
  },
  {
    icon: Wrench,
    title: "Project Augmentation Teams",
    body: "Scale your delivery team with our certified technicians and project managers — embedded into your programme for the duration.",
  },
  {
    icon: Globe2,
    title: "Global Vendor Partner",
    body: "We act as the local arms-and-legs for international OEMs, MSPs and integrators who need trusted execution on the ground in Africa.",
  },
  {
    icon: Clock,
    title: "On-Demand Dispatch",
    body: "Single point of contact, rapid SLAs and full reporting — request a technician, an engineer or a full crew, anywhere in the country.",
  },
];

const SmartHandsSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-foreground text-background border-t border-background/10 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-16">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              Smart Hands · South Africa
            </p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em]">
              Your engineers
              <span className="italic font-extralight"> on the ground</span>
              <br />
              in South Africa.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base md:text-lg text-background/75 leading-relaxed font-light">
              Global companies, MSPs and OEMs trust Siyakha as their local execution partner.
              From <span className="text-background">network smart hands</span> and
              <span className="text-background"> server room support</span> to full
              <span className="text-background"> contractor crews</span> for project rollouts —
              we provide the people, skills and dispatch infrastructure to deliver anywhere in
              South Africa.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-background/10 border border-background/10">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-foreground p-8 md:p-10 group hover:bg-background/[0.04] transition-colors"
              >
                <Icon className="h-7 w-7 text-background mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-background tracking-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-sm md:text-base text-background/70 leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.22em] text-background/60">
          <span>Johannesburg · Pretoria · Cape Town</span>
          <span className="opacity-30">·</span>
          <span>Durban · Port Elizabeth · Bloemfontein</span>
          <span className="opacity-30">·</span>
          <span>Nationwide Dispatch</span>
        </div>
      </div>
    </section>
  );
};

export default SmartHandsSection;
