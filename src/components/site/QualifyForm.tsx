import EnquiryForm from "./EnquiryForm";
import { CONTACT } from "@/lib/contact";

/**
 * "Talk to us" band on the homepage. The enquiry itself lives in EnquiryForm,
 * which stores every valid lead server-side.
 */
const QualifyForm = () => (
  <section id="qualify" className="bg-foreground text-background scroll-mt-24">
    <div id="enquiry" className="scroll-mt-24" />
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">Talk to us</p>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
            Tell us about
            <br />
            <span className="italic font-extralight">your project.</span>
          </h2>
          <p className="mt-8 text-background/70 leading-relaxed max-w-md">
            A short form so we can route your enquiry to the right engineer on the first call. No generic sales
            sequence — the answers below get a named reply within one business day.
          </p>
          <div className="mt-10 text-[13px] text-background/70 space-y-2">
            <p>
              {CONTACT.ownerName} ·{" "}
              <a className="hover:text-background" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </p>
            <p>
              <a className="hover:text-background" href={`tel:${CONTACT.phoneE164}`}>
                {CONTACT.phoneDisplay}
              </a>{" "}
              · WhatsApp {CONTACT.whatsappDisplay}
            </p>
            <p className="text-background/50">
              Serving Johannesburg &amp; Sandton and Durban &amp; KwaZulu-Natal, with national project delivery.
            </p>
          </div>
        </div>

        <EnquiryForm />
      </div>
    </div>
  </section>
);

export default QualifyForm;
