import { Link } from "react-router-dom";
import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";

const Header = () => {
  return (
    <header className="bg-background/90 border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          <Link to="/" aria-label="Siyakha Interlink home" className="flex items-center gap-4 md:gap-5">
            <img
              src={interlinkLogo}
              alt="Siyakha Interlink logo"
              className="h-9 w-auto md:h-11"
              decoding="async"
            />
            <span className="h-6 md:h-7 w-px bg-border" aria-hidden="true" />
            <img
              src={siyakhaWordmark}
              alt="Siyakha wordmark"
              className="h-5 w-auto md:h-6"
              decoding="async"
            />
            <span className="sr-only">Siyakha Interlink</span>
          </Link>

          <a
            href="mailto:nikita@siyakhatechnology.co.za?subject=Project%20Enquiry"
            className="text-[11px] uppercase tracking-[0.22em] text-foreground/80 hover:text-accent transition-colors"
          >
            Start a Conversation →
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
