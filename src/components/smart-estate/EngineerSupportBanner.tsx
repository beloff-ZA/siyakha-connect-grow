import { ArrowRight, Headphones, Wrench, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ICONS = [Wrench, Headphones, ShieldCheck];

const EngineerSupportBanner = () => {
  const { t } = useTranslation();
  const pillars = (t("engineerSupport.pillars", { returnObjects: true }) as { title: string; body: string }[]) || [];
  return (
    <section className="relative bg-foreground text-background border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-14">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              {t("engineerSupport.overline")}
            </p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-[-0.02em]">
              {t("engineerSupport.headlineP1")}
              <span className="italic font-extralight"> {t("engineerSupport.headlineItalic")} </span>
              {t("engineerSupport.headlineP2")}
              <br className="hidden md:block" />
              <span className="text-background/70"> {t("engineerSupport.headlineP3")}</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base md:text-lg text-background/75 leading-relaxed font-light">
              {t("engineerSupport.bodyPre")}{" "}
              <span className="text-background">{t("engineerSupport.bodyHighlight1")}</span> {t("engineerSupport.bodyAnd")}{" "}
              <span className="text-background">{t("engineerSupport.bodyHighlight2")}</span>{" "}
              {t("engineerSupport.bodyPost")}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link
                to="/partner-engineers"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-background hover:text-background/70 transition-colors border-b border-background/40 hover:border-background/20 pb-1"
              >
                Become a partner engineer
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <a
                href="mailto:nikita@siyakhatechnology.co.za?subject=L2%20%26%20L3%20Engineer%20Support%20Enquiry"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-background/70 hover:text-background transition-colors border-b border-background/20 hover:border-background/40 pb-1"
              >
                {t("engineerSupport.cta")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-background/10 border border-background/10">
          {pillars.map((p, i) => {
            const Icon = ICONS[i] || Wrench;
            return (
              <div
                key={p.title}
                className="bg-foreground p-8 md:p-10 hover:bg-background/[0.04] transition-colors"
              >
                <Icon className="h-7 w-7 text-background mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-background tracking-tight mb-3">
                  {p.title}
                </h3>
                <p className="text-sm md:text-base text-background/70 leading-relaxed">
                  {p.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.22em] text-background/60">
          <span>South Africa</span>
          <span className="opacity-30">·</span>
          <span>Namibia</span>
          <span className="opacity-30">·</span>
          <span>Botswana</span>
          <span className="opacity-30">·</span>
          <span>Zimbabwe</span>
          <span className="opacity-30">·</span>
          <span>Mozambique</span>
          <span className="opacity-30">·</span>
          <span>Eswatini · Lesotho</span>
        </div>
      </div>
    </section>
  );
};

export default EngineerSupportBanner;