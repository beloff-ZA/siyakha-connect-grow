import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import towers from "@/assets/smart-estate-towers.jpg";

const SmartEstateHero = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col bg-background overflow-hidden">
      {/* Architectural still / video bed */}
      <div className="absolute inset-0">
        <img
          src={towers}
          alt="Off-plan luxury residential development at golden hour"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-emerald-glow)' }} />
      </div>

      {/* Top meta strip */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-foreground/70">
          <span>Siyakha · Bespoke Estate Technology</span>
          <span className="hidden md:inline">No. 001 — A New Address for Intelligence</span>
        </div>
      </div>

      {/* Main editorial block */}
      <div className="relative z-10 flex-1 flex items-end pb-16 md:pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-5xl fade-in">
            <p className="overline mb-6">Smart Building · Off-Plan · Commercial Estate</p>
            <h1 className="font-display font-light text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-[-0.02em] text-foreground">
              Engineering the
              <br />
              <span className="italic font-extralight text-accent">intelligence</span> inside
              <br />
              tomorrow's addresses.
            </h1>

            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
              <p className="max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed">
                Siyakha is the technology partner for off-plan and commercial real estate.
                From fibre backbones and AI surveillance to tenant experience platforms —
                we design the digital nervous system of refined developments.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="cta-primary text-sm">
                  <Link to="/smart-estates">
                    Partner With Us <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="cta-secondary text-sm">
                  <Link to="#capabilities">Explore Capabilities</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hairline ledger */}
      <div className="relative z-10 border-t border-foreground/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-foreground/10">
            {[
              { k: "BEE Level 1", v: "Certified Partner" },
              { k: "50+", v: "Sites Engineered" },
              { k: "5 Countries", v: "ZA · Angola · Kenya · UK · UAE-ready" },
              { k: "24/7", v: "Command Centre" },
            ].map((s, i) => (
              <div key={s.k} className={`py-6 ${i > 0 ? 'pl-6' : ''} pr-4`}>
                <div className="font-display text-xl md:text-2xl text-foreground">{s.k}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartEstateHero;
