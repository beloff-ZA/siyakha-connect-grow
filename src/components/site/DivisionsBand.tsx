import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { DIVISIONS } from "@/content/divisions";

/** Five revenue divisions, each linking to a working service route. */
const DivisionsBand = () => (
  <section id="services" className="bg-foreground text-background scroll-mt-24">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-12 md:mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">What we do</p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] leading-[1.05]">
          Five divisions.
          <br />
          <span className="italic font-extralight">One accountable team.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-background/15 border border-background/15">
        {DIVISIONS.map(({ slug, title, teaser, icon: Icon }) => (
          <Link
            key={slug}
            to={`/services/${slug}`}
            className="group bg-foreground p-6 md:p-8 hover:bg-background/[0.07] transition-colors flex flex-col min-h-[220px]"
          >
            <div className="flex items-center justify-between mb-6">
              <Icon className="w-7 h-7 text-background" strokeWidth={1.25} />
              <ArrowUpRight className="h-4 w-4 text-background/40 group-hover:text-background transition-colors" />
            </div>
            <h3 className="font-display text-xl md:text-2xl text-background mb-3 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-[13px] text-background/70 leading-relaxed flex-1">{teaser}</p>
          </Link>
        ))}
        <Link
          to="/services"
          className="group bg-foreground p-6 md:p-8 hover:bg-background/[0.07] transition-colors flex items-end min-h-[220px]"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-background/70 group-hover:text-background">
            All services <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  </section>
);

export default DivisionsBand;
