import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getCaseStudy } from "@/content/caseStudies";

const SLOTS = [
  { audience: "Estates", slug: "exmile-student-accommodation" },
  { audience: "Commercial", slug: "franchise-firewall-wifi-rollout" },
  { audience: "Schools", slug: "marist-brothers-linmeyer" },
];

const CaseStudiesTriad = () => (
  <section id="case-studies" className="bg-background border-b border-foreground/10 scroll-mt-28">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
            Case studies
          </p>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
            One from each.
          </h2>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:text-foreground"
        >
          All projects <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {SLOTS.map(({ audience, slug }) => {
          const study = getCaseStudy(slug);
          if (!study) {
            return (
              <div key={audience} className="bg-background p-8 flex flex-col min-h-[320px]">
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-4">
                  {audience}
                </p>
                <div className="font-display text-xl text-foreground/60 flex-1 flex items-center italic">
                  New project — coming soon
                </div>
              </div>
            );
          }
          return (
            <Link
              key={slug}
              to={`/case-studies/${slug}`}
              className="group bg-background hover:bg-foreground/[0.03] transition-colors flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-foreground/5">
                <img
                  src={study.hero}
                  alt={study.title}
                  className="w-full h-full object-cover grayscale group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 mb-3">
                  {audience} · {study.location}
                </p>
                <div className="font-display text-lg md:text-xl text-foreground tracking-tight leading-snug mb-3">
                  {study.title}
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed flex-1">
                  {study.summary}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 group-hover:text-foreground">
                  Read case study <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CaseStudiesTriad;