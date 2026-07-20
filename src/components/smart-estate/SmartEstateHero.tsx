import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import heroVideo from "@/assets/hero-cable-management.mp4.asset.json";
import heroPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";
import PartnerFormDialog from "./PartnerFormDialog";
import { useTranslation } from "react-i18next";

const HERO_VIDEO = heroVideo.url;
const HERO_POSTER = heroPoster.url;

const SmartEstateHero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[92vh] flex flex-col bg-background overflow-hidden">
      {/* Architectural moving still */}
      <div className="absolute inset-0">
        <video
          src={HERO_VIDEO}
          poster={towers}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-emerald-glow)' }} />
      </div>

      {/* Top meta strip */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-foreground/70">
          <span>{t("hero.topMetaLeft")}</span>
          <span className="hidden md:inline">{t("hero.topMetaRight")}</span>
        </div>
      </div>

      {/* Main editorial block */}
      <div className="relative z-10 flex-1 flex items-end pb-16 md:pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-5xl">
            <div className="animate-fade-in">
              <p className="overline mb-6">{t("hero.overline")}</p>
              <h1 className="font-display font-light text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.02em] text-foreground leading-[1.02]">
                {t("hero.headlineL1")}
                <br />
                <span className="italic font-extralight text-accent">{t("hero.headlineL2a")}</span> {t("hero.headlineL2b")}
                <br />
                {t("hero.headlineL3")}
              </h1>
            </div>

            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
              <div className="max-w-xl bg-background/40 backdrop-blur-md border border-foreground/10 rounded-lg px-6 py-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] animate-fade-in">
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  {t("hero.body")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <PartnerFormDialog
                  trigger={
                    <Button className="cta-primary text-sm">
                      {t("hero.ctaPartner")} <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button asChild variant="ghost" className="cta-secondary text-sm">
                  <a href="#capabilities">{t("hero.ctaExplore")}</a>
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
              { k: "EMEA", v: t("hero.stats.regionLabel") },
              { k: "50+", v: t("hero.stats.sitesLabel") },
              { k: "1,000+", v: t("hero.stats.camerasLabel") },
              { k: "24/7", v: t("hero.stats.commandLabel") },
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
