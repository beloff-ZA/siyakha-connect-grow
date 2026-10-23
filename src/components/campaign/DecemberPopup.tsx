import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { CAMPAIGN } from "@/content/decemberCleanup";
import rackPoster from "@/assets/hero-cable-management-poster.jpg.asset.json";

/**
 * Premium editorial campaign popup. Shown once per browser session, after a
 * short delay, on marketing pages only (mounted from the homepage — never on
 * authenticated/admin/portal routes). Closes via button, Escape or backdrop;
 * focus returns to the element that had it before opening. The dismissed flag
 * is a boolean in sessionStorage — no personal data is stored.
 */
const DISMISS_KEY = "siyakha.dec26.popup.dismissed";
const SHOW_DELAY_MS = 6000;

const DecemberPopup = () => {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage disabled — still allow the popup this load */
    }
    timer = window.setTimeout(() => {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage disabled — popup simply may reappear next load */
    }
    returnFocusRef.current?.focus?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm motion-safe:animate-[fadeIn_0.4s_ease-out]"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dec-popup-title"
        className="relative w-full max-w-lg bg-background border border-border rounded-sm overflow-hidden shadow-strong motion-safe:animate-[fadeIn_0.5s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close December offer"
          className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative h-36 sm:h-44">
          <img
            src={rackPoster.url}
            alt="Neatly managed server cabinet cabling by Siyakha"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent mb-3">{CAMPAIGN.monthLabel} offer</p>
          <h2
            id="dec-popup-title"
            className="font-display font-light text-3xl sm:text-4xl tracking-[-0.02em] text-foreground leading-[1.05]"
          >
            {CAMPAIGN.phrase}
          </h2>
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
            {CAMPAIGN.offerHeadline} <span className="text-muted-foreground">{CAMPAIGN.offerExclusion}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground italic">{CAMPAIGN.draftNotice}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to={CAMPAIGN.path}
              onClick={close}
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-accent-hover transition-colors min-h-[48px] rounded-sm"
            >
              {CAMPAIGN.cta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center justify-center border border-foreground/30 text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-foreground/[0.06] transition-colors min-h-[48px] rounded-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecemberPopup;
