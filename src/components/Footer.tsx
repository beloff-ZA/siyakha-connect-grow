import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <img
              src={interlinkLogo}
              alt="Siyakha Interlink logo"
              className="h-16 w-auto mb-6"
              loading="lazy"
            />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Build, design and technology for development projects across the
              UAE and EMEA. Engineered with intention. Delivered with faith.
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
              href="tel:+27815012993"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 mr-2">ZA</span>
              +27 81 501 2993
            </a>
            <a
              href="tel:+971508673469"
              className="block text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 mr-2">UAE</span>
              +971 50 867 3469
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>© {currentYear} Siyakha Interlink — All rights reserved.</span>
          <span>UAE · EMEA · Southern Africa</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
