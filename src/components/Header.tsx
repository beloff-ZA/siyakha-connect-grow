import { Link } from "react-router-dom";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { DIVISIONS } from "@/content/divisions";
import { INDUSTRIES } from "@/content/industries";
import { BRAND } from "@/lib/brand";
import { enquiryHref } from "@/lib/leadForm";
import CartDrawer from "@/components/shop/CartDrawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";



const Header = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const serviceLinks = DIVISIONS.map((d) => ({ to: `/services/${d.slug}`, label: d.title }));

  const industryLinks = INDUSTRIES.map((i) => ({ to: `/industries/${i.slug}`, label: i.label }));

  const companyLinks = [
    { to: "/about", label: "About" },
    { to: "/projects", label: "Projects" },
    { to: "/partner-engineers", label: "Partner Engineers" },
    { to: "/shop", label: "Shop" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-10 py-2.5">
          <div className="flex items-center justify-center gap-x-5 gap-y-1.5 flex-wrap text-center">
            <a
              href="tel:+27877239183"
              aria-label="Call Siyakha on 087 723 9183"
              className="flex items-center gap-2.5 hover:text-background/80 transition-colors"
            >
              <Phone className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm md:text-base font-medium tracking-wide">087 723 9183</span>
              <span className="hidden sm:inline text-background/70" aria-hidden="true">·</span>
              <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-background/80">
                Speak to our AI agent, she will help you log a call faster
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-background/90 border-b border-border backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3 h-20 md:h-28">
            <Link to="/" aria-label={`${BRAND.name} home`} className="flex items-center min-w-0 flex-shrink">
              <img
                src={siyakhaWordmark}
                alt={`${BRAND.name} logo`}
                className="h-8 w-auto md:h-12 flex-shrink-0"
                decoding="async"
              />
              <span className="sr-only">{BRAND.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              <div className="relative group">
                <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors py-2">
                  Services <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="bg-background border border-border shadow-lg min-w-[260px] py-2">
                    {serviceLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <Link
                      to="/services"
                      className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground hover:bg-muted transition-colors border-t border-border mt-1 pt-2"
                    >
                      All services
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:text-foreground transition-colors py-2">
                  Industries <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="bg-background border border-border shadow-lg min-w-[280px] py-2">
                    {industryLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <Link
                      to="/industries"
                      className="block px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground/55 hover:text-foreground hover:bg-muted transition-colors border-t border-border mt-1 pt-2"
                    >
                      All industries
                    </Link>
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
                to={enquiryHref("Managed IT Services")}
                className="text-[11px] uppercase tracking-[0.22em] bg-foreground text-background px-4 py-2.5 hover:bg-foreground/90 transition-colors"
              >
                Get Help
              </Link>

              <Link
                to={enquiryHref("Office Networking & Structured Cabling")}
                className="text-[11px] uppercase tracking-[0.22em] border border-border px-4 py-2 text-foreground/85 hover:bg-muted transition-colors"
              >
                Request Assessment
              </Link>

              <Link
                to="/sign-in"
                className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground transition-colors"
              >
                Login
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
                    <a
                      href="tel:+27877239183"
                      className="flex items-center gap-3 bg-foreground text-background px-4 py-3"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium tracking-wide">087 723 9183</span>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-background/80">
                          Speak to our AI agent
                        </span>
                      </div>
                    </a>
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
                    <Link
                      to="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="block border border-border px-4 py-3 text-sm uppercase tracking-[0.18em] text-foreground hover:bg-muted transition-colors"
                    >
                      Login
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
