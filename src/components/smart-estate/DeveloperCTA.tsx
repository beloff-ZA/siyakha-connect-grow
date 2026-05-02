import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import PartnerFormDialog from "./PartnerFormDialog";
import { useTranslation } from "react-i18next";

const DeveloperCTA = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="overline mb-6">{t("developerCta.overline")}</p>
          <h2 className="font-display font-light text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.025em] text-foreground">
            {t("developerCta.headlineL1")}
            <span className="italic text-accent"> {t("developerCta.headlineItalic")}</span>
            <br />
            {t("developerCta.headlineL2")}
          </h2>

          <p className="mt-10 max-w-xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed">
            {t("developerCta.body")}
          </p>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <PartnerFormDialog
              defaultSubject={t("developerCta.dialogTitle") as string}
              title={t("developerCta.dialogTitle") as string}
              subtitle={t("developerCta.dialogSubtitle") as string}
              trigger={
                <Button className="cta-primary">
                  {t("developerCta.ctaConversation")} <ArrowUpRight className="h-4 w-4" />
                </Button>
              }
            />
            <Button asChild variant="ghost" className="cta-secondary">
              <a href="https://wa.me/27815012993?text=Hi%20Siyakha%20Interlink%2C%20I%27d%20like%20to%20discuss%20a%20development%20project." target="_blank" rel="noopener noreferrer">
                {t("developerCta.ctaWhatsapp")}
              </a>
            </Button>
          </div>

          <div className="mt-20 hairline" />
          <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("developerCta.footerLine")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeveloperCTA;
