import { Link } from "react-router-dom";
import { Phone, MessageCircle, ClipboardCheck } from "lucide-react";
import { CONTACT } from "@/lib/contact";
import { enquiryHref } from "@/lib/leadForm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

/**
 * Persistent mobile action bar: Call, WhatsApp and Request Assessment.
 * Hidden on large screens where the header already exposes these routes.
 */
const StickyContactBar = () => {
  const item =
    "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-[10px] uppercase tracking-[0.16em]";
  return (
    <>
      {/* Spacer so the bar never covers page content or the footer. */}
      <div className="h-[56px] lg:hidden" aria-hidden="true" />
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-foreground text-background border-t border-background/20 pb-[env(safe-area-inset-bottom)]">
        <nav aria-label="Quick contact" className="flex items-stretch divide-x divide-background/20">
          <a
            href={`tel:${CONTACT.phoneE164}`}
            onClick={() => trackEvent("click_phone", { context: "sticky_bar", service: null })}
            className={item}
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            Call
          </a>
          <a
            href={buildWhatsAppUrl(CONTACT.whatsappE164, "Hi Siyakha, I'd like some help with our technology.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("click_whatsapp", { context: "sticky_bar", service: null })}
            className={item}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            WhatsApp
          </a>
          <Link to={enquiryHref("Office Networking & Structured Cabling")} className={item}>
            <ClipboardCheck className="h-4 w-4" strokeWidth={1.5} />
            Assessment
          </Link>
        </nav>
      </div>
    </>
  );
};

export default StickyContactBar;
