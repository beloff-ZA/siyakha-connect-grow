import { HOME_FAQS, type Faq } from "@/content/faqs";

/** Accessible FAQ list. Native disclosure elements keep it keyboard-friendly. */
const FaqBand = ({ faqs = HOME_FAQS, heading = "Common questions" }: { faqs?: Faq[]; heading?: string }) => (
  <section id="faq" className="bg-background border-b border-foreground/10 scroll-mt-24">
    <div className="container mx-auto px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-3xl mb-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">FAQ</p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          {heading}
        </h2>
      </div>
      <div className="max-w-3xl divide-y divide-foreground/15 border-y border-foreground/15">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4 min-h-[44px] font-display text-base md:text-lg text-foreground tracking-tight">
              {f.q}
              <span
                aria-hidden="true"
                className="text-foreground/50 transition-transform group-open:rotate-45 text-xl leading-none"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FaqBand;
