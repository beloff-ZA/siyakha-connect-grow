import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const FaithSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 md:py-28 bg-secondary border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
        <div className="text-center">
          <BookOpen className="mx-auto h-8 w-8 text-accent mb-5" strokeWidth={1.5} />
          <p className="overline mb-5">{t("faith.overline")}</p>
          <h2 className="font-display font-light text-3xl md:text-5xl leading-[1.1] tracking-[-0.02em] text-foreground max-w-3xl mx-auto">
            {t("faith.headlineL1")}
            <br />
            <span className="italic text-accent">{t("faith.headlineL2Italic")}</span> {t("faith.headlineL2End")}
          </h2>

          <p className="mt-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("faith.body")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaithSection;

