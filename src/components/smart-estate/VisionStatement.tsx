import { useTranslation } from "react-i18next";

const VisionStatement = () => {
  const { t } = useTranslation();
  return (
    <section className="py-32 md:py-44 bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="overline mb-10">{t("vision.overline")}</p>

          <h2 className="font-display font-extralight text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-0.02em] text-foreground">
            {t("vision.headlineL1")}
            <span className="block italic text-accent mt-2">{t("vision.headlineL2")}</span>
          </h2>

          <div className="hairline mx-auto my-12 w-24" />

          <p className="font-display font-light text-xl md:text-2xl lg:text-3xl leading-[1.4] tracking-[-0.01em] text-foreground/80">
            {t("vision.subhead")} <span className="italic">{t("vision.see")}</span>, <span className="italic">{t("vision.feel")}</span> {t("vision.and")} <span className="italic">{t("vision.flow")}</span> {t("vision.different")}
          </p>

          <p className="mt-10 font-display text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t("vision.tagline1")} <span className="text-foreground">{t("vision.tagline2")}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionStatement;
