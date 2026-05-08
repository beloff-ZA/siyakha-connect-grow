import { Link, useLocation, useNavigate } from "react-router-dom";
import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const goToRecentProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document
        .getElementById("recent-projects")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: "recent-projects" } });
      setTimeout(() => {
        document
          .getElementById("recent-projects")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  };

  const solutionsLinks = [
    { to: "/managed-it", label: "Managed IT" },
    { to: "/security-surveillance", label: "Security & Surveillance" },
    { to: "/cloud-networking", label: "Cloud & Networking" },
    { to: "/schools", label: "School Solutions" },
  ];

  const companyLinks = [
    { to: "/about", label: "About" },
    { to: "/regional-services", label: "Regional Services" },
    { to: "/partner-engineers", label: "Partner Engineers" },
  ];

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

          <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
            <div className="relative group">
              <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors py-2">
                Solutions <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-background border border-border shadow-lg min-w-[220px] py-2">
                  {solutionsLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors py-2">
                Company <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-background border border-border shadow-lg min-w-[220px] py-2">
                  {companyLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="/#recent-projects"
              onClick={goToRecentProjects}
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors"
            >
              Recent Projects
            </a>
          </nav>

          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
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
