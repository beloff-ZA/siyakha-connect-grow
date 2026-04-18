import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import towers from "@/assets/smart-estate-towers.jpg";
import PartnerFormDialog from "./PartnerFormDialog";

const HERO_VIDEO = "/videos/hero-smart-estate.mp4";

type Slide = {
  lang: "en" | "ar";
  dir: "ltr" | "rtl";
  overline: string;
  headline: React.ReactNode;
  body: string;
};

const slides: Slide[] = [
  {
    lang: "en",
    dir: "ltr",
    overline: "Build · Design · Technology · EMEA",
    headline: (
      <>
        Interlinking the
        <br />
        <span className="italic font-extralight text-accent">build, design</span> &amp;
        <br />
        technology of tomorrow.
      </>
    ),
    body:
      "Siyakha Interlink is the integrated build, design and technology partner for development projects across EMEA — from fibre backbones and AI surveillance to tenant experience platforms inside refined real estate.",
  },
  {
    lang: "ar",
    dir: "rtl",
    overline: "بناء · تصميم · تكنولوجيا · الشرق الأوسط وأفريقيا",
    headline: (
      <>
        احلم أكثر، وأدخل
        <br />
        <span className="italic font-extralight text-accent">التكنولوجيا</span> إلى مساحاتك
        <br />
        لنرتقِ بمبانيك إلى المستقبل.
      </>
    ),
    body:
      "سياخا إنترلينك هي شريككم المتكامل في البناء والتصميم والتكنولوجيا لمشاريع التطوير عبر الشرق الأوسط وأفريقيا — من شبكات الألياف البصرية والمراقبة بالذكاء الاصطناعي إلى منصات تجربة المستأجرين داخل عقارات راقية.",
  },
];

const SmartEstateHero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const current = slides[index];

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
          <span>Siyakha Interlink · EMEA</span>
          <span className="hidden md:inline">No. 001 — A New Address for Intelligence</span>
        </div>
      </div>

      {/* Main editorial block */}
      <div className="relative z-10 flex-1 flex items-end pb-16 md:pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-5xl">
            <div
              key={index}
              dir={current.dir}
              lang={current.lang}
              className="animate-fade-in"
            >
              <p className={`overline mb-6 ${current.dir === "rtl" ? "tracking-normal text-sm" : ""}`}>
                {current.overline}
              </p>
              <h1
                className={`font-display font-light text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.02em] text-foreground ${
                  current.dir === "rtl" ? "leading-[1.25]" : "leading-[1.02]"
                }`}
              >
                {current.headline}
              </h1>
            </div>

            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 md:items-end">
              <div
                key={`body-${index}`}
                dir={current.dir}
                lang={current.lang}
                className="max-w-xl bg-background/40 backdrop-blur-md border border-foreground/10 rounded-lg px-6 py-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] animate-fade-in"
              >
                <p className="text-base md:text-lg text-foreground leading-relaxed">
                  {current.body}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <PartnerFormDialog
                  trigger={
                    <Button className="cta-primary text-sm">
                      Partner With Us <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button asChild variant="ghost" className="cta-secondary text-sm">
                  <a href="#capabilities">Explore Capabilities</a>
                </Button>
              </div>
            </div>

            {/* Slide indicators */}
            <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Hero language slides">
              {slides.map((s, i) => (
                <button
                  key={s.lang}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.lang === "en" ? "English" : "Arabic"}
                  onClick={() => setIndex(i)}
                  className={`h-px transition-all duration-500 ${
                    i === index ? "w-12 bg-foreground" : "w-6 bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hairline ledger */}
      <div className="relative z-10 border-t border-foreground/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-foreground/10">
            {[
              { k: "EMEA", v: "Build · Design · Tech" },
              { k: "50+", v: "Sites Engineered" },
              { k: "1,000+", v: "Cameras Installed" },
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
