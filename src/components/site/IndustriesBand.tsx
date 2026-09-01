import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { INDUSTRIES } from "@/content/industries";

/** Industries we serve, each linking to a dedicated page with an enquiry route. */
const IndustriesBand = () => (
  <section id="industries" className="bg-background border-b border-foreground/10 scroll-mt-24">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-12 md:mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Who we work with
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Built around your
          <br />
          <span className="italic font-extralight">industry's real problems.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {INDUSTRIES.map(({ slug, label, teaser, icon: Icon }) => (
          <Link
            key={slug}
            to={`/industries/${slug}`}
            className="group bg-background p-6 md:p-8 hover:bg-foreground/[0.04] transition-colors flex flex-col min-h-[210px]"
          >
            <div className="flex items-center justify-between mb-6">
              <Icon className="w-7 h-7 text-foreground" strokeWidth={1.25} />
              <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="font-display text-lg md:text-xl text-foreground mb-3 tracking-tight leading-snug">
              {label}
            </h3>
            <p className="text-[13px] text-foreground/70 leading-relaxed flex-1">{teaser}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/industries"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground border-b border-foreground/25 pb-1"
        >
          All industries <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </section>
);

export default IndustriesBand;
