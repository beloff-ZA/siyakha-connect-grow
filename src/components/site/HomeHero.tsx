import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import heroVideo from "@/assets/hero-cable-management.mp4.asset.json";
import heroPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";
import { enquiryHref } from "@/lib/leadForm";
import { BRAND } from "@/lib/brand";

const HERO_VIDEO = heroVideo.url;
const HERO_POSTER = heroPoster.url;

/**
 * Master-brand homepage hero. Positioning is business-technology first —
 * specialist security/border capability lives on its own pages.
 */
const HomeHero = () => (
  <section className="relative flex flex-col bg-background overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/25 to-background" />
    </div>

    <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-10">
      <div className="flex items-center justify-between gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground/70">
        <span>Johannesburg · Durban · Business Technology</span>
        <span className="hidden md:inline">{BRAND.name}</span>
      </div>
    </div>

    <div className="relative z-10 flex-1 flex items-center py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-6">
            Managed IT · Projects · Security · Digital · AI
          </p>
          <h1 className="font-display font-light text-[2rem] sm:text-4xl md:text-6xl lg:text-[4.25rem] tracking-[-0.02em] text-foreground leading-[1.06]">
            Your technology partner for{" "}
            <span className="italic font-extralight">growing businesses, schools</span> and{" "}
            <span className="italic font-extralight">multi-site properties</span>.
          </h1>

          <div className="mt-8 md:mt-10 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
            <div className="max-w-xl bg-background/45 backdrop-blur-md border border-foreground/10 rounded-lg px-5 py-5 md:px-6">
              <p className="text-base md:text-lg text-foreground leading-relaxed">
                Managed IT, networking, CCTV, websites and AI-powered business solutions — delivered by
                one accountable team across Johannesburg and Durban.
              </p>
              <p className="mt-4 text-[13px] text-foreground/70">{BRAND.ownerReplyLine}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={enquiryHref("Managed IT Services")}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] bg-foreground text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/90 transition-colors"
              >
                Get IT help <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to={enquiryHref("Office Networking & Structured Cabling")}
                className="inline-flex items-center justify-center min-h-[48px] border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.06] transition-colors"
              >
                Request a site assessment
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground border-b border-foreground/25 pb-1"
            >
              See our projects <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeHero;
