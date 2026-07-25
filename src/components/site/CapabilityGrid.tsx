import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CAPABILITIES } from "@/content/capabilities";

const CapabilityGrid = () => (
  <section className="bg-foreground text-background">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-background/60 mb-4">
          What we build
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-background leading-[1.05]">
          Five capabilities.
          <br />
          <span className="italic font-extralight">One integrated system.</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-background/15 border border-background/15">
        {CAPABILITIES.map(({ slug, label, teaser, icon: Icon }) => (
          <Link
            key={slug}
            to={`/capabilities/${slug}`}
            className="group bg-foreground p-6 md:p-8 hover:bg-background/[0.06] transition-colors flex flex-col min-h-[240px]"
          >
            <div className="flex items-center justify-between mb-6">
              <Icon className="w-7 h-7 text-background" strokeWidth={1.25} />
              <ArrowUpRight className="h-4 w-4 text-background/40 group-hover:text-background transition-colors" />
            </div>
            <div className="font-display text-xl md:text-2xl text-background mb-3 tracking-tight leading-tight">
              {label}
            </div>
            <p className="text-[13px] text-background/70 leading-relaxed flex-1">{teaser}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CapabilityGrid;