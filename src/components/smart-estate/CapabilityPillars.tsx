import { Building2, Wifi, ShieldCheck, LayoutDashboard, Sparkles } from "lucide-react";

const pillars = [
  {
    num: "01",
    icon: Building2,
    title: "Smart Building Technology",
    desc: "IoT automation, smart access control and energy optimisation systems engineered into the building from blueprint stage.",
    items: ["IoT automation", "Smart access control", "Energy optimisation"],
  },
  {
    num: "02",
    icon: Wifi,
    title: "Connectivity Infrastructure",
    desc: "Enterprise-grade Wi-Fi for multi-dwelling units, fibre backbone design and managed ISP integrations.",
    items: ["Enterprise Wi-Fi (MDU)", "Fibre backbone", "ISP integration"],
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Security & Surveillance",
    desc: "AI-powered CCTV with active deterrence, integrated command centres and 24/7 remote monitoring.",
    items: ["AI CCTV systems", "Command centres", "Remote monitoring"],
  },
  {
    num: "04",
    icon: LayoutDashboard,
    title: "Digital Experience Platforms",
    desc: "Branded real estate apps, interactive dashboards and Dubai-grade virtual tours for every address.",
    items: ["Real estate apps", "Interactive dashboards", "Virtual tours"],
  },
  {
    num: "05",
    icon: Sparkles,
    title: "AI & Automation",
    desc: "Predictive maintenance and smart analytics that turn buildings into intelligent, self-reporting assets.",
    items: ["Predictive maintenance", "Smart analytics", "Automated reporting"],
  },
];

const CapabilityPillars = () => {
  return (
    <section id="capabilities" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="overline mb-5">The Five Pillars</p>
          <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] text-foreground">
            A complete technology architecture
            <span className="italic text-accent"> — for buildings that earn their address.</span>
          </h2>
          <div className="hairline mt-10" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.num}
                className="group bg-background p-8 lg:p-10 transition-all duration-500 hover:bg-card relative"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="num-marker">— {p.num}</span>
                  <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl md:text-[1.65rem] font-normal leading-tight text-foreground mb-4">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {p.desc}
                </p>
                <ul className="space-y-1.5 border-t border-border pt-5">
                  {p.items.map((item) => (
                    <li key={item} className="text-[13px] text-foreground/80 flex items-center gap-3">
                      <span className="w-3 h-px bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
          {/* Filler tile to keep grid clean on lg */}
          <div className="hidden lg:flex bg-background p-10 items-end">
            <p className="font-display text-xl text-muted-foreground italic leading-snug">
              "Every system, every cable, every signal — designed in concert."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapabilityPillars;
