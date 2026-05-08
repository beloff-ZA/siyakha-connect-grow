import { CASE_STUDIES } from "@/content/caseStudies";
import CaseStudyCard from "./CaseStudyCard";

const FeaturedProjectsBand = () => (
  <section id="recent-projects" className="bg-background border-t border-foreground/10 scroll-mt-28">
    <div className="container mx-auto px-6 lg:px-10 py-20 md:py-28">
      <div className="max-w-3xl mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-4">
          Recent Projects
        </p>
        <h2 className="font-display font-light text-3xl md:text-5xl tracking-[-0.02em] text-foreground leading-[1.05]">
          Built. Delivered.
          <br />
          <span className="italic font-extralight">In production</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CASE_STUDIES.map((s) => (
          <CaseStudyCard key={s.slug} study={s} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProjectsBand;