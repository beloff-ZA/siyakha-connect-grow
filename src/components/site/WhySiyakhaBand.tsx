import { Layers, ShieldCheck, Wrench, Radio } from "lucide-react";

const PILLARS = [
  { icon: Layers, title: "One accountable partner", body: "Security, connectivity and operations under a single scope of work — no vendor triangulation when something breaks." },
  { icon: Wrench, title: "Engineered, not stitched", body: "Cameras, radar, fibre, WiFi and command centre designed as one system from day one — not integrated after handover." },
  { icon: Radio, title: "Verified, then dispatched", body: "Our command centre verifies alarms before response — the difference between an incident recorded and an incident intercepted." },
  { icon: ShieldCheck, title: "Built for the buyer", body: "Estates, commercial, schools and government each get infrastructure tuned to their procurement, budget and risk profile." },
];

const WhySiyakhaBand = () => (
  <section className="bg-background border-t border-foreground/10">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Why Siyakha
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Why businesses choose <span className="italic font-extralight">Siyakha</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/15 border border-foreground/15">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-background p-6 md:p-8">
            <Icon className="w-7 h-7 text-foreground mb-5" strokeWidth={1.25} />
            <div className="font-display text-lg text-foreground mb-2 tracking-tight">{title}</div>
            <p className="text-[13px] text-foreground/70 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhySiyakhaBand;