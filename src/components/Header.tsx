import { Link } from "react-router-dom";
import interlinkLogo from "@/assets/interlink-logo.png";
import siyakhaWordmark from "@/assets/siyakha-wordmark.png";

const Header = () => {
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

          <a
            href="mailto:nikita@siyakhatechnology.co.za?subject=Project%20Enquiry"
            className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] md:tracking-[0.22em] text-foreground/80 hover:text-accent transition-colors text-right flex-shrink-0"
          >
            <span className="hidden sm:inline">Start a Conversation →</span>
            <span className="sm:hidden">Contact →</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
