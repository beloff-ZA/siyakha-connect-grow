import LeadMagnetDialog from "@/components/leads/LeadMagnetDialog";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const WHATSAPP_URL = buildWhatsAppUrl(
  "+27815012993",
  "Hi Siyakha, I'd like to schedule a consultation."
);

const FinalCtaBand = () => (
  <section className="bg-foreground text-background">
    <div className="container mx-auto px-6 lg:px-10 py-24 md:py-32">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
          Free Assessment · No Obligation
        </p>
        <h2 className="font-display font-light text-3xl md:text-6xl tracking-[-0.02em] leading-[1.02]">
          Let's build smarter
          <br />
          <span className="italic font-extralight">technology infrastructure</span>.
        </h2>
        <p className="mt-6 text-base md:text-lg text-background/75 leading-relaxed max-w-2xl">
          Whether you need managed IT, networking, surveillance or a complete digital transformation —
          Siyakha Technology is ready to help.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <LeadMagnetDialog
            kind="Schedule a Consultation"
            context="Homepage final CTA"
            trigger={
              <button className="bg-background text-foreground px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/90 transition-colors">
                Schedule a Consultation
              </button>
            }
          />
          <LeadMagnetDialog
            kind="Free Site Assessment"
            context="Homepage final CTA"
            trigger={
              <button className="border border-background/40 text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors">
                Get a Free Site Assessment
              </button>
            }
          />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-background/40 text-background px-6 py-3 text-[12px] uppercase tracking-[0.24em] hover:bg-background/10 transition-colors"
          >
            WhatsApp 081 501 2993
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCtaBand;