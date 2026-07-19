import { Link } from "react-router-dom";
import { ArrowUpRight, Cpu, ShieldCheck, Wifi, Router, Apple, Zap } from "lucide-react";

/**
 * AdvancedTechBento — modern bento grid showcasing the new brand rollout.
 * Monochrome + emerald accent, Space Grotesk display. Distinctive tech aesthetic.
 */
const AdvancedTechBento = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="container relative z-10">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            New rollout · 2026
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-foreground">
            Advanced technology,
            <br />
            <span className="italic font-light text-muted-foreground">newly stocked.</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
            Next-generation compute, cloud-managed networking and enterprise
            perimeter security — from the brands defining what modern
            infrastructure looks like.
          </p>
        </div>

        {/* Bento grid: 6-col, mixed sizes */}
        <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5">
          {/* Apple — hero tile, inverted dark */}
          <Link
            to="/shop?category=Computers"
            className="group relative md:col-span-4 md:row-span-2 rounded-2xl overflow-hidden bg-foreground text-background p-8 md:p-10 flex flex-col justify-between transition-all hover:shadow-strong"
          >
            <div className="flex items-center justify-between">
              <Apple className="h-7 w-7 opacity-90" />
              <ArrowUpRight className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] opacity-60 mb-3">
                Apple silicon · M4
              </div>
              <h3 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
                Mac mini M4 &<br />MacBook Air M4
              </h3>
              <p className="mt-4 text-sm md:text-base opacity-70 max-w-md">
                Studio-grade compute for design studios, boardrooms and
                developer benches. Whisper-quiet, wall-mountable, built for the
                next decade of work.
              </p>
            </div>
          </Link>

          {/* Ubiquiti UniFi */}
          <Link
            to="/shop?category=Networking"
            className="group relative md:col-span-2 rounded-2xl overflow-hidden bg-card border border-border p-6 flex flex-col justify-between transition-all hover:border-accent/60 hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <Router className="h-6 w-6 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
                Ubiquiti · UniFi
              </div>
              <h3 className="font-display text-xl md:text-2xl leading-tight tracking-tight text-foreground">
                Cloud Gateways, Dream Machines & PoE switching
              </h3>
            </div>
          </Link>

          {/* Reyee */}
          <Link
            to="/shop?category=Wi-Fi"
            className="group relative md:col-span-2 rounded-2xl overflow-hidden bg-card border border-border p-6 flex flex-col justify-between transition-all hover:border-accent/60 hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <Wifi className="h-6 w-6 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
                Reyee · Ruijie
              </div>
              <h3 className="font-display text-xl md:text-2xl leading-tight tracking-tight text-foreground">
                Cloud-managed Wi-Fi 6 & Wi-Fi 7
              </h3>
            </div>
          </Link>

          {/* Sophos / Fortinet — wider */}
          <Link
            to="/security-surveillance"
            className="group relative md:col-span-3 rounded-2xl overflow-hidden bg-secondary border border-border p-6 md:p-7 flex flex-col justify-between transition-all hover:border-accent/60 hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
                Sophos · Fortinet
              </div>
              <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-tight text-foreground">
                Enterprise firewalls & zero-trust perimeter
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                XGS, XDR and FortiGate deployed, licensed and monitored by our
                SOC-ready team.
              </p>
            </div>
          </Link>

          {/* Metric tile */}
          <div className="relative md:col-span-3 rounded-2xl overflow-hidden bg-card border border-border p-6 md:p-7 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Zap className="h-6 w-6 text-accent" />
              <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Live catalogue
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="font-display text-3xl md:text-4xl tracking-tight text-foreground">120+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">SKUs live</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl tracking-tight text-foreground">18</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Vendor lines</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl tracking-tight text-foreground">24h</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Quote SLA</div>
              </div>
            </div>
            <Link
              to="/shop"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Browse the shop <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Compute strip */}
          <div className="relative md:col-span-6 rounded-2xl overflow-hidden border border-border bg-gradient-to-r from-card via-secondary to-card p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-foreground text-background flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Deploy-ready stacks
                </div>
                <div className="font-display text-lg md:text-xl text-foreground tracking-tight">
                  Cloud gateway + Wi-Fi 7 + firewall — quoted in one turnkey bundle.
                </div>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors self-start md:self-auto"
            >
              Request a stack <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedTechBento;