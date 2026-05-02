import { useTranslation } from "react-i18next";

const TurnkeyManifesto = () => {
  const { t } = useTranslation();
  const sectors = (t("turnkey.sectors", { returnObjects: true }) as string[]) || [];
  const capabilities = (t("turnkey.capabilities", { returnObjects: true }) as { k: string; v: string }[]) || [];
  return (
    <section className="py-24 md:py-32 bg-foreground text-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-6">
              {t("turnkey.overline")}
            </p>
            <h2 className="font-display font-light text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em]">
              {t("turnkey.headlineL1")}
              <span className="italic font-extralight"> {t("turnkey.headlineL2")}</span>
            </h2>

            <div className="mt-8 flex flex-wrap gap-2">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="text-[10px] uppercase tracking-[0.22em] text-background/70 border border-background/20 px-3 py-1.5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <p className="text-base md:text-lg leading-relaxed text-background/80 font-light">
              {t("turnkey.body1Pre")} <span className="text-background">{t("turnkey.body1Highlight")}</span>
            </p>
            <p className="text-base md:text-lg leading-relaxed text-background/70 font-light">
              {t("turnkey.body2")}
            </p>

            <div className="border-l-2 border-background/30 pl-6 py-2 space-y-3">
              <p className="font-display text-lg md:text-xl text-background/90 leading-[1.9]">
                {t("turnkey.callout")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-background/10 border border-background/10">
              {capabilities.map((c) => (
                <div key={c.k} className="bg-foreground p-3.5 md:p-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-background/55 leading-tight mb-1.5">
                    {c.k}
                  </p>
                  <p className="text-[11px] text-background/80 leading-snug">
                    {c.v}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-background/60">
              <span>Interlink</span>
              <span className="h-px w-8 bg-background/30" aria-hidden="true" />
              <span>Siyakha</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TurnkeyManifesto;
