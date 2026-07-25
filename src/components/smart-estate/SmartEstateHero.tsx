import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import heroVideo from "@/assets/hero-cable-management.mp4.asset.json";
import heroPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";

const HERO_VIDEO = heroVideo.url;
const HERO_POSTER = heroPoster.url;

const SmartEstateHero = () => {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section className="relative min-h-[92vh] flex flex-col bg-background overflow-hidden">
      {/* Cable management hero video */}
      <div className="absolute inset-0">
        <video
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.55]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-emerald-glow)' }} />
      </div>

      {/* Top meta strip */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-foreground/70">
          <span>Siyakha Interlink · EMEA</span>
          <span className="hidden md:inline">Security · Connectivity · Operations</span>
        </div>
      </div>

      {/* Main editorial block */}
      <div className="relative z-10 flex-1 flex items-end pb-20 md:pb-28">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-5xl">
            <div className="animate-fade-in">
              <p className="overline mb-6">One partner. Estates · Commercial · Schools</p>
              <h1 className="font-display font-light text-4xl md:text-6xl lg:text-[4.5rem] tracking-[-0.02em] text-foreground leading-[1.04]">
                The single technology partner for
                <span className="italic font-extralight text-accent"> security, connectivity</span> and
                <span className="italic font-extralight text-accent"> operations</span>
                <br />
                — across estates, commercial sites, and schools.
              </h1>
            </div>

            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
              <div className="max-w-xl bg-background/40 backdrop-blur-md border border-foreground/10 rounded-lg px-6 py-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] animate-fade-in">
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  We design, build and operate the technology backbone underneath the site — so you stop
                  juggling five vendors and start holding one partner accountable.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="cta-primary text-sm">
                  <a href="#qualify" onClick={scrollTo("qualify")}>
                    Talk to us about your project <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" className="cta-secondary text-sm">
                  <a href="#case-studies" onClick={scrollTo("case-studies")}>
                    See our work
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartEstateHero;
