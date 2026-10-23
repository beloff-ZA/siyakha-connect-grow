import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CAMPAIGN } from "@/content/decemberCleanup";
import rackPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";

/**
 * Premium editorial campaign popup built on the existing Radix/shadcn Dialog:
 * focus trap, Escape, scroll lock and focus restoration come from Radix.
 * Shown once per browser session, after a short delay, on the homepage only
 * (mounted from Index — never on authenticated/admin/portal routes). The
 * dismissed flag is a boolean in sessionStorage — no personal data is stored.
 */
const DISMISS_KEY = "siyakha.dec26.popup.dismissed";
const SHOW_DELAY_MS = 6000;

const DecemberPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage disabled — still allow the popup this load */
    }
    timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        window.sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* storage disabled — popup simply may reappear next load */
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden rounded-sm border-border p-0 max-h-[85vh] overflow-y-auto">
        <div className="relative h-36 sm:h-44 shrink-0">
          <img
            src={rackPoster.url}
            alt="Server cabinet with organised network cabling"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent mb-3">{CAMPAIGN.monthLabel} offer</p>
          <DialogTitle className="font-display font-light text-3xl sm:text-4xl tracking-[-0.02em] text-foreground leading-[1.05]">
            {CAMPAIGN.phrase}
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm text-foreground/80 leading-relaxed">
            {CAMPAIGN.offerHeadline} <span className="text-muted-foreground">{CAMPAIGN.offerExclusion}</span>
          </DialogDescription>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Request your preferred date — Siyakha will confirm availability, scope and quotation. Nothing is
            booked or confirmed at this stage.
          </p>
          <p className="mt-2 text-xs text-muted-foreground italic">{CAMPAIGN.draftNotice}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to={CAMPAIGN.path}
              onClick={() => handleOpenChange(false)}
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors min-h-[48px] rounded-sm"
            >
              {CAMPAIGN.cta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="inline-flex items-center justify-center border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.06] transition-colors min-h-[48px] rounded-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecemberPopup;
