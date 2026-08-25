import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 py-16">
        {/* Join the Siyakha Network — installer & engineer support members */}
        <div className="mb-12 border border-border bg-foreground text-background p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <Wrench className="h-6 w-6 mt-1 flex-shrink-0" strokeWidth={1.25} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-background/60 mb-2">
                Siyakha Network · SMMEs & Engineers
              </p>
              <h3 className="font-display text-xl md:text-2xl font-light tracking-tight">
                Become a Siyakha support member
              </h3>
              <p className="text-sm text-background/70 mt-2 max-w-xl leading-relaxed">
                Register your company, list your skills and regions, upload certificates — and get
                deployed on live installer & engineering projects across Southern Africa.
              </p>
            </div>
          </div>
          <Link
            to="/partner-engineers"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-background border-b border-background/40 hover:border-background pb-1 self-start md:self-auto whitespace-nowrap"
          >
            Join the network
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <img
              src={interlinkLogo}
              alt="Siyakha Interlink logo"
              className="h-16 w-auto mb-6"
              loading="lazy"
            />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="text-left md:text-right space-y-4">
            <div className="flex items-center gap-5 md:justify-end">
              <img
                src={interlinkLogo}
                alt="Siyakha Interlink mark"
                className="h-12 w-auto"
                loading="lazy"
              />
              <span className="h-6 w-px bg-border" aria-hidden="true" />
              <img
                src={siyakhaWordmark}
                alt="Siyakha wordmark"
                className="h-5 w-auto"
                loading="lazy"
              />
            </div>
            <a
              href="mailto:nikita@siyakhatechnology.co.za"
              className="block font-display text-lg text-foreground hover:text-accent transition-colors"
            >
              nikita@siyakhatechnology.co.za
            </a>
            <a
              href="tel:+27877239183"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 mr-2">ZA</span>
              +27 87 723 9183
            </a>
            <a
              href="tel:+971508673469"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >

              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 mr-2">EMEA</span>
              +971 50 867 3469
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>© {currentYear} Siyakha Interlink — {t("footer.rights")}</span>
          <div className="flex items-center gap-5">
            <Link to="/sign-in" className="hover:text-foreground transition-colors">
              Client Sign In
            </Link>
            <span>{t("footer.regions")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
