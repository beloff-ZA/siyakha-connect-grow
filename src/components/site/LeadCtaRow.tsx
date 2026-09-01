import { Link } from "react-router-dom";
import { CONTACT } from "@/lib/contact";
import { enquiryHref } from "@/lib/leadForm";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Props {
  /** Service name or page slug used to preselect the enquiry context. */
  service?: string;
  /** Preselect a location, e.g. "Durban / KZN". */
  location?: string;
  primaryLabel?: string;
  whatsappMessage?: string;
  /** `dark` = on a dark band, `light` = on the page background. */
  tone?: "light" | "dark";
  /** Context label reported to analytics. */
  context: string;
}

/**
 * Consistent lead routing: one primary CTA into the enquiry form plus WhatsApp,
 * phone and email as secondary routes. Every click fires a tracked event.
 */
const LeadCtaRow = ({
  service,
  location,
  primaryLabel = "Request a Site Assessment",
  whatsappMessage = "Hi Siyakha, I'd like to request a site assessment.",
  tone = "light",
  context,
}: Props) => {
  const dark = tone === "dark";
  const primaryCls = dark
    ? "bg-background text-foreground hover:bg-background/90"
    : "bg-foreground text-background hover:bg-foreground/90";
  const secondaryCls = dark
    ? "border border-background/40 text-background hover:bg-background/10"
    : "border border-foreground/30 text-foreground hover:bg-foreground/[0.04]";
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors min-h-[44px]";

  return (
    <div className="flex flex-wrap gap-3">
      <Link to={enquiryHref(service, location)} className={`${base} ${primaryCls}`}>
        {primaryLabel}
      </Link>
      <a
        href={buildWhatsAppUrl(CONTACT.whatsappE164, whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("click_whatsapp", { context, service: service ?? null })}
        className={`${base} ${secondaryCls}`}
      >
        WhatsApp {CONTACT.whatsappDisplay}
      </a>
      <a
        href={`tel:${CONTACT.phoneE164}`}
        onClick={() => trackEvent("click_phone", { context, service: service ?? null })}
        className={`${base} ${secondaryCls}`}
      >
        Call {CONTACT.phoneDisplay}
      </a>
      <a
        href={`mailto:${CONTACT.email}`}
        onClick={() => trackEvent("click_email", { context, service: service ?? null })}
        className={`${base} ${secondaryCls}`}
      >
        Email us
      </a>
    </div>
  );
};

export default LeadCtaRow;
