import museum from "@/assets/smart-estate-museum.jpg";
import { Activity, Eye } from "lucide-react";

const tiles = [
  { icon: Eye, k: "Cameras installed", v: "1,000+" },
  { icon: Activity, k: "Sites monitored", v: "50+" },
];

const CommandCentreSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-foreground text-background overflow-hidden">
      {/* Architectural backdrop */}
      <img
        src={museum}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/95 via-foreground/90 to-foreground" />

      <div className="relative z-10 container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="overline mb-5 text-accent">The Command Centre</p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em] text-background">
              One pane of glass.
              <br />
              <span className="italic text-accent">A thousand decisions, made.</span>
            </h2>
            <p className="mt-8 text-background/70 leading-relaxed max-w-md">
              Our 24/7 monitoring centre fuses AI surveillance, building telemetry,
              tenant tickets and predictive maintenance into a single live operating picture
              — for portfolio owners who refuse to be surprised.
            </p>

            <ul className="mt-10 space-y-4 text-sm text-background/85">
              {[
                "AI-validated incident response within 90 seconds",
                "Predictive failure alerts on critical infrastructure",
                "Quarterly board-grade portfolio reports",
              ].map((line) => (
                <li key={line} className="flex gap-4 items-start">
                  <span className="mt-2 w-6 h-px bg-accent flex-shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Faux dashboard tiles */}
          <div className="grid grid-cols-2 gap-px bg-background/10 border border-background/15">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.k} className="bg-foreground p-8 lg:p-10">
                  <Icon className="w-5 h-5 text-accent mb-6" strokeWidth={1.5} />
                  <div className="font-display text-4xl lg:text-5xl font-light text-background tracking-tight">
                    {t.v}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-background/55">
                    {t.k}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommandCentreSection;
