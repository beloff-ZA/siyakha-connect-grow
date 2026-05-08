import { Link } from "react-router-dom";
import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="bg-background/90 border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3 h-20 md:h-28">
          <Link to="/" aria-label="Siyakha Interlink home" className="flex items-center gap-2 md:gap-5 min-w-0 flex-shrink">
            <img
              src={interlinkLogo}
              alt="Siyakha Interlink logo"
              className="h-10 w-auto md:h-20 flex-shrink-0"
              decoding="async"
            />
            <span className="hidden sm:block h-6 md:h-7 w-px bg-border flex-shrink-0" aria-hidden="true" />
            <img
              src={siyakhaWordmark}
              alt="Siyakha wordmark"
              className="hidden sm:block h-5 w-auto md:h-6 flex-shrink-0"
              decoding="async"
            />
            <span className="sr-only">Siyakha Interlink</span>
          </Link>

          <p
            className="hidden md:block flex-1 text-center font-display font-extralight text-base lg:text-lg text-foreground/80 tracking-normal px-4 truncate"
          >
            {t("header.tagline")}
          </p>

          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            <Link
              to="/#recent-projects"
              className="hidden md:inline-block text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors"
            >
              Recent Projects
            </Link>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.22em] text-foreground/80 text-right">
              <span className="hidden sm:inline">{t("header.selectYourLanguage")}</span>
              <span className="sm:hidden">{t("header.language")}</span>
            </span>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
