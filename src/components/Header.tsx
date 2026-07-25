import { Link } from "react-router-dom";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { ChevronDown, Menu } from "lucide-react";
import CartDrawer from "@/components/shop/CartDrawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Header = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const audienceLinks = [
    { to: "/who-we-serve/estates", label: "Estates" },
    { to: "/who-we-serve/commercial", label: "Commercial" },
    { to: "/who-we-serve/schools", label: "Schools" },
    { to: "/who-we-serve/government", label: "Government & Border" },
  ];

  const solutionsLinks = [
    { to: "/capabilities/smart-estates", label: "Smart Estate Systems" },
    { to: "/capabilities/ai-surveillance", label: "AI Surveillance" },
    { to: "/capabilities/border-radar", label: "Border Radar" },
    { to: "/capabilities/fibre-connectivity", label: "Fibre & Connectivity" },
    { to: "/capabilities/command-centre", label: "Command Centre" },
  ];

  const companyLinks = [
    { to: "/about", label: "About" },
    { to: "/projects", label: "Projects" },
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
                Who We Serve <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-background border border-border shadow-lg min-w-[240px] py-2">
                  {audienceLinks.map((l) => (
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
                Solutions <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-background border border-border shadow-lg min-w-[260px] py-2">
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

            <Link
              to="/projects"
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors"
            >
              Projects
            </Link>

            <Link
              to="/about"
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors"
            >
              About
            </Link>

            <Link
              to="/shop"
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors"
            >
              Shop
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.22em] text-foreground/80 text-right">
              <span className="hidden sm:inline">{t("header.selectYourLanguage")}</span>
              <span className="sm:hidden">{t("header.language")}</span>
            </span>
            <LanguageToggle />
            <CartDrawer />

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="lg:hidden border border-border p-2 hover:bg-muted transition-colors"
                >
                  <Menu className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-xs flex flex-col">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle className="font-display font-light text-2xl tracking-tight">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Site navigation</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 pt-8 overflow-y-auto">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Who We Serve</p>
                    {audienceLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors py-1"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Solutions</p>
                    {solutionsLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors py-1"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Company</p>
                    {companyLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors py-1"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors py-1"
                  >
                    Shop
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
