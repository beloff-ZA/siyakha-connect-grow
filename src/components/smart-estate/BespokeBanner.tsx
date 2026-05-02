import { useTranslation } from "react-i18next";

const BespokeBanner = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 md:py-28 bg-background border-y border-foreground/10 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="overline mb-6">{t("bespoke.overline")}</p>
          <h2 className="font-display font-light text-3xl md:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.02em] text-foreground">
            {t("bespoke.headlineL1")}
            <span className="italic text-accent"> {t("bespoke.headlineL2Italic")}</span>{t("bespoke.headlineL2End")}
            <br className="hidden md:block" />
            {t("bespoke.headlineL3")}
          </h2>
          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("bespoke.body")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BespokeBanner;
