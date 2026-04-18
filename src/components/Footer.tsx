import interlinkLogo from "@/assets/interlink-logo.png";

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
              className="h-10 w-auto mb-6"
              loading="lazy"
            />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Build, design and technology for development projects across the
              UAE and EMEA. Engineered with intention. Delivered with faith.
            </p>
          </div>

          <div className="text-left md:text-right space-y-3">
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
              +27 81 501 2993
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
